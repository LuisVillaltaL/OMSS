const router   = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const auth     = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');
const { login, refresh, logout, me } = require('../controllers/authController');

// Rate limit específico para login — máx 10 intentos / 15 min (RNF-4)
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Espera 15 minutos.' },
});

// ── POST /api/auth/login ───────────────────────────────────────
router.post(
  '/login',
  loginLimit,
  [
    body('correo')
      .isEmail().withMessage('Correo inválido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
  ],
  validate,
  login
);

// ── POST /api/auth/refresh ─────────────────────────────────────
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('refreshToken requerido'),
  ],
  validate,
  refresh
);

// ── POST /api/auth/logout ──────────────────────────────────────
router.post('/logout', auth(), logout);

// ── GET /api/auth/me — obtener usuario actual ──────────────────
router.get('/me', auth(), me);

module.exports = router;