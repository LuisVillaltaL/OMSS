// RUTA: backend/src/controllers/licenciasController.js
const pool = require('../config/db');

// ── Listar licencias con información relacionada ──────────────
const listar = async (req, res, next) => {
  try {
    const queryStr = `
      SELECT l.*, 
             d.nombre AS departamento_nombre,
             CONCAT(u.nombre, ' ', u.apellido) AS asignado_a_nombre,
             u.correo AS asignado_a_correo,
             a.nombre AS activo_nombre,
             a.codigo AS activo_codigo
      FROM licencias l
      LEFT JOIN departamentos d ON l.departamento_id = d.id
      LEFT JOIN usuarios u ON l.asignado_a = u.id
      LEFT JOIN activos a ON l.activo_id = a.id
      ORDER BY l.codigo ASC
    `;
    const { rows } = await pool.query(queryStr);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ── Crear una nueva licencia ──────────────────────────────────
const crear = async (req, res, next) => {
  try {
    const {
      codigo, nombre, clave, tipo, fecha_compra, fecha_expiracion,
      costo, cantidad_total, cantidad_usada, proveedor,
      departamento_id, asignado_a, activo_id, notas
    } = req.body;

    const queryStr = `
      INSERT INTO licencias (
        codigo, nombre, clave, tipo, fecha_compra, fecha_expiracion,
        costo, cantidad_total, cantidad_usada, proveedor,
        departamento_id, asignado_a, activo_id, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, codigo, nombre
    `;

    const valores = [
      codigo, nombre, clave || null, tipo || null, fecha_compra || null, fecha_expiracion || null,
      costo || null, cantidad_total || 1, cantidad_usada || 0, proveedor || null,
      departamento_id || null, asignado_a || null, activo_id || null, notas || null
    ];

    const { rows } = await pool.query(queryStr, valores);
    res.status(201).json({ ok: true, licencia: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El código de licencia ya existe en el sistema' });
    }
    next(err);
  }
};

// ── Actualizar licencia existente ──────────────────────────────
const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      codigo, nombre, clave, tipo, fecha_compra, fecha_expiracion,
      costo, cantidad_total, cantidad_usada, proveedor,
      departamento_id, asignado_a, activo_id, notas
    } = req.body;

    const queryStr = `
      UPDATE licencias
      SET codigo = $1, nombre = $2, clave = $3, tipo = $4, fecha_compra = $5,
          fecha_expiracion = $6, costo = $7, cantidad_total = $8, cantidad_usada = $9,
          proveedor = $10, departamento_id = $11, asignado_a = $12, activo_id = $13,
          notas = $14, actualizado_en = NOW()
      WHERE id = $15
      RETURNING id, codigo, nombre
    `;

    const valores = [
      codigo, nombre, clave || null, tipo || null, fecha_compra || null, fecha_expiracion || null,
      costo || null, cantidad_total || 1, cantidad_usada || 0, proveedor || null,
      departamento_id || null, asignado_a || null, activo_id || null, notas || null,
      id
    ];

    const { rows } = await pool.query(queryStr, valores);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Licencia no encontrada en la base de datos' });
    }

    res.json({ ok: true, licencia: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El código de licencia ya existe en el sistema' });
    }
    next(err);
  }
};

// ── Eliminar una licencia ─────────────────────────────────────
const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryStr = `DELETE FROM licencias WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(queryStr, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Licencia no encontrada' });
    }

    res.json({ ok: true, mensaje: 'Licencia eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crear, actualizar, eliminar };
