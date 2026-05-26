const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { jwtSecret, jwtRefresh, jwtExpiry, bcryptRounds } = require('../config/env');

// ── insertar en log de auditoría ───────────────────────
async function logAuditoria(client, { ticketId = null, usuarioId, usuarioNombre,
  usuarioRol, accion, campo = null, valorNuevo = null, ip = null }) {
  await client.query(
    `INSERT INTO auditoria
       (ticket_id, usuario_id, usuario_nombre, usuario_rol,
        accion, campo, valor_nuevo, ip_origen)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [ticketId, usuarioId, usuarioNombre, usuarioRol,
     accion, campo, valorNuevo, ip]
  );
}

// ── POST /api/auth/login ───────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    // Buscar usuario
    const { rows } = await pool.query(
      `SELECT id, nombre, apellido, correo, password_hash, rol, perfil,
              intentos_fallidos, bloqueado_hasta, activo, modulos_permitidos
       FROM usuarios
       WHERE correo = $1`,
      [correo]
    );

    const user = rows[0];

    // Respuesta genérica para no revelar si el correo existe
    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Cuenta desactivada
    if (!user.activo) {
      return res.status(401).json({ error: 'Cuenta desactivada. Contacta al administrador.' });
    }

    // RNF-4: verificar bloqueo temporal
    if (user.bloqueado_hasta && new Date() < new Date(user.bloqueado_hasta)) {
      const min = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
      return res.status(429).json({
        error: `Cuenta bloqueada. Intenta en ${min} minuto(s).`,
        bloqueado_hasta: user.bloqueado_hasta,
      });
    }

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      const intentos = (user.intentos_fallidos || 0) + 1;
      const bloquear = intentos >= 5
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : null;

      await pool.query(
        `UPDATE usuarios
         SET intentos_fallidos = $1, bloqueado_hasta = $2
         WHERE id = $3`,
         [intentos, bloquear, user.id]
      );

      return res.status(401).json({
        error: intentos >= 5
          ? 'Cuenta bloqueada 15 minutos por demasiados intentos fallidos'
          : `Correo o contraseña incorrectos (intento ${intentos}/5)`,
      });
    }

    // Login exitoso — resetear intentos
    await pool.query(
      `UPDATE usuarios
       SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Generar tokens
    let modulos = user.modulos_permitidos;
    if (!modulos || modulos.length === 0) {
      if (user.rol === 'admin') {
        modulos = ['tickets', 'activos', 'empleados', 'compras', 'ventas'];
      } else if (user.rol === 'tecnico_l1' || user.rol === 'tecnico_l2') {
        modulos = ['tickets', 'activos'];
      } else {
        modulos = ['tickets'];
      }
    }

    const payload = {
      id:      user.id,
      correo:  user.correo,
      rol:     user.rol,
      perfil:  user.perfil,
      nombre:  `${user.nombre} ${user.apellido}`,
      modulos_permitidos: modulos,
    };

    const accessToken  = jwt.sign(payload, jwtSecret,  { expiresIn: jwtExpiry });
    const refreshToken = jwt.sign({ id: user.id }, jwtRefresh, { expiresIn: '30d' });

    // Guardar refresh token en BD
    await pool.query(
      `INSERT INTO sesiones (usuario_id, refresh_token, ip_origen, expira_en)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [user.id, refreshToken, req.ip]
    );

    // Log de auditoría
    await logAuditoria(pool, {
      usuarioId:      user.id,
      usuarioNombre:  payload.nombre,
      usuarioRol:     user.rol,
      accion:         'crear',
      campo:          'sesion',
      valorNuevo:     'login_exitoso',
      ip:             req.ip,
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id:      user.id,
        nombre:  payload.nombre,
        correo:  user.correo,
        rol:     user.rol,
        perfil:  user.perfil,
        modulos_permitidos: modulos,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ─────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken requerido' });
    }

    // Verificar firma
    let payload;
    try {
      payload = jwt.verify(refreshToken, jwtRefresh);
    } catch {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    // Verificar en BD que no esté revocado
    const { rows } = await pool.query(
      `SELECT s.id, s.revocada, u.id AS uid, u.correo, u.rol,
              u.perfil, u.nombre, u.apellido, u.activo, u.modulos_permitidos
       FROM sesiones s
       JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.refresh_token = $1 AND s.expira_en > NOW()`,
      [refreshToken]
    );

    if (!rows[0] || rows[0].revocada || !rows[0].activo) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    const u = rows[0];
    let modulos = u.modulos_permitidos;
    if (!modulos || modulos.length === 0) {
      if (u.rol === 'admin') {
        modulos = ['tickets', 'activos', 'empleados', 'compras', 'ventas'];
      } else if (u.rol === 'tecnico_l1' || u.rol === 'tecnico_l2') {
        modulos = ['tickets', 'activos'];
      } else {
        modulos = ['tickets'];
      }
    }

    const newAccess = jwt.sign(
      { id: u.uid, correo: u.correo, rol: u.rol, perfil: u.perfil,
        nombre: `${u.nombre} ${u.apellido}`, modulos_permitidos: modulos },
      jwtSecret,
      { expiresIn: jwtExpiry }
    );

    return res.json({ accessToken: newAccess });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ──────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await pool.query(
        `UPDATE sesiones SET revocada = TRUE WHERE refresh_token = $1`,
        [refreshToken]
      );
    }

    return res.json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
const me = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.correo, u.rol, u.perfil,
              u.ultimo_login, u.creado_en, d.nombre AS departamento, u.modulos_permitidos
       FROM usuarios u
       LEFT JOIN departamentos d ON u.departamento_id = d.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });

    const u = rows[0];
    let modulos = u.modulos_permitidos;
    if (!modulos || modulos.length === 0) {
      if (u.rol === 'admin') {
        modulos = ['tickets', 'activos', 'empleados', 'compras', 'ventas'];
      } else if (u.rol === 'tecnico_l1' || u.rol === 'tecnico_l2') {
        modulos = ['tickets', 'activos'];
      } else {
        modulos = ['tickets'];
      }
    }
    u.modulos_permitidos = modulos;

    return res.json(u);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout, me };