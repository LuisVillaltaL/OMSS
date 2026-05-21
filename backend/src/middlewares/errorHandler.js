const errorHandler = (err, req, res, next) => {
  console.error('💥 Error no manejado:', err.message);

  // Errores PostgreSQL
  if (err.code === '23505') {  // unique_violation
    return res.status(409).json({
      error: 'Registro duplicado',
      detalle: err.detail || 'Ya existe un registro con ese valor',
    });
  }
  if (err.code === '23503') {  // foreign_key_violation
    return res.status(400).json({
      error: 'Referencia inválida',
      detalle: err.detail || 'El registro referenciado no existe',
    });
  }
  if (err.code === '22P02') {  // invalid_text_representation (UUID inválido)
    return res.status(400).json({ error: 'ID con formato inválido' });
  }

  // Error de JWT (seguridad)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Error genérico
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;