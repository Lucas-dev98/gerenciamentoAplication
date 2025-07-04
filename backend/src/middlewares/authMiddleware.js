const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      logger.warn('Tentativa de acesso sem token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Formato de token inválido', {
        ip: req.ip,
        authHeader: authHeader.substring(0, 20) + '...',
      });
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token || token.length < 10) {
      logger.warn('Token muito curto ou vazio', {
        ip: req.ip,
        tokenLength: token ? token.length : 0,
      });
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      logger.warn('Token decodificado inválido', {
        ip: req.ip,
        decoded: decoded ? Object.keys(decoded) : null,
      });
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    req.user = decoded;
    logger.debug('Token válido', {
      userId: decoded.id,
      userEmail: decoded.email,
      ip: req.ip,
    });

    next();
  } catch (error) {
    logger.error('Erro na validação do token', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Erro na validação do token',
    });
  }
};

module.exports = authMiddleware;
