// RUTA: backend/src/routes/usuariosRoutes.js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/usuariosController');

// Rutas accesibles por personal de TI y administradores
router.get('/', auth(['admin', 'tecnico_l1', 'tecnico_l2']), c.listar);
router.get('/:id', auth(['admin', 'tecnico_l1', 'tecnico_l2']), c.obtener);

// Rutas de edicion y administracion exclusivas del rol administrador
router.post('/', auth(['admin']), c.crear);
router.put('/:id', auth(['admin']), c.actualizar);
router.put('/:id/toggle', auth(['admin']), c.toggleEstado);
router.put('/:id/permisos', auth(['admin']), c.actualizarPermisos);

module.exports = router;
