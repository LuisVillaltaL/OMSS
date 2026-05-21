const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Datos de entrada inválidos',
      campos: errors.array().map(e => ({
        campo:   e.path,
        mensaje: e.msg,
        valor:   e.value,
      })),
    });
  }
  next();
};

module.exports = validate;