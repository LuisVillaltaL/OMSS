const pool = require('../config/db');

// ── DEPARTAMENTOS ───────────────────────────────────────────────────

const listarDepartamentos = async (req, res, next) => {
  try {
    const queryStr = `
      SELECT id, nombre, descripcion, activo, creado_en, actualizado_en
      FROM departamentos
      ORDER BY nombre ASC
    `;
    const { rows } = await pool.query(queryStr);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const crearDepartamento = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const queryStr = `
      INSERT INTO departamentos (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING id, nombre, descripcion, activo, creado_en
    `;
    const { rows } = await pool.query(queryStr, [nombre.trim(), descripcion ? descripcion.trim() : null]);
    res.status(201).json({ ok: true, departamento: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El nombre del departamento ya existe' });
    }
    next(err);
  }
};

const actualizarDepartamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    const queryStr = `
      UPDATE departamentos
      SET nombre = $1, descripcion = $2, activo = $3, actualizado_en = NOW()
      WHERE id = $4
      RETURNING id, nombre, descripcion, activo, actualizado_en
    `;
    const { rows } = await pool.query(queryStr, [
      nombre.trim(),
      descripcion ? descripcion.trim() : null,
      activo !== false,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }
    res.json({ ok: true, departamento: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El nombre del departamento ya existe' });
    }
    next(err);
  }
};

const eliminarDepartamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      const { rowCount } = await pool.query('DELETE FROM departamentos WHERE id = $1', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }
      res.json({ ok: true, mensaje: 'Departamento eliminado correctamente' });
    } catch (dbErr) {
      // Si hay una violacion de clave foranea (codigo 23503)
      if (dbErr.code === '23503') {
        const { rows } = await pool.query(
          'UPDATE departamentos SET activo = false, actualizado_en = NOW() WHERE id = $1 RETURNING id',
          [id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Departamento no encontrado' });
        }
        return res.json({
          ok: true,
          mensaje: 'El departamento esta en uso por otros registros. Se ha desactivado correctamente.'
        });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
};

// ── CATEGORIAS Y SUBCATEGORIAS ──────────────────────────────────────

const listarCategorias = async (req, res, next) => {
  try {
    const catQuery = `
      SELECT id, nombre, descripcion, activo
      FROM categorias
      ORDER BY nombre ASC
    `;
    const subQuery = `
      SELECT id, categoria_id, nombre, descripcion, activo
      FROM subcategorias
      ORDER BY nombre ASC
    `;

    const [cats, subs] = await Promise.all([
      pool.query(catQuery),
      pool.query(subQuery)
    ]);

    const subMap = {};
    subs.rows.forEach(sub => {
      if (!subMap[sub.categoria_id]) {
        subMap[sub.categoria_id] = [];
      }
      subMap[sub.categoria_id].push(sub);
    });

    const resultado = cats.rows.map(cat => ({
      ...cat,
      subcategorias: subMap[cat.id] || []
    }));

    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const queryStr = `
      INSERT INTO categorias (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING id, nombre, descripcion, activo
    `;
    const { rows } = await pool.query(queryStr, [nombre.trim(), descripcion ? descripcion.trim() : null]);
    res.status(201).json({ ok: true, categoria: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El nombre de la categoria ya existe' });
    }
    next(err);
  }
};

const actualizarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    const queryStr = `
      UPDATE categorias
      SET nombre = $1, descripcion = $2, activo = $3
      WHERE id = $4
      RETURNING id, nombre, descripcion, activo
    `;
    const { rows } = await pool.query(queryStr, [
      nombre.trim(),
      descripcion ? descripcion.trim() : null,
      activo !== false,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }
    res.json({ ok: true, categoria: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El nombre de la categoria ya existe' });
    }
    next(err);
  }
};

const eliminarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      const { rowCount } = await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Categoria no encontrada' });
      }
      res.json({ ok: true, mensaje: 'Categoria eliminada correctamente' });
    } catch (dbErr) {
      if (dbErr.code === '23503') {
        const { rows } = await pool.query(
          'UPDATE categorias SET activo = false WHERE id = $1 RETURNING id',
          [id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Categoria no encontrada' });
        }
        return res.json({
          ok: true,
          mensaje: 'La categoria esta vinculada a tickets u otros registros. Se ha desactivado correctamente.'
        });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
};

const crearSubcategoria = async (req, res, next) => {
  try {
    const { categoria_id, nombre, descripcion } = req.body;
    const queryStr = `
      INSERT INTO subcategorias (categoria_id, nombre, descripcion)
      VALUES ($1, $2, $3)
      RETURNING id, categoria_id, nombre, descripcion, activo
    `;
    const { rows } = await pool.query(queryStr, [
      categoria_id,
      nombre.trim(),
      descripcion ? descripcion.trim() : null
    ]);
    res.status(201).json({ ok: true, subcategoria: rows[0] });
  } catch (err) {
    next(err);
  }
};

const actualizarSubcategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    const queryStr = `
      UPDATE subcategorias
      SET nombre = $1, descripcion = $2, activo = $3
      WHERE id = $4
      RETURNING id, categoria_id, nombre, descripcion, activo
    `;
    const { rows } = await pool.query(queryStr, [
      nombre.trim(),
      descripcion ? descripcion.trim() : null,
      activo !== false,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Subcategoria no encontrada' });
    }
    res.json({ ok: true, subcategoria: rows[0] });
  } catch (err) {
    next(err);
  }
};

const eliminarSubcategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      const { rowCount } = await pool.query('DELETE FROM subcategorias WHERE id = $1', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Subcategoria no encontrada' });
      }
      res.json({ ok: true, mensaje: 'Subcategoria eliminada correctamente' });
    } catch (dbErr) {
      if (dbErr.code === '23503') {
        const { rows } = await pool.query(
          'UPDATE subcategorias SET activo = false WHERE id = $1 RETURNING id',
          [id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Subcategoria no encontrada' });
        }
        return res.json({
          ok: true,
          mensaje: 'La subcategoria esta vinculada a tickets u otros registros. Se ha desactivado correctamente.'
        });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
};

// ── SLAs ─────────────────────────────────────────────────────────────

const listarSlas = async (req, res, next) => {
  try {
    const queryStr = `
      SELECT s.id, s.nombre, s.categoria_id, c.nombre AS categoria_nombre,
             s.prioridad, s.tiempo_respuesta_min, s.tiempo_resolucion_min,
             s.horario_laboral, s.hora_inicio, s.hora_fin, s.dias_laborales,
             s.activo, s.creado_en
      FROM slas s
      LEFT JOIN categorias c ON s.categoria_id = c.id
      ORDER BY s.prioridad DESC, s.nombre ASC
    `;
    const { rows } = await pool.query(queryStr);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const crearSla = async (req, res, next) => {
  try {
    const {
      nombre,
      categoria_id,
      prioridad,
      tiempo_respuesta_min,
      tiempo_resolucion_min,
      horario_laboral = true,
      hora_inicio = '08:00',
      hora_fin = '18:00',
      dias_laborales = [1, 2, 3, 4, 5]
    } = req.body;

    const queryStr = `
      INSERT INTO slas (
        nombre, categoria_id, prioridad, tiempo_respuesta_min, tiempo_resolucion_min,
        horario_laboral, hora_inicio, hora_fin, dias_laborales
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, nombre, categoria_id, prioridad, tiempo_respuesta_min, tiempo_resolucion_min,
                horario_laboral, hora_inicio, hora_fin, dias_laborales, activo, creado_en
    `;

    const { rows } = await pool.query(queryStr, [
      nombre.trim(),
      categoria_id || null,
      prioridad,
      parseInt(tiempo_respuesta_min),
      parseInt(tiempo_resolucion_min),
      horario_laboral !== false,
      hora_inicio,
      hora_fin,
      dias_laborales
    ]);

    res.status(201).json({ ok: true, sla: rows[0] });
  } catch (err) {
    next(err);
  }
};

const actualizarSla = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      categoria_id,
      prioridad,
      tiempo_respuesta_min,
      tiempo_resolucion_min,
      horario_laboral,
      hora_inicio,
      hora_fin,
      dias_laborales,
      activo
    } = req.body;

    const queryStr = `
      UPDATE slas
      SET nombre = $1, categoria_id = $2, prioridad = $3,
          tiempo_respuesta_min = $4, tiempo_resolucion_min = $5,
          horario_laboral = $6, hora_inicio = $7, hora_fin = $8,
          dias_laborales = $9, activo = $10
      WHERE id = $11
      RETURNING id, nombre, categoria_id, prioridad, tiempo_respuesta_min, tiempo_resolucion_min,
                horario_laboral, hora_inicio, hora_fin, dias_laborales, activo
    `;

    const { rows } = await pool.query(queryStr, [
      nombre.trim(),
      categoria_id || null,
      prioridad,
      parseInt(tiempo_respuesta_min),
      parseInt(tiempo_resolucion_min),
      horario_laboral !== false,
      hora_inicio,
      hora_fin,
      dias_laborales,
      activo !== false,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'SLA no encontrado' });
    }
    res.json({ ok: true, sla: rows[0] });
  } catch (err) {
    next(err);
  }
};

const eliminarSla = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      const { rowCount } = await pool.query('DELETE FROM slas WHERE id = $1', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'SLA no encontrado' });
      }
      res.json({ ok: true, mensaje: 'SLA eliminado correctamente' });
    } catch (dbErr) {
      if (dbErr.code === '23503') {
        const { rows } = await pool.query(
          'UPDATE slas SET activo = false WHERE id = $1 RETURNING id',
          [id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: 'SLA no encontrado' });
        }
        return res.json({
          ok: true,
          mensaje: 'El SLA esta siendo utilizado por tickets activos. Se ha desactivado correctamente.'
        });
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarDepartamentos,
  crearDepartamento,
  actualizarDepartamento,
  eliminarDepartamento,
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  crearSubcategoria,
  actualizarSubcategoria,
  eliminarSubcategoria,
  listarSlas,
  crearSla,
  actualizarSla,
  eliminarSla
};
