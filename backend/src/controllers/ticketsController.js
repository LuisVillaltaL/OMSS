const pool = require('../config/db');

// ── Helper: 
const ticketCodigo = num => 'INC-' + String(num).padStart(6, '0');

// ── Helper: log de auditoría ───────────────────────────────────
async function logAuditoria(client, { ticketId, usuarioId, usuarioNombre, usuarioRol,
  accion, campo = null, valorAnterior = null, valorNuevo = null, ip = null }) {
  await client.query(
    `INSERT INTO auditoria
       (ticket_id, usuario_id, usuario_nombre, usuario_rol,
        accion, campo, valor_anterior, valor_nuevo, ip_origen)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [ticketId, usuarioId, usuarioNombre, usuarioRol,
     accion, campo, valorAnterior, valorNuevo, ip]
  );
}

// ── Helper: notificación ───────────────────────────────────────
async function crearNotificacion(client, { usuarioId, ticketId, tipo, titulo, mensaje = null }) {
  await client.query(
    `INSERT INTO notificaciones (usuario_id, ticket_id, tipo, titulo, mensaje)
     VALUES ($1,$2,$3,$4,$5)`,
    [usuarioId, ticketId, tipo, titulo, mensaje]
  );
}

// ══════════════════════════════════════════════════════════════
// Obtiene la API /api/tickets
// ══════════════════════════════════════════════════════════════
const listar = async (req, res, next) => {
  try {
    const {
      estado, prioridad, asignado_a, categoria_id, sla_estado,
      page = 1, limit = 25, q
    } = req.query;

    const conds  = [];
    const params = [];
    let p = 1;

    // RF-3.4: usuario_final solo ve sus propios tickets
    if (req.user.rol === 'usuario_final') {
      conds.push(`t.reportado_por = $${p++}`);
      params.push(req.user.id);
    }

    if (estado)       { conds.push(`t.estado = $${p++}`);       params.push(estado); }
    if (prioridad)    { conds.push(`t.prioridad = $${p++}`);    params.push(prioridad); }
    if (asignado_a)   { conds.push(`t.asignado_a = $${p++}`);   params.push(asignado_a); }
    if (categoria_id) { conds.push(`t.categoria_id = $${p++}`); params.push(categoria_id); }
    if (sla_estado)   { conds.push(`t.sla_estado = $${p++}`);   params.push(sla_estado); }
    if (q) {
      conds.push(`(t.titulo ILIKE $${p} OR ticket_codigo(t.numero) ILIKE $${p})`);
      params.push(`%${q}%`); p++;
    }

    const where  = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT
            t.id,
            ticket_codigo(t.numero)              AS codigo,
            t.titulo,
            t.prioridad,
            t.estado,
            t.canal,
            t.sla_estado,
            t.sla_vence_en,
            t.sla_pausa_total,
            t.sla_pausado_en,
            t.creado_en,
            t.resuelto_en,
            CONCAT(ur.nombre,' ',ur.apellido)    AS reportado_por_nombre,
            ur.correo                            AS reportado_por_correo,
            CONCAT(ut.nombre,' ',ut.apellido)    AS asignado_a_nombre,
            ut.perfil                            AS asignado_perfil,
            c.nombre                             AS categoria,
            sc.nombre                            AS subcategoria,
            a.codigo                             AS activo_codigo,
            a.nombre                             AS activo_nombre
         FROM tickets t
         LEFT JOIN usuarios       ur ON t.reportado_por   = ur.id
         LEFT JOIN usuarios       ut ON t.asignado_a      = ut.id
         LEFT JOIN categorias     c  ON t.categoria_id    = c.id
         LEFT JOIN subcategorias  sc ON t.subcategoria_id = sc.id
         LEFT JOIN activos        a  ON t.activo_id       = a.id
         ${where}
         ORDER BY
           CASE t.prioridad
             WHEN 'critico' THEN 1 WHEN 'alto' THEN 2
             WHEN 'medio'   THEN 3 ELSE 4
           END,
           t.creado_en DESC
         LIMIT $${p} OFFSET $${p + 1}`,
        [...params, parseInt(limit), offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM tickets t ${where}`, params
      ),
    ]);

    res.json({
      data:  data.rows,
      total: parseInt(count.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)),
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════
// GET /api/tickets/:id
// ══════════════════════════════════════════════════════════════
const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
          t.*,
          ticket_codigo(t.numero)              AS codigo,
          CONCAT(ur.nombre,' ',ur.apellido)    AS reportado_por_nombre,
          ur.correo                            AS reportado_por_correo,
          CONCAT(ut.nombre,' ',ut.apellido)    AS asignado_a_nombre,
          ut.perfil                            AS asignado_perfil,
          c.nombre                             AS categoria,
          sc.nombre                            AS subcategoria,
          a.codigo                             AS activo_codigo,
          a.nombre                             AS activo_nombre
       FROM tickets t
       LEFT JOIN usuarios      ur ON t.reportado_por   = ur.id
       LEFT JOIN usuarios      ut ON t.asignado_a      = ut.id
       LEFT JOIN categorias    c  ON t.categoria_id    = c.id
       LEFT JOIN subcategorias sc ON t.subcategoria_id = sc.id
       LEFT JOIN activos       a  ON t.activo_id       = a.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Ticket no encontrado' });

    // RF-3.4: usuario_final solo puede ver sus propios tickets
    if (req.user.rol === 'usuario_final' && rows[0].reportado_por !== req.user.id) {
      return res.status(403).json({ error: 'Sin acceso a este ticket' });
    }

    // Cargar notas, adjuntos e historial en paralelo
    const [notas, adjuntos, historial] = await Promise.all([
      pool.query(
        `SELECT tn.*, CONCAT(u.nombre,' ',u.apellido) AS autor_nombre, u.rol AS autor_rol
         FROM ticket_notas tn
         JOIN usuarios u ON tn.autor_id = u.id
         WHERE tn.ticket_id = $1
         ORDER BY tn.creado_en`,
        [req.params.id]
      ),
      pool.query(
        `SELECT * FROM ticket_adjuntos WHERE ticket_id = $1 ORDER BY creado_en`,
        [req.params.id]
      ),
      pool.query(
        `SELECT a.*, CONCAT(u.nombre,' ',u.apellido) AS usuario_nombre
         FROM auditoria a
         LEFT JOIN usuarios u ON a.usuario_id = u.id
         WHERE a.ticket_id = $1
         ORDER BY a.creado_en`,
        [req.params.id]
      ),
    ]);

    res.json({
      ...rows[0],
      notas:     notas.rows,
      adjuntos:  adjuntos.rows,
      historial: historial.rows,
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════
// POST /api/tickets
// ══════════════════════════════════════════════════════════════
const crear = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      titulo, descripcion, prioridad = 'medio', canal = 'portal_web',
      categoria_id, subcategoria_id, reportado_por, asignado_a, activo_id,
    } = req.body;

    // Buscar SLA correspondiente
    const slaRes = await client.query(
      `SELECT id, tiempo_resolucion_min
       FROM slas
       WHERE categoria_id = $1 AND prioridad = $2 AND activo = TRUE
       LIMIT 1`,
      [categoria_id, prioridad]
    );
    const sla      = slaRes.rows[0];
    const slaVence = sla
      ? new Date(Date.now() + sla.tiempo_resolucion_min * 60_000)
      : null;

    const result = await client.query(
      `INSERT INTO tickets
         (titulo, descripcion, prioridad, estado, canal,
          categoria_id, subcategoria_id, reportado_por, asignado_a,
          activo_id, creado_por, sla_id, sla_vence_en)
       VALUES ($1,$2,$3,'abierto',$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, numero`,
      [titulo, descripcion || null, prioridad, canal,
       categoria_id, subcategoria_id || null,
       reportado_por, asignado_a || null,
       activo_id || null, req.user.id,
       sla?.id || null, slaVence]
    );

    const { id, numero } = result.rows[0];
    const codigo = ticketCodigo(numero);

    // Manejar adjunto de imagen si viene en base64
    const { imagen } = req.body;
    if (imagen) {
      const matches = imagen.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const crypto = require('crypto');
        const fs = require('fs');
        const path = require('path');
        
        const extension = mimeType.split('/')[1] || 'jpg';
        const filename = `${crypto.randomBytes(16).toString('hex')}.${extension}`;
        
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);
        
        const ruta = `uploads/${filename}`;
        
        await client.query(
          `INSERT INTO ticket_adjuntos (ticket_id, subido_por, nombre, ruta, mime_type, tamano_kb)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, req.user.id, filename, ruta, mimeType, Math.round(buffer.length / 1024)]
        );
      }
    }

    // Log de auditoría
    await logAuditoria(client, {
      ticketId: id, usuarioId: req.user.id,
      usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
      accion: 'crear', campo: 'ticket', valorNuevo: codigo, ip: req.ip,
    });

    // Notificar al técnico asignado (RF-5.2)
    if (asignado_a) {
      await crearNotificacion(client, {
        usuarioId: asignado_a, ticketId: id,
        tipo: 'ticket_asignado',
        titulo: `Nuevo ticket asignado: ${codigo}`,
        mensaje: titulo,
      });
    }

    await client.query('COMMIT');
    res.status(201).json({ id, codigo, numero });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
};

// ══════════════════════════════════════════════════════════════
// PATCH /api/tickets/:id
// ══════════════════════════════════════════════════════════════
const actualizar = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tkRes = await client.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (!tkRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    const ticket = tkRes.rows[0];

    const { estado, prioridad, asignado_a, solucion, causa_raiz,
            pausar_sla, reanudar_sla } = req.body;

    const sets   = [];
    const params = [];
    let p = 1;

    if (estado) {
      // Log del cambio de estado
      await logAuditoria(client, {
        ticketId: ticket.id, usuarioId: req.user.id,
        usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
        accion: 'modificar', campo: 'estado',
        valorAnterior: ticket.estado, valorNuevo: estado, ip: req.ip,
      });
      sets.push(`estado = $${p++}`); params.push(estado);
      if (estado === 'resuelto') sets.push(`resuelto_en = NOW()`);
      if (estado === 'cerrado')  sets.push(`cerrado_en = NOW()`);

      // Notificar al usuario que su ticket fue resuelto (RF-5.1)
      if (estado === 'resuelto') {
        await crearNotificacion(client, {
          usuarioId: ticket.reportado_por, ticketId: ticket.id,
          tipo: 'ticket_resuelto',
          titulo: `Tu incidente ${ticketCodigo(ticket.numero)} fue resuelto`,
        });
      }
    }

    if (prioridad) {
      await logAuditoria(client, {
        ticketId: ticket.id, usuarioId: req.user.id,
        usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
        accion: 'modificar', campo: 'prioridad',
        valorAnterior: ticket.prioridad, valorNuevo: prioridad, ip: req.ip,
      });
      sets.push(`prioridad = $${p++}`); params.push(prioridad);
    }

    if (asignado_a !== undefined) {
      await logAuditoria(client, {
        ticketId: ticket.id, usuarioId: req.user.id,
        usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
        accion: 'asignar', campo: 'asignado_a',
        valorAnterior: ticket.asignado_a, valorNuevo: asignado_a, ip: req.ip,
      });
      sets.push(`asignado_a = $${p++}`); params.push(asignado_a);
    }

    if (solucion)   { sets.push(`solucion = $${p++}`);    params.push(solucion); }
    if (causa_raiz) { sets.push(`causa_raiz = $${p++}`);  params.push(causa_raiz); }

    // Pausar SLA (RF-6.3)
    if (pausar_sla && !ticket.sla_pausado_en) {
      sets.push(`sla_pausado_en = NOW()`);
      sets.push(`sla_estado = 'pausado'`);
    }

    // Reanudar SLA
    if (reanudar_sla && ticket.sla_pausado_en) {
      const seg = Math.floor((Date.now() - new Date(ticket.sla_pausado_en)) / 1000);
      sets.push(`sla_pausa_total = sla_pausa_total + ${seg}`);
      sets.push(`sla_pausado_en = NULL`);
      sets.push(`sla_estado = 'en_tiempo'`);
    }

    if (!sets.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Sin campos para actualizar' });
    }

    params.push(req.params.id);
    await client.query(
      `UPDATE tickets SET ${sets.join(', ')} WHERE id = $${p}`, params
    );

    await client.query('COMMIT');
    res.json({ message: 'Ticket actualizado correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
};

// ══════════════════════════════════════════════════════════════
// POST /api/tickets/:id/notas (RF-1.7)
// ══════════════════════════════════════════════════════════════
const agregarNota = async (req, res, next) => {
  try {
    const { contenido, es_interna = false, tiempo_hh } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO ticket_notas (ticket_id, autor_id, contenido, es_interna, tiempo_hh)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [req.params.id, req.user.id, contenido, es_interna, tiempo_hh || null]
    );

    await logAuditoria(pool, {
      ticketId: req.params.id, usuarioId: req.user.id,
      usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
      accion: 'comentar', ip: req.ip,
    });

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════
// POST /api/tickets/:id/escalar (RF-1.8, RF-1.9)
// ══════════════════════════════════════════════════════════════
const escalar = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { asignado_ahora, motivo } = req.body;

    const tkRes = await client.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (!tkRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    const ticket = tkRes.rows[0];

    // Registrar escalamiento
    await client.query(
      `INSERT INTO escalamientos
         (ticket_id, escalado_por, asignado_antes, asignado_ahora, motivo, es_automatico)
       VALUES ($1,$2,$3,$4,$5,FALSE)`,
      [ticket.id, req.user.id, ticket.asignado_a, asignado_ahora, motivo]
    );

    // Actualizar ticket
    await client.query(
      `UPDATE tickets SET estado = 'escalado', asignado_a = $1 WHERE id = $2`,
      [asignado_ahora, ticket.id]
    );

    await logAuditoria(client, {
      ticketId: ticket.id, usuarioId: req.user.id,
      usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
      accion: 'escalar', valorNuevo: motivo, ip: req.ip,
    });

    await client.query('COMMIT');
    res.json({ message: 'Ticket escalado' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
};

// ══════════════════════════════════════════════════════════════
// POST /api/tickets/:id/reabrir (RF-1.12 — máx 72h)
// ══════════════════════════════════════════════════════════════
const reabrir = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    const t = rows[0];
    if (!t) return res.status(404).json({ error: 'Ticket no encontrado' });

    if (!['resuelto', 'cerrado'].includes(t.estado)) {
      return res.status(400).json({ error: 'Solo se pueden reabrir tickets resueltos o cerrados' });
    }

    const horas = (Date.now() - new Date(t.resuelto_en || t.cerrado_en)) / 3_600_000;
    if (horas > 72) {
      return res.status(400).json({ error: 'No se puede reabrir: pasaron más de 72 horas (RF-1.12)' });
    }

    await pool.query(
      `UPDATE tickets
       SET estado = 'abierto', reabierto_en = NOW(),
           veces_reabierto = veces_reabierto + 1,
           resuelto_en = NULL, cerrado_en = NULL
       WHERE id = $1`,
      [t.id]
    );

    await logAuditoria(pool, {
      ticketId: t.id, usuarioId: req.user.id,
      usuarioNombre: req.user.nombre, usuarioRol: req.user.rol,
      accion: 'reabrir', valorNuevo: req.body.motivo || null, ip: req.ip,
    });

    res.json({ message: 'Ticket reabierto' });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════════
// GET /api/tickets/catalogo — categorías y usuarios para formulario
// ══════════════════════════════════════════════════════════════
const catalogo = async (req, res, next) => {
  try {
    const [categorias, subcategorias, tecnicos, activos] = await Promise.all([
      pool.query(`SELECT id, nombre FROM categorias WHERE activo = TRUE ORDER BY nombre`),
      pool.query(`SELECT id, nombre, categoria_id FROM subcategorias WHERE activo = TRUE ORDER BY nombre`),
      pool.query(
        `SELECT id, CONCAT(nombre,' ',apellido) AS nombre, perfil
         FROM usuarios
         WHERE rol IN ('tecnico_l1','tecnico_l2','admin') AND activo = TRUE
         ORDER BY nombre`
      ),
      pool.query(
        `SELECT id, codigo, nombre, tipo FROM activos WHERE estado = 'operativo' ORDER BY codigo LIMIT 100`
      ),
    ]);

    res.json({
      categorias:    categorias.rows,
      subcategorias: subcategorias.rows,
      tecnicos:      tecnicos.rows,
      activos:       activos.rows,
    });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, agregarNota, escalar, reabrir, catalogo };