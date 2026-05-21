require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const routes       = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const { port, frontendUrl, nodeEnv } = require('./config/env');

const app = express();

// ── Seguridad ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      frontendUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limit global ──────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max:      500,
  standardHeaders: true,
  message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
}));

// ── Body parser ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));       // RF-1.7: adjuntos hasta 10 MB
app.use(express.urlencoded({ extended: true }));

// ── Log de peticiones en desarrollo ───────────────────────────
if (nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Rutas ──────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 para rutas no encontradas ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta ${req.method} ${req.path} no encontrada`,
    rutas_disponibles: [
      'GET  /api/health',
      'POST /api/auth/login',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
    ],
  });
});

// ── Manejador global de errores (siempre al final) ─────────────
app.use(errorHandler);

// ── Iniciar servidor ───────────────────────────────────────────
app.listen(port, () => {
  console.log(`\nITSM API corriendo en http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Entorno: ${nodeEnv}`);
  console.log(`Frontend permitido: ${frontendUrl}\n`);
});