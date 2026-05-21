require('dotenv').config();

const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

required.forEach(key => {
  if (!process.env[key]) {
    console.warn(`Variable de entorno ${key} no definida — usando valor por defecto`);
  }
});

module.exports = {
  port:       process.env.PORT        || 3000,
  nodeEnv:    process.env.NODE_ENV    || 'development',
  jwtSecret:  process.env.JWT_SECRET  || 'dev_secret_cambiar_en_produccion',
  jwtRefresh: process.env.JWT_REFRESH || 'dev_refresh_cambiar_en_produccion',
  jwtExpiry:  process.env.JWT_EXPIRY  || '8h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
};