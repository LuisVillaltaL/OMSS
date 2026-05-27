const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const c = require('../controllers/configController');

// Todos los endpoints de configuracion global requieren rol de administrador
router.use(auth(['admin']));

// ── DEPARTAMENTOS ───────────────────────────────────────────────────

router.get('/departamentos', c.listarDepartamentos);

router.post('/departamentos',
  [
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre del departamento es requerido (minimo 2, maximo 100 caracteres)')
  ],
  validate,
  c.crearDepartamento
);

router.put('/departamentos/:id',
  [
    param('id').isUUID().withMessage('ID de departamento invalido'),
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre del departamento es requerido (minimo 2, maximo 100 caracteres)'),
    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El estado activo debe ser un valor booleano')
  ],
  validate,
  c.actualizarDepartamento
);

router.delete('/departamentos/:id',
  [
    param('id').isUUID().withMessage('ID de departamento invalido')
  ],
  validate,
  c.eliminarDepartamento
);

// ── CATEGORIAS Y SUBCATEGORIAS ──────────────────────────────────────

router.get('/categorias', c.listarCategorias);

router.post('/categorias',
  [
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre de la categoria es requerido (minimo 2, maximo 100 caracteres)')
  ],
  validate,
  c.crearCategoria
);

router.put('/categorias/:id',
  [
    param('id').isUUID().withMessage('ID de categoria invalido'),
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre de la categoria es requerido (minimo 2, maximo 100 caracteres)'),
    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El estado activo debe ser un valor booleano')
  ],
  validate,
  c.actualizarCategoria
);

router.delete('/categorias/:id',
  [
    param('id').isUUID().withMessage('ID de categoria invalido')
  ],
  validate,
  c.eliminarCategoria
);

router.post('/subcategorias',
  [
    body('categoria_id')
      .isUUID()
      .withMessage('El ID de categoria debe ser un UUID valido'),
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre de la subcategoria es requerido (minimo 2, maximo 100 caracteres)')
  ],
  validate,
  c.crearSubcategoria
);

router.put('/subcategorias/:id',
  [
    param('id').isUUID().withMessage('ID de subcategoria invalido'),
    body('nombre')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre de la subcategoria es requerido (minimo 2, maximo 100 caracteres)'),
    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El estado activo debe ser un valor booleano')
  ],
  validate,
  c.actualizarSubcategoria
);

router.delete('/subcategorias/:id',
  [
    param('id').isUUID().withMessage('ID de subcategoria invalido')
  ],
  validate,
  c.eliminarSubcategoria
);

// ── SLAs ─────────────────────────────────────────────────────────────

router.get('/slas', c.listarSlas);

router.post('/slas',
  [
    body('nombre')
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('El nombre del SLA es requerido (minimo 3, maximo 150 caracteres)'),
    body('categoria_id')
      .optional({ checkFalsy: true })
      .isUUID()
      .withMessage('categoria_id debe ser un UUID valido'),
    body('prioridad')
      .isIn(['critico', 'alto', 'medio', 'bajo'])
      .withMessage('Prioridad invalida (debe ser critico, alto, medio o bajo)'),
    body('tiempo_respuesta_min')
      .isInt({ min: 1 })
      .withMessage('El tiempo de respuesta (MTTA) debe ser un numero entero positivo'),
    body('tiempo_resolucion_min')
      .isInt({ min: 1 })
      .withMessage('El tiempo de resolucion (MTTR) debe ser un numero entero positivo'),
    body('horario_laboral')
      .optional()
      .isBoolean()
      .withMessage('El horario laboral debe ser booleano'),
    body('hora_inicio')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('La hora de inicio debe tener el formato HH:MM'),
    body('hora_fin')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('La hora de fin debe tener el formato HH:MM'),
    body('dias_laborales')
      .optional()
      .isArray()
      .withMessage('Los dias laborales deben ser un arreglo de enteros')
  ],
  validate,
  c.crearSla
);

router.put('/slas/:id',
  [
    param('id').isUUID().withMessage('ID de SLA invalido'),
    body('nombre')
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('El nombre del SLA es requerido (minimo 3, maximo 150 caracteres)'),
    body('categoria_id')
      .optional({ checkFalsy: true })
      .isUUID()
      .withMessage('categoria_id debe ser un UUID valido'),
    body('prioridad')
      .isIn(['critico', 'alto', 'medio', 'bajo'])
      .withMessage('Prioridad invalida (debe ser critico, alto, medio o bajo)'),
    body('tiempo_respuesta_min')
      .isInt({ min: 1 })
      .withMessage('El tiempo de respuesta (MTTA) debe ser un numero entero positivo'),
    body('tiempo_resolucion_min')
      .isInt({ min: 1 })
      .withMessage('El tiempo de resolucion (MTTR) debe ser un numero entero positivo'),
    body('horario_laboral')
      .optional()
      .isBoolean()
      .withMessage('El horario laboral debe ser booleano'),
    body('hora_inicio')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('La hora de inicio debe tener el formato HH:MM'),
    body('hora_fin')
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('La hora de fin debe tener el formato HH:MM'),
    body('dias_laborales')
      .optional()
      .isArray()
      .withMessage('Los dias laborales deben ser un arreglo de enteros'),
    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El estado activo debe ser un valor booleano')
  ],
  validate,
  c.actualizarSla
);

router.delete('/slas/:id',
  [
    param('id').isUUID().withMessage('ID de SLA invalido')
  ],
  validate,
  c.eliminarSla
);

module.exports = router;
