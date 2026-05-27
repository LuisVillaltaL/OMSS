// RUTA: backend/src/routes/licencias.js
const router   = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const auth     = require('../middlewares/auth');
const c        = require('../controllers/licenciasController');

// Todos los endpoints de licencias de software requieren token de autenticación
router.use(auth());

router.get('/', c.listar);

router.post('/',
  [
    body('codigo').trim().isLength({ min: 3, max: 30 }).withMessage('Código de licencia requerido'),
    body('nombre').trim().isLength({ min: 3, max: 150 }).withMessage('Nombre de software requerido'),
    body('cantidad_total').isInt({ min: 1 }).withMessage('La cantidad total debe ser al menos 1'),
    body('cantidad_usada').optional().isInt({ min: 0 }).withMessage('La cantidad usada no puede ser menor a 0'),
    body('departamento_id').optional({ checkFalsy: true }).isUUID().withMessage('departamento_id debe ser UUID'),
    body('asignado_a').optional({ checkFalsy: true }).isUUID().withMessage('asignado_a debe ser UUID'),
    body('activo_id').optional({ checkFalsy: true }).isUUID().withMessage('activo_id debe ser UUID'),
  ],
  validate,
  c.crear
);

router.put('/:id',
  [
    body('codigo').trim().isLength({ min: 3, max: 30 }).withMessage('Código de licencia requerido'),
    body('nombre').trim().isLength({ min: 3, max: 150 }).withMessage('Nombre de software requerido'),
    body('cantidad_total').isInt({ min: 1 }).withMessage('La cantidad total debe ser al menos 1'),
    body('cantidad_usada').optional().isInt({ min: 0 }).withMessage('La cantidad usada no puede ser menor a 0'),
    body('departamento_id').optional({ checkFalsy: true }).isUUID().withMessage('departamento_id debe ser UUID'),
    body('asignado_a').optional({ checkFalsy: true }).isUUID().withMessage('asignado_a debe ser UUID'),
    body('activo_id').optional({ checkFalsy: true }).isUUID().withMessage('activo_id debe ser UUID'),
  ],
  validate,
  c.actualizar
);

router.delete('/:id', c.eliminar);

module.exports = router;
