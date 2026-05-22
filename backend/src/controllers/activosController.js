const pool = require('../config/db');

// ── Listar activos de la vista v_activos ───────────────────────
const listar = async (req, res, next) => {
  try {
    const { tipo, estado, q } = req.query;
    const conds = [];
    const params = [];
    let p = 1;

    if (tipo)   { conds.push(`tipo = $${p++}`);   params.push(tipo); }
    if (estado) { conds.push(`estado = $${p++}`); params.push(estado); }
    if (q) {
      conds.push(`(nombre ILIKE $${p} OR codigo ILIKE $${p} OR numero_serie ILIKE $${p})`);
      params.push(`%${q}%`); p++;
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    
    const queryStr = `
      SELECT id, codigo, nombre, tipo, marca, modelo, numero_serie,
             estado, ubicacion, fecha_garantia, departamento,
             asignado_a_nombre, asignado_a_correo, total_tickets
      FROM v_activos
      ${where}
      ORDER BY codigo ASC
    `;

    const { rows } = await pool.query(queryStr, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// ── Registrar activo vinculando UUIDs ──────────────────────────
const crear = async (req, res, next) => {
  try {
    const {
      codigo, nombre, tipo, marca, modelo, numero_serie,
      estado = 'operativo', fecha_compra, fecha_garantia, costo_adq,
      ubicacion, departamento_id, asignado_a, notas
    } = req.body;

    const queryStr = `
      INSERT INTO activos (
        codigo, nombre, tipo, marca, modelo, numero_serie, estado,
        fecha_compra, fecha_garantia, costo_adq, ubicacion,
        departamento_id, asignado_a, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, codigo, nombre
    `;

    const valores = [
      codigo, nombre, tipo, marca || null, modelo || null, numero_serie || null,
      estado, fecha_compra || null, fecha_garantia || null, costo_adq || null,
      ubicacion || null, departamento_id || null, asignado_a || null, notas || null
    ];

    const { rows } = await pool.query(queryStr, valores);
    res.status(201).json({ ok: true, activo: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El código de activo o número de serie ya existe en la base de datos' });
    }
    next(err);
  }
};

// ── Catálogos auxiliares (Departamentos y Custodios) ────────────
const formularios = async (req, res, next) => {
  try {
    const [deptos, empleados] = await Promise.all([
      pool.query(`SELECT id, nombre FROM departamentos WHERE activo = TRUE ORDER BY nombre`),
      pool.query(`SELECT id, CONCAT(nombre,' ',apellido) AS nombre, correo FROM usuarios WHERE activo = TRUE ORDER BY nombre`)
    ]);
    res.json({
      departamentos: deptos.rows,
      empleados: empleados.rows
    });
  } catch (err) { next(err); }
};

module.exports = { listar, crear, formularios };