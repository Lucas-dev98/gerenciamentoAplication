const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log do erro completo com informações de contexto
  logger.error(`[ERROR] ${req.method} ${req.url}`, {
    error: err.message,
    stack: err.stack,
    type: err.type || err.name,
    code: err.code,
    requestId: req.id,
    timestamp: req.timestamp,
    userId: req.user?.id,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
    params:
      req.params && Object.keys(req.params).length > 0 ? req.params : undefined,
    query:
      req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    headers: {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      authorization: req.get('Authorization') ? 'Bearer [REDACTED]' : 'None',
      'x-request-id': req.id,
    },
  });

  // Base error response structure
  const errorResponse = {
    status: 'error',
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    requestId: req.id,
    path: req.url,
    method: req.method,
  };

  // Diferentes tipos de erro com tratamento específico
  let statusCode = 500;

  // Erros personalizados do serviço
  if (err.type === 'VALIDATION_ERROR') {
    statusCode = 400;
    errorResponse.type = 'VALIDATION_ERROR';
    errorResponse.message = err.message || 'Dados de entrada inválidos';
    errorResponse.details = err.details || [err.message];
  } else if (err.type === 'DUPLICATE_ERROR') {
    statusCode = 409;
    errorResponse.type = 'DUPLICATE_ERROR';
    errorResponse.message = err.message || 'Recurso já existe';
    errorResponse.details = [err.message];
    errorResponse.field = err.field;
  } else if (err.type === 'INVALID_ID') {
    statusCode = 400;
    errorResponse.type = 'INVALID_ID';
    errorResponse.message = err.message || 'ID inválido fornecido';
    errorResponse.details = [err.message];
  }

  // Erros de validação do Mongoose
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.type = 'VALIDATION_ERROR';
    errorResponse.message = 'Dados inválidos fornecidos';
    errorResponse.details = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value,
      kind: error.kind,
    }));
  }

  // Erro de duplicação (unique constraint)
  else if (err.code === 11000) {
    statusCode = 409;
    errorResponse.type = 'DUPLICATE_ERROR';
    errorResponse.message = 'Recurso já existe';
    const field = Object.keys(err.keyPattern)[0];
    errorResponse.details = [
      {
        field: field,
        message: `${field} já está em uso`,
        value: err.keyValue[field],
      },
    ];
    errorResponse.field = field;
  }

  // Erro de cast (ObjectId inválido)
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.type = 'CAST_ERROR';
    errorResponse.message = 'ID inválido fornecido';
    errorResponse.details = [
      {
        field: err.path,
        message: `${err.value} não é um ID válido`,
        value: err.value,
        kind: err.kind,
      },
    ];
  }

  // Erro de JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.type = 'JWT_ERROR';
    errorResponse.message = 'Token de autenticação inválido';
    errorResponse.details = [err.message];
  }

  // Erro de JWT expirado
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.type = 'JWT_EXPIRED';
    errorResponse.message = 'Token de autenticação expirado';
    errorResponse.details = [`Token expirou em ${err.expiredAt}`];
  }

  // Erros customizados da aplicação
  else if (err.status) {
    statusCode = err.status;
    errorResponse.type = err.type || 'CUSTOM_ERROR';
    errorResponse.message = err.message;
    errorResponse.details = err.details ? [err.details] : [err.message];
  }

  // Erro genérico
  else {
    statusCode = 500;
    errorResponse.type = 'INTERNAL_ERROR';
    errorResponse.message =
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Erro interno do servidor';

    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = [err.message];
      errorResponse.stack = err.stack;
    } else {
      errorResponse.details = ['Ocorreu um erro interno. Contacte o suporte.'];
    }
  }

  // Adicionar informações de desenvolvimento se necessário
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      originalError: err.name,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
