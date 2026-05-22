// RUTA: backend/src/controllers/notificacionesController.js
const pool = require('../config/db');

// Listar notificaciones del usuario autenticado
const listar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Obtener notificaciones reales del usuario
    const { rows } = await pool.query(
      `SELECT n.id, n.usuario_id, n.ticket_id, n.tipo, n.titulo, n.mensaje, n.leida, n.creado_en,
              ticket_codigo(t.numero) AS ticket_codigo
       FROM notificaciones n
       LEFT JOIN tickets t ON n.ticket_id = t.id
       WHERE n.usuario_id = $1
       ORDER BY n.creado_en DESC
       LIMIT 50`,
      [userId]
    );

    // Si el usuario no tiene notificaciones, creamos un par de notificaciones iniciales de bienvenida
    if (rows.length === 0) {
      const initQueries = [
        {
          tipo: 'ticket_creado',
          titulo: 'Bienvenido al S.L.A. System Suite',
          mensaje: `Tu cuenta ha sido configurada con el rol de ${req.user.rol.replace('_', ' ')}. Explora la suite para gestionar tus incidentes.`
        },
        {
          tipo: 'sla_80',
          titulo: 'Control de Niveles de Servicio Activo',
          mensaje: 'Se han configurado y activado las reglas de SLA globales para categorias e incidentes.'
        }
      ];

      const generated = [];
      for (const q of initQueries) {
        const ins = await pool.query(
          `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje)
           VALUES ($1, $2, $3, $4)
           RETURNING id, usuario_id, ticket_id, tipo, titulo, mensaje, leida, creado_en`,
          [userId, q.tipo, q.titulo, q.mensaje]
        );
        generated.push(ins.rows[0]);
      }
      return res.json(generated);
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Marcar una notificacion como leida
const marcarLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { rowCount } = await pool.query(
      `UPDATE notificaciones
       SET leida = TRUE
       WHERE id = $1 AND usuario_id = $2`,
      [id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notificacion no encontrada' });
    }

    res.json({ message: 'Notificacion marcada como leida' });
  } catch (err) {
    next(err);
  }
};

// Marcar todas las notificaciones como leidas
const marcarTodasLeidas = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `UPDATE notificaciones
       SET leida = TRUE
       WHERE usuario_id = $1`,
      [userId]
    );

    res.json({ message: 'Todas las notificaciones marcadas como leidas' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar,
  marcarLeida,
  marcarTodasLeidas
};
