// RUTA: backend/src/routes/reportesRoutes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/reportesController');

// Asegurar que solo administradores y tecnicos puedan acceder a los reportes
router.get('/dashboard', auth(['admin', 'tecnico_l1', 'tecnico_l2']), c.obtenerDashboard);

module.exports = router;
