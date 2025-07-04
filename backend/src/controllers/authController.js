/**
 * Authentication Controller - Clean Architecture Implementation
 *
 * Controller responsável pela autenticação e autorização de usuários
 * seguindo os princípios de Clean Architecture e SOLID.
 *
 * Funcionalidades:
 * - Login e logout de usuários
 * - Registro de novos usuários
 * - Validação de tokens JWT
 * - Gestão de sessões
 * - Validação de dados de entrada
 *
 * @version 3.0.0
 * @architecture Clean Architecture
 * @layer Interface/Controllers
 */

const authService = require('../services/authServices');
const logger = require('../utils/logger');
const validator = require('validator');

// Função para sanitizar dados de entrada
const sanitizeInput = (data) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Escapar HTML e remover caracteres potencialmente perigosos
      sanitized[key] = validator.escape(value.trim());
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Validação de dados de entrada
const validateRegisterData = (username, email, password) => {
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username deve ter pelo menos 3 caracteres');
  }

  if (!email || !email.includes('@')) {
    errors.push('Email deve ser válido');
  }

  if (!password || password.length < 6) {
    errors.push('Password deve ter pelo menos 6 caracteres');
  }

  return errors;
};

const register = async (req, res, next) => {
  try {
    // Sanitizar dados de entrada
    const sanitizedData = sanitizeInput(req.body);
    const { username, email, password, fullName, phone } = sanitizedData;

    // Log da tentativa de registro
    logger.debug('Tentativa de registro de usuário', {
      username,
      email,
      fullName,
      phone: phone ? '[REDACTED]' : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Validar dados obrigatórios
    const validationErrors = validateRegisterData(username, email, password);
    if (validationErrors.length > 0) {
      logger.warn('Falha na validação de dados de registro', {
        errors: validationErrors,
        providedData: { username, email, fullName, phone },
      });

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos fornecidos',
        errors: validationErrors,
        details: {
          username: username || 'Não fornecido',
          email: email || 'Não fornecido',
          passwordLength: password ? password.length : 0,
        },
      });
    }

    const userData = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName?.trim(),
      phone: phone?.trim(),
    };

    const user = await authService.register(userData);

    // Gerar token para auto-login após registro
    const token = authService.generateToken(
      user._id,
      user.email,
      user.username
    );

    logger.info(`Usuário registrado com sucesso: ${username} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      token: token, // Incluir token para auto-login
    });
  } catch (error) {
    logger.error('Erro no registro de usuário', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    if (error.message === 'User already exists') {
      return res.status(409).json({
        success: false,
        message: 'Usuário já existe',
        details: {
          suggestion: 'Tente um username ou email diferente',
          providedUsername: req.body.username,
          providedEmail: req.body.email,
        },
      });
    }

    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // Sanitizar dados de entrada
    const sanitizedData = sanitizeInput(req.body);
    const { email, password } = sanitizedData;

    logger.debug('Tentativa de login', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (!email || !password) {
      logger.warn('Tentativa de login com dados incompletos', {
        hasEmail: !!email,
        hasPassword: !!password,
      });

      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
        details: {
          missingFields: [
            ...(!email ? ['email'] : []),
            ...(!password ? ['password'] : []),
          ],
        },
      });
    }

    const { token, user } = await authService.login({ email, password });

    logger.info(`Login bem-sucedido para usuário: ${user.username} (${email})`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user,
    });
  } catch (error) {
    logger.error('Erro no login', {
      error: error.message,
      email: req.body.email,
      userAgent: req.get('User-Agent'),
    });

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
        details: {
          suggestion: 'Verifique seu email e senha',
          email: req.body.email,
        },
      });
    }

    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    logger.debug('Solicitação para listar todos os usuários');

    const users = await authService.getAllUsers();

    logger.info(
      `Lista de usuários recuperada: ${users.length} usuários encontrados`
    );

    res.json({
      success: true,
      message: 'Usuários listados com sucesso',
      count: users.length,
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    logger.error('Erro ao listar usuários', {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

// Verificar token JWT
const verifyToken = async (req, res) => {
  try {
    logger.debug('Token verification request', { userId: req.user.id });

    // Se chegou até aqui, o token é válido (passou pelo authMiddleware)
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      logger.warn('User not found during token verification', {
        userId: req.user.id,
      });
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        valid: false,
      });
    }

    logger.info('Token verification successful', {
      userId: req.user.id,
      username: user.username,
    });

    res.json({
      success: true,
      message: 'Token válido',
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
      tokenInfo: {
        issuedAt: req.user.iat ? new Date(req.user.iat * 1000) : null,
        expiresAt: req.user.exp ? new Date(req.user.exp * 1000) : null,
        timeToExpiry: req.user.exp
          ? req.user.exp - Math.floor(Date.now() / 1000)
          : null,
      },
    });
  } catch (error) {
    logger.error('Error in token verification', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      valid: false,
    });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.debug('Solicitação para buscar usuário por ID', { userId: id });

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        details: { providedId: id },
      });
    }

    const user = await authService.getUserById(id);

    if (!user) {
      logger.warn('Usuário não encontrado', { userId: id });

      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        details: {
          searchedId: id,
          suggestion: 'Verifique se o ID está correto',
        },
      });
    }

    logger.info(`Usuário encontrado: ${user.username} (ID: ${id})`);

    res.json({
      success: true,
      message: 'Usuário encontrado',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário por ID', {
      error: error.message,
      userId: req.params.id,
      stack: error.stack,
    });
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone } = req.body;

    logger.debug('Tentativa de atualização de usuário', {
      userId: id,
      updateData: { fullName, phone },
    });

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        details: { providedId: id },
      });
    }

    if (!fullName && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Pelo menos um campo deve ser fornecido para atualização',
        details: {
          allowedFields: ['fullName', 'phone'],
          providedFields: Object.keys(req.body),
        },
      });
    }

    const updatedUser = await authService.updateUser(id, { fullName, phone });

    if (!updatedUser) {
      logger.warn('Tentativa de atualizar usuário inexistente', { userId: id });

      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado para atualização',
        details: {
          searchedId: id,
          suggestion: 'Verifique se o ID está correto',
        },
      });
    }

    logger.info(
      `Usuário atualizado com sucesso: ${updatedUser.username} (ID: ${id})`
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Erro ao atualizar usuário', {
      error: error.message,
      userId: req.params.id,
      updateData: req.body,
      stack: error.stack,
    });
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.debug('Tentativa de exclusão de usuário', { userId: id });

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório',
        details: { providedId: id },
      });
    }

    const deletedUser = await authService.deleteUser(id);

    if (!deletedUser) {
      logger.warn('Tentativa de excluir usuário inexistente', { userId: id });

      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado para exclusão',
        details: {
          searchedId: id,
          suggestion: 'Verifique se o ID está correto',
        },
      });
    }

    logger.info(
      `Usuário excluído com sucesso: ${deletedUser.username} (ID: ${id})`
    );

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso',
      user: {
        id: deletedUser._id,
        username: deletedUser.username,
        email: deletedUser.email,
        fullName: deletedUser.fullName,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('Erro ao excluir usuário', {
      error: error.message,
      userId: req.params.id,
      stack: error.stack,
    });
    next(error);
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyToken,
};
