// RUTA: backend/src/routes/notificacionesRoutes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/notificacionesController');

// Proteger todas las rutas de notificaciones
router.use(auth());

// Obtener todas las notificaciones del usuario actual
router.get('/', c.listar);

// Marcar todas como leidas
router.put('/leer-todas', c.marcarTodasLeidas);

// Marcar una notificacion especifica como leida
router.put('/:id/leer', c.marcarLeida);

module.exports = router;
