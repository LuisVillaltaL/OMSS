// RUTA: backend/src/controllers/reportesController.js
const pool = require('../config/db');

// Obtener metricas completas del dashboard de reportes
const obtenerDashboard = async (req, res, next) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;

    const hoy = new Date();
    // Default: Ultimos 30 dias
    if (!fecha_fin) {
      fecha_fin = hoy.toISOString();
    }
    if (!fecha_inicio) {
      const hace30d = new Date();
      hace30d.setDate(hoy.getDate() - 30);
      fecha_inicio = hace30d.toISOString();
    }

    const inicioCur = new Date(fecha_inicio);
    const finCur = new Date(fecha_fin);

    // Calcular la duracion del periodo actual en milisegundos para obtener el periodo previo
    const diffTime = Math.abs(finCur - inicioCur);
    const inicioPrev = new Date(inicioCur.getTime() - diffTime);
    const finPrev = new Date(inicioCur.getTime() - 1); // 1 ms antes del inicio del actual

    // Helper para ejecutar consultas seguras por rango de fecha
    const queryPeriodo = async (queryStr, params) => {
      const { rows } = await pool.query(queryStr, params);
      return rows;
    };

    // ── 1. METRICAS GENERALES (PERIODO ACTUAL vs PREVIO) ──
    const sqlKpis = `
      SELECT 
        COUNT(*) AS total,
        COUNT(CASE WHEN estado IN ('abierto', 'en_progreso', 'escalado') THEN 1 END) AS activos,
        COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) AS resueltos,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) AS cerrados,
        COUNT(CASE WHEN sla_estado = 'en_tiempo' OR (sla_estado IS NULL AND estado = 'cerrado') THEN 1 END) AS sla_cumplido,
        COUNT(CASE WHEN sla_estado = 'vencido' THEN 1 END) AS sla_vencido,
        AVG(CASE WHEN resuelto_en IS NOT NULL THEN EXTRACT(EPOCH FROM (resuelto_en - creado_en)) / 3600 END) AS avg_mttr_h
      FROM tickets
      WHERE creado_en >= $1 AND creado_en <= $2
    `;

    const kpisActual = (await queryPeriodo(sqlKpis, [inicioCur, finCur]))[0];
    const kpisPrevio = (await queryPeriodo(sqlKpis, [inicioPrev, finPrev]))[0];

    // Calculo MTTA (Mean Time to Acknowledge / Assign)
    const sqlMtta = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (COALESCE(t.sla_pausado_en, a.creado_en) - t.creado_en)) / 60) AS avg_mtta_m
      FROM tickets t
      LEFT JOIN (
        SELECT ticket_id, MIN(creado_en) AS creado_en 
        FROM auditoria 
        WHERE accion = 'asignar' 
        GROUP BY ticket_id
      ) a ON t.id = a.ticket_id
      WHERE t.creado_en >= $1 AND t.creado_en <= $2
    `;

    const mttaActualRes = (await queryPeriodo(sqlMtta, [inicioCur, finCur]))[0];
    const mttaPrevioRes = (await queryPeriodo(sqlMtta, [inicioPrev, finPrev]))[0];

    const actualTotal = parseInt(kpisActual.total || 0);
    const previoTotal = parseInt(kpisPrevio.total || 0);

    const actualSlaCumplido = parseInt(kpisActual.sla_cumplido || 0);
    const previoSlaCumplido = parseInt(kpisPrevio.sla_cumplido || 0);

    // Tasas de cumplimiento de SLA
    const tasaSlaActual = actualTotal > 0 ? Math.round((actualSlaCumplido / actualTotal) * 100) : 100;
    const tasaSlaPrevio = previoTotal > 0 ? Math.round((previoSlaCumplido / previoTotal) * 100) : 100;

    // Estructurar respuesta de KPIs comparativos
    const kpis = {
      total: {
        actual: actualTotal,
        previo: previoTotal,
        cambio_porcentaje: previoTotal > 0 ? Math.round(((actualTotal - previoTotal) / previoTotal) * 100) : 0
      },
      activos: {
        actual: parseInt(kpisActual.activos || 0),
        previo: parseInt(kpisPrevio.activos || 0),
        cambio_porcentaje: parseInt(kpisPrevio.activos || 0) > 0 ? Math.round(((parseInt(kpisActual.activos || 0) - parseInt(kpisPrevio.activos || 0)) / parseInt(kpisPrevio.activos || 0)) * 100) : 0
      },
      resueltos: {
        actual: parseInt(kpisActual.resueltos || 0) + parseInt(kpisActual.cerrados || 0),
        previo: parseInt(kpisPrevio.resueltos || 0) + parseInt(kpisPrevio.cerrados || 0),
        cambio_porcentaje: (parseInt(kpisPrevio.resueltos || 0) + parseInt(kpisPrevio.cerrados || 0)) > 0 
          ? Math.round((((parseInt(kpisActual.resueltos || 0) + parseInt(kpisActual.cerrados || 0)) - (parseInt(kpisPrevio.resueltos || 0) + parseInt(kpisPrevio.cerrados || 0))) / (parseInt(kpisPrevio.resueltos || 0) + parseInt(kpisPrevio.cerrados || 0))) * 100) 
          : 0
      },
      sla_cumplimiento: {
        actual: tasaSlaActual,
        previo: tasaSlaPrevio,
        cambio_porcentaje: tasaSlaActual - tasaSlaPrevio // Diferencia directa en puntos porcentuales
      },
      mttr: {
        actual: kpisActual.avg_mttr_h ? parseFloat(parseFloat(kpisActual.avg_mttr_h).toFixed(1)) : 0,
        previo: kpisPrevio.avg_mttr_h ? parseFloat(parseFloat(kpisPrevio.avg_mttr_h).toFixed(1)) : 0,
        cambio_porcentaje: kpisPrevio.avg_mttr_h && kpisActual.avg_mttr_h 
          ? Math.round(((parseFloat(kpisActual.avg_mttr_h) - parseFloat(kpisPrevio.avg_mttr_h)) / parseFloat(kpisPrevio.avg_mttr_h)) * 100) 
          : 0
      },
      mtta: {
        actual: mttaActualRes.avg_mtta_m ? parseFloat(parseFloat(mttaActualRes.avg_mtta_m).toFixed(1)) : 0,
        previo: mttaPrevioRes.avg_mtta_m ? parseFloat(parseFloat(mttaPrevioRes.avg_mtta_m).toFixed(1)) : 0,
        cambio_porcentaje: mttaPrevioRes.avg_mtta_m && mttaActualRes.avg_mtta_m 
          ? Math.round(((parseFloat(mttaActualRes.avg_mtta_m) - parseFloat(mttaPrevioRes.avg_mtta_m)) / parseFloat(mttaPrevioRes.avg_mtta_m)) * 100) 
          : 0
      }
    };

    // ── 2. DISTRIBUCION POR PRIORIDAD ──
    const prioridadRows = await queryPeriodo(
      `SELECT prioridad, COUNT(*) AS cantidad 
       FROM tickets 
       WHERE creado_en >= $1 AND creado_en <= $2
       GROUP BY prioridad`,
      [inicioCur, finCur]
    );

    // ── 3. DISTRIBUCION POR ESTADO ──
    const estadoRows = await queryPeriodo(
      `SELECT estado, COUNT(*) AS cantidad 
       FROM tickets 
       WHERE creado_en >= $1 AND creado_en <= $2
       GROUP BY estado`,
      [inicioCur, finCur]
    );

    // ── 4. INCIDENTES POR CATEGORIA ──
    const categoriaRows = await queryPeriodo(
      `SELECT c.nombre AS categoria, COUNT(t.id) AS cantidad 
       FROM tickets t 
       JOIN categorias c ON t.categoria_id = c.id 
       WHERE t.creado_en >= $1 AND t.creado_en <= $2
       GROUP BY c.nombre 
       ORDER BY cantidad DESC`,
      [inicioCur, finCur]
    );

    // ── 5. DESEMPEÑO DE TECNICOS (TICKETS RESUELTOS O CERRADOS) ──
    const tecnicosRows = await queryPeriodo(
      `SELECT 
         u.id,
         CONCAT(u.nombre, ' ', u.apellido) AS nombre,
         u.perfil,
         COUNT(CASE WHEN t.estado IN ('resuelto', 'cerrado') THEN 1 END) AS resueltos,
         COUNT(CASE WHEN t.estado IN ('abierto', 'en_progreso', 'escalado') THEN 1 END) AS activos,
         COUNT(CASE WHEN t.sla_estado = 'vencido' THEN 1 END) AS vencidos_sla
       FROM tickets t
       JOIN usuarios u ON t.asignado_a = u.id
       WHERE t.creado_en >= $1 AND t.creado_en <= $2
       GROUP BY u.id, u.nombre, u.apellido, u.perfil
       ORDER BY resueltos DESC, activos ASC
       LIMIT 5`,
      [inicioCur, finCur]
    );

    // ── 6. ESCALAMIENTOS RECIENTES ──
    const escalamientosRows = await queryPeriodo(
      `SELECT 
         e.id,
         e.motivo,
         ticket_codigo(t.numero) AS ticket_codigo,
         t.titulo AS ticket_titulo,
         e.creado_en,
         CONCAT(up.nombre, ' ', up.apellido) AS escalado_por,
         CONCAT(ua.nombre, ' ', ua.apellido) AS asignado_ahora
       FROM escalamientos e
       JOIN tickets t ON e.ticket_id = t.id
       JOIN usuarios up ON e.escalado_por = up.id
       JOIN usuarios ua ON e.asignado_ahora = ua.id
       WHERE e.creado_en >= $1 AND e.creado_en <= $2
       ORDER BY e.creado_en DESC
       LIMIT 5`,
      [inicioCur, finCur]
    );

    // ── 7. VOLUMETRIA TEMPORAL (POR DIA) PARA EL GRAFICO DE INCIDENTES ──
    const volumetriaRows = await queryPeriodo(
      `SELECT 
         TO_CHAR(creado_en, 'YYYY-MM-DD') AS fecha,
         COUNT(*) AS cantidad,
         COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) AS resueltos
       FROM tickets
       WHERE creado_en >= $1 AND creado_en <= $2
       GROUP BY TO_CHAR(creado_en, 'YYYY-MM-DD')
       ORDER BY fecha ASC`,
      [inicioCur, finCur]
    );

    res.json({
      periodo: {
        inicio: inicioCur,
        fin: finCur,
        previo_inicio: inicioPrev,
        previo_fin: finPrev
      },
      kpis,
      distribucion_prioridad: prioridadRows,
      distribucion_estado: estadoRows,
      incidentes_categoria: categoriaRows,
      rendimiento_tecnicos: tecnicosRows,
      escalamientos_recientes: escalamientosRows,
      volumetria_temporal: volumetriaRows
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  obtenerDashboard
};
