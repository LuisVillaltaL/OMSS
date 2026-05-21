const router = require('express').Router();

// ── Rutas disponibles ──────────────────────────────────────────
router.use('/auth',    require('./authRoutes'));

// Los siguientes se irán agregando módulo por módulo:
// router.use('/tickets',       require('./ticketsRoutes'));
// router.use('/activos',       require('./activosRoutes'));
// router.use('/usuarios',      require('./usuariosRoutes'));
// router.use('/dashboard',     require('./dashboardRoutes'));
// router.use('/notificaciones',require('./notificacionesRoutes'));
// router.use('/auditoria',     require('./auditoriaRoutes'));

// ── Health check ───────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    servicio:  'ITSM API — Sistema de Gestión de Incidentes de TI',
  });
});

module.exports = router;