// 📁 RUTA: backend/src/routes/index.js
const router = require('express').Router();

router.use('/auth',    require('./authRoutes'));
router.use('/tickets', require('./ticketsRoutes'));
router.use('/activos', require('./activos'));
router.use('/config',  require('./config'));
router.use('/notificaciones', require('./notificacionesRoutes'));
router.use('/reportes', require('./reportesRoutes'));
router.use('/usuarios',  require('./usuariosRoutes'));
// router.use('/dashboard', require('./dashboardRoutes'));

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

module.exports = router;