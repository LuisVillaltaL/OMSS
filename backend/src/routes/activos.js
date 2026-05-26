const router   = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const auth     = require('../middlewares/auth');
const c        = require('../controllers/activosController');

// Todos los endpoints de la CMDB requieren token activo
router.use(auth());

router.get('/formularios', c.formularios);
router.get('/', c.listar);

router.post('/',
  [
    body('codigo').trim().isLength({ min: 3, max: 30 }).withMessage('Código de activo requerido'),
    body('nombre').trim().isLength({ min: 3, max: 150 }).withMessage('Nombre descriptivo requerido'),
    body('tipo').isIn(['laptop','desktop','servidor','impresora','switch','router','ups','monitor','telefono_ip','otro']).withMessage('Tipo de activo no parametrizado'),
    body('estado').optional().isIn(['operativo','mantenimiento','dado_de_baja','extraviado']),
    body('departamento_id').optional({ checkFalsy: true }).isUUID().withMessage('departamento_id debe ser UUID'),
    body('asignado_a').optional({ checkFalsy: true }).isUUID().withMessage('asignado_a debe ser UUID'),
  ],
  validate,
  c.crear
);

router.put('/:id',
  [
    body('codigo').trim().isLength({ min: 3, max: 30 }).withMessage('Código de activo requerido'),
    body('nombre').trim().isLength({ min: 3, max: 150 }).withMessage('Nombre descriptivo requerido'),
    body('tipo').isIn(['laptop','desktop','servidor','impresora','switch','router','ups','monitor','telefono_ip','otro']).withMessage('Tipo de activo no parametrizado'),
    body('estado').isIn(['operativo','mantenimiento','dado_de_baja','extraviado']).withMessage('Estado inválido'),
    body('departamento_id').optional({ checkFalsy: true }).isUUID().withMessage('departamento_id debe ser UUID'),
    body('asignado_a').optional({ checkFalsy: true }).isUUID().withMessage('asignado_a debe ser UUID'),
  ],
  validate,
  c.actualizar
);

module.exports = router;