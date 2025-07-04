const express = require('express');
const router = express.Router();
const User = require('../models/userModels');
const authMiddleware = require('../middlewares/authMiddleware');
const logger = require('../utils/logger');

console.log('👤 User routes loading...');

// Middleware de autenticação obrigatório para TODAS as rotas de usuários
router.use(authMiddleware);

// 🔐 Rotas protegidas - requerem autenticação
router.get('/', async (req, res) => {
  const action = 'GET_ALL_USERS';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting user listing`, {
      userId: req.user?.id,
      userRole: req.user?.role,
    });

    // Apenas admins podem ver lista de usuários
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        type: 'FORBIDDEN',
        message: 'Acesso negado. Apenas administradores podem listar usuários.',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const users = await User.find(
      { isActive: true },
      { password: 0 } // Excluir senha da resposta
    ).sort({ createdAt: -1 });

    const duration = Date.now() - startTime;
    logger.info(`${action}: Users retrieved successfully`, {
      count: users.length,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      data: users,
      count: users.length,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Error retrieving users`, {
      error: error.message,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      status: 'error',
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Erro ao buscar usuários',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
});

router.get('/:id', async (req, res) => {
  const action = 'GET_USER_BY_ID';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting user retrieval`, {
      targetUserId: id,
      userId: req.user?.id,
    });

    // Usuários só podem ver seus próprios dados, exceto admins
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({
        status: 'error',
        type: 'FORBIDDEN',
        message: 'Acesso negado. Você só pode ver seus próprios dados.',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const user = await User.findById(id, { password: 0 });

    if (!user || !user.isActive) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Usuário não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: User retrieved successfully`, {
      targetUserId: id,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      data: user,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Error retrieving user`, {
      error: error.message,
      targetUserId: req.params.id,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      status: 'error',
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Erro ao buscar usuário',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
});

// Rota para buscar perfil do usuário atual
router.get('/profile/me', async (req, res) => {
  const action = 'GET_MY_PROFILE';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting profile retrieval`, {
      userId: req.user?.id,
    });

    const user = await User.findById(req.user?.id, { password: 0 });

    if (!user || !user.isActive) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Perfil não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: Profile retrieved successfully`, {
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      data: user,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Error retrieving profile`, {
      error: error.message,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      status: 'error',
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Erro ao buscar perfil',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
});

console.log('✅ User routes configured successfully - ALL PROTECTED');
module.exports = router;
