const router   = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');
const auth     = require('../middlewares/auth');
const c        = require('../controllers/ticketsController');

// Todos los endpoints necesitan autenticación
router.use(auth());

// ── GET /api/tickets/catalogo — datos para formulario ──────────
// esta ruta va ANTES de /:id para no ser capturada por el param
router.get('/catalogo', c.catalogo);

// ── GET /api/tickets ───────────────────────────────────────────
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('estado').optional().isIn(['abierto','en_progreso','escalado','resuelto','cerrado']),
    query('prioridad').optional().isIn(['critico','alto','medio','bajo']),
  ],
  validate,
  c.listar
);

// ── GET /api/tickets/:id ───────────────────────────────────────
router.get('/:id',
  param('id').isUUID().withMessage('ID inválido'),
  validate,
  c.obtener
);

// ── POST /api/tickets ─────────────────────────────────────────
router.post('/',
  [
    body('titulo').trim().isLength({ min: 5, max: 255 }).withMessage('Título: mínimo 5, máximo 255 caracteres'),
    body('prioridad').isIn(['critico','alto','medio','bajo']).withMessage('Prioridad inválida'),
    body('categoria_id').isUUID().withMessage('categoria_id debe ser un UUID válido'),
    body('reportado_por').isUUID().withMessage('reportado_por debe ser un UUID válido'),
  ],
  validate,
  c.crear
);

// ── PATCH /api/tickets/:id ─────────────────────────────────────
router.patch('/:id',
  auth(['admin','tecnico_l1','tecnico_l2']),
  param('id').isUUID(),
  validate,
  c.actualizar
);

// ── POST /api/tickets/:id/notas ───────────────────────────────
router.post('/:id/notas',
  param('id').isUUID(),
  body('contenido').trim().isLength({ min: 1 }).withMessage('La nota no puede estar vacía'),
  validate,
  c.agregarNota
);

// ── POST /api/tickets/:id/escalar ─────────────────────────────
router.post('/:id/escalar',
  auth(['admin','tecnico_l1','tecnico_l2']),
  [
    param('id').isUUID(),
    body('asignado_ahora').isUUID().withMessage('asignado_ahora debe ser UUID'),
    body('motivo').trim().isLength({ min: 5 }).withMessage('Motivo requerido (mín. 5 chars)'),
  ],
  validate,
  c.escalar
);

// ── POST /api/tickets/:id/reabrir ─────────────────────────────
router.post('/:id/reabrir',
  param('id').isUUID(),
  validate,
  c.reabrir
);

module.exports = router;