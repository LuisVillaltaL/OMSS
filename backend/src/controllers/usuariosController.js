// RUTA: backend/src/controllers/usuariosController.js
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Helper para registrar en la auditoria
async function logAuditoria(client, { usuarioId, usuarioNombre, usuarioRol, accion, campo = null, valorNuevo = null, ip = null }) {
  await client.query(
    `INSERT INTO auditoria
       (usuario_id, usuario_nombre, usuario_rol, accion, campo, valor_nuevo, ip_origen)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [usuarioId, usuarioNombre, usuarioRol, accion, campo, valorNuevo, ip]
  );
}

// Listar empleados con filtros avanzados y busqueda
const listar = async (req, res, next) => {
  try {
    const { q, rol, departamento_id, activo, page = 1, limit = 100 } = req.query;

    const conds = [];
    const params = [];
    let p = 1;

    if (rol) {
      conds.push(`u.rol = $${p++}`);
      params.push(rol);
    }

    if (departamento_id) {
      conds.push(`u.departamento_id = $${p++}`);
      params.push(departamento_id);
    }

    if (activo !== undefined && activo !== '') {
      conds.push(`u.activo = $${p++}`);
      params.push(activo === 'true');
    }

    if (q) {
      conds.push(`(u.nombre ILIKE $${p} OR u.apellido ILIKE $${p} OR u.correo ILIKE $${p} OR u.perfil ILIKE $${p})`);
      params.push(`%${q}%`);
      p++;
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    
    // Obtener total de registros para paginacion
    const countSql = `
      SELECT COUNT(*) AS total 
      FROM usuarios u 
      ${where}
    `;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].total || 0);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitParam = parseInt(limit);
    
    params.push(limitParam);
    const limitIdx = p++;
    params.push(offset);
    const offsetIdx = p++;

    const listSql = `
      SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.correo, 
        u.rol, 
        u.perfil, 
        u.activo, 
        u.creado_en, 
        u.ultimo_login, 
        u.departamento_id, 
        u.modulos_permitidos,
        d.nombre AS departamento_nombre
      FROM usuarios u
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      ${where}
      ORDER BY u.nombre ASC, u.apellido ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const { rows } = await pool.query(listSql, params);

    res.json({
      data: rows,
      total,
      page: parseInt(page),
      limit: limitParam
    });
  } catch (err) {
    next(err);
  }
};

// Obtener detalles de un usuario
const obtener = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        u.id, 
        u.nombre, 
        u.apellido, 
        u.correo, 
        u.rol, 
        u.perfil, 
        u.activo, 
        u.creado_en, 
        u.ultimo_login, 
        u.departamento_id, 
        u.modulos_permitidos,
        d.nombre AS departamento_nombre
      FROM usuarios u
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      WHERE u.id = $1
    `;

    const { rows } = await pool.query(sql, [id]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Crear nuevo usuario (Admin only)
const crear = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { nombre, apellido, correo, password, rol, perfil, departamento_id, activo = true } = req.body;

    if (!nombre || !apellido || !correo || !password || !rol) {
      return res.status(400).json({ error: 'Nombre, apellido, correo, password y rol son requeridos' });
    }

    await client.query('BEGIN');

    // Verificar si el correo ya existe
    const existCheck = await client.query('SELECT id FROM usuarios WHERE correo = $1', [correo.trim().toLowerCase()]);
    if (existCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El correo ya se encuentra registrado' });
    }

    // Cifrar contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    let defaultModulos = [];
    if (rol === 'admin') {
      defaultModulos = ['tickets', 'activos', 'empleados', 'compras', 'ventas'];
    } else if (rol === 'tecnico_l1' || rol === 'tecnico_l2') {
      defaultModulos = ['tickets', 'activos'];
    } else if (rol === 'usuario_final') {
      defaultModulos = ['tickets'];
    }

    const sql = `
      INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol, perfil, departamento_id, activo, modulos_permitidos)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, nombre, apellido, correo, rol, perfil, departamento_id, activo, modulos_permitidos, creado_en
    `;

    const finalPerfil = ['tecnico_l1', 'tecnico_l2'].includes(rol)
      ? (['senior', 'semi_senior', 'junior'].includes(perfil) ? perfil : 'junior')
      : null;

    const insertRes = await client.query(sql, [
      nombre.trim(),
      apellido.trim(),
      correo.trim().toLowerCase(),
      passwordHash,
      rol,
      finalPerfil,
      departamento_id || null,
      activo,
      defaultModulos
    ]);

    const nuevoUsuario = insertRes.rows[0];

    // Registrar en auditoria
    await logAuditoria(client, {
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'crear',
      campo: 'usuario',
      valorNuevo: `Usuario creado: ${nuevoUsuario.correo} (${nuevoUsuario.rol})`,
      ip: req.ip
    });

    await client.query('COMMIT');
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Actualizar usuario existente (Admin only)
const actualizar = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, password, rol, perfil, departamento_id, activo } = req.body;

    if (!nombre || !apellido || !correo || !rol) {
      return res.status(400).json({ error: 'Nombre, apellido, correo y rol son requeridos' });
    }

    await client.query('BEGIN');

    // Verificar si el usuario existe
    const userCheck = await client.query('SELECT id, password_hash FROM usuarios WHERE id = $1', [id]);
    if (!userCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar si el correo ya esta registrado por otro usuario
    const existCheck = await client.query('SELECT id FROM usuarios WHERE correo = $1 AND id <> $2', [correo.trim().toLowerCase(), id]);
    if (existCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El correo ya se encuentra registrado por otro usuario' });
    }

    const finalPerfil = ['tecnico_l1', 'tecnico_l2'].includes(rol)
      ? (['senior', 'semi_senior', 'junior'].includes(perfil) ? perfil : 'junior')
      : null;

    let sql;
    let params;

    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      sql = `
        UPDATE usuarios
        SET nombre = $1, apellido = $2, correo = $3, password_hash = $4, rol = $5, perfil = $6, departamento_id = $7, activo = $8
        WHERE id = $9
        RETURNING id, nombre, apellido, correo, rol, perfil, departamento_id, activo
      `;
      params = [
        nombre.trim(),
        apellido.trim(),
        correo.trim().toLowerCase(),
        passwordHash,
        rol,
        finalPerfil,
        departamento_id || null,
        activo,
        id
      ];
    } else {
      sql = `
        UPDATE usuarios
        SET nombre = $1, apellido = $2, correo = $3, rol = $4, perfil = $5, departamento_id = $6, activo = $7
        WHERE id = $8
        RETURNING id, nombre, apellido, correo, rol, perfil, departamento_id, activo
      `;
      params = [
        nombre.trim(),
        apellido.trim(),
        correo.trim().toLowerCase(),
        rol,
        finalPerfil,
        departamento_id || null,
        activo,
        id
      ];
    }

    const updateRes = await client.query(sql, params);
    const usuarioActualizado = updateRes.rows[0];

    // Registrar en auditoria
    await logAuditoria(client, {
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'modificar',
      campo: 'usuario',
      valorNuevo: `Usuario actualizado: ${usuarioActualizado.correo} (${usuarioActualizado.rol})`,
      ip: req.ip
    });

    await client.query('COMMIT');
    res.json(usuarioActualizado);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Alternar estado activo de un usuario (Admin only)
const toggleEstado = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const userCheck = await client.query('SELECT id, activo, correo FROM usuarios WHERE id = $1', [id]);
    if (!userCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Evitar que el propio admin se desactive a si mismo
    if (id === req.user.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta de administrador' });
    }

    const nuevoEstado = !userCheck.rows[0].activo;

    await client.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [nuevoEstado, id]);

    // Registrar en auditoria
    await logAuditoria(client, {
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'modificar',
      campo: 'usuario_activo',
      valorNuevo: `Estado activo cambiado a ${nuevoEstado} para ${userCheck.rows[0].correo}`,
      ip: req.ip
    });

    await client.query('COMMIT');
    res.json({ id, activo: nuevoEstado, message: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} con exito` });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Actualizar módulos permitidos de un usuario (Admin only)
const actualizarPermisos = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { modulos_permitidos } = req.body;

    if (!Array.isArray(modulos_permitidos)) {
      return res.status(400).json({ error: 'modulos_permitidos debe ser un arreglo de strings' });
    }

    await client.query('BEGIN');

    // Verificar si el usuario existe
    const userCheck = await client.query('SELECT id, correo, rol FROM usuarios WHERE id = $1', [id]);
    if (!userCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const sql = `
      UPDATE usuarios
      SET modulos_permitidos = $1
      WHERE id = $2
      RETURNING id, nombre, apellido, correo, rol, modulos_permitidos
    `;

    const updateRes = await client.query(sql, [modulos_permitidos, id]);
    const usuarioActualizado = updateRes.rows[0];

    // Registrar en auditoria
    await logAuditoria(client, {
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'modificar',
      campo: 'usuario_permisos',
      valorNuevo: `Permisos actualizados para ${usuarioActualizado.correo}: ${modulos_permitidos.join(', ')}`,
      ip: req.ip
    });

    await client.query('COMMIT');
    res.json(usuarioActualizado);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  toggleEstado,
  actualizarPermisos
};

