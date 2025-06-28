const crypto = require('crypto');

/**
 * Middleware para adicionar um ID único a cada requisição
 * Útil para rastrear requisições nos logs e debug
 */
const requestIdMiddleware = (req, res, next) => {
  // Gerar um ID único para a requisição
  req.id = crypto.randomBytes(8).toString('hex');

  // Adicionar o ID no header de resposta para debug
  res.setHeader('X-Request-ID', req.id);

  // Adicionar timestamp da requisição
  req.timestamp = new Date().toISOString();

  next();
};

module.exports = requestIdMiddleware;
