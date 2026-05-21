const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

/**
 * authMiddleware(roles?)
 * @param {string[]} roles — lista de roles permitidos. Si vacío, cualquier usuario autenticado.
 * Ejemplo de uso en rutas:
 *   router.get('/tickets',  authMiddleware(),            ticketsController.list);
 *   router.post('/usuarios', authMiddleware(['admin']), usuariosController.create);
 */
function authMiddleware(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido. Incluir: Authorization: Bearer <token>' });
    }

    const token = header.slice(7);

    try {
      const payload = jwt.verify(token, jwtSecret);
      req.user = payload;  // { id, correo, rol, perfil, nombre }

      // Verificar rol si se especificó
      if (roles.length > 0 && !roles.includes(payload.rol)) {
        return res.status(403).json({
          error: 'Sin permisos para esta acción',
          requerido: roles,
          tuRol: payload.rol,
        });
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado. Usar /api/auth/refresh' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
}

module.exports = authMiddleware;