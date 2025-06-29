const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Importação condicional do modelo
let User;
try {
  User = require('../models/userModels');
} catch (error) {
  logger.debug('Modelo de usuário não carregado, usando modo mock', {
    error: error.message,
  });
}

// Mock storage para desenvolvimento sem banco
const mockUsers = new Map();

// Verificar se deve usar modo mock (sem banco)
const useMockMode = () => {
  // Usar MongoDB se DB_URI estiver configurada e não estiver em modo mock explícito
  return !process.env.DB_URI || process.env.NODE_ENV === 'development-mock';
};

const register = async ({ username, email, password, fullName, phone }) => {
  try {
    logger.debug('Verificando se usuário já existe', { username, email });

    // Modo mock para desenvolvimento sem banco
    if (useMockMode()) {
      logger.info('🔧 Usando modo desenvolvimento (sem banco)', {
        username,
        email,
      });

      // Verificar se usuário já existe no mock
      for (const [key, user] of mockUsers) {
        if (user.email === email || user.username === username) {
          const existingField = user.email === email ? 'email' : 'username';
          const existingValue = user.email === email ? email : username;

          logger.warn('Tentativa de registro com dados já existentes (mock)', {
            existingField,
            existingValue,
            attemptedUsername: username,
            attemptedEmail: email,
          });

          const error = new Error('User already exists');
          error.details = {
            conflictField: existingField,
            conflictValue: existingValue,
            suggestion: `O ${existingField === 'email' ? 'email' : 'nome de usuário'} '${existingValue}' já está em uso`,
          };
          throw error;
        }
      }

      // Criar usuário mock
      const userId = Date.now().toString();
      const mockUser = {
        _id: userId,
        username,
        email,
        password, // Em produção seria hasheado
        fullName,
        phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsers.set(userId, mockUser);

      logger.info('Usuário registrado com sucesso (mock)', {
        userId,
        username,
        email,
        fullName,
      });

      return {
        _id: userId,
        username,
        email,
        fullName,
        phone,
        createdAt: mockUser.createdAt,
      };
    }

    // Modo normal com banco
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      const existingField = userExists.email === email ? 'email' : 'username';
      const existingValue = userExists.email === email ? email : username;

      logger.warn('Tentativa de registro com dados já existentes', {
        existingField,
        existingValue,
        attemptedUsername: username,
        attemptedEmail: email,
      });

      const error = new Error('User already exists');
      error.details = {
        conflictField: existingField,
        conflictValue: existingValue,
        suggestion: `O ${existingField === 'email' ? 'email' : 'nome de usuário'} '${existingValue}' já está em uso`,
      };
      throw error;
    }

    logger.debug('Criando novo usuário', { username, email });

    const user = new User({
      username,
      email,
      password,
      fullName,
      phone,
    });

    await user.save();

    logger.info(`Usuário criado com sucesso no banco: ${username} (${email})`);

    return user;
  } catch (error) {
    logger.error('Erro no serviço de registro', {
      error: error.message,
      userData: { username, email, fullName, phone },
      stack: error.stack,
    });
    throw error;
  }
};

const login = async ({ email, password }) => {
  try {
    logger.debug('Tentativa de login', { email });

    // Modo mock para desenvolvimento sem banco
    if (useMockMode()) {
      logger.info('🔧 Usando modo desenvolvimento (sem banco) - Login', {
        email,
      });

      // Buscar usuário no mock
      let foundUser = null;
      for (const [key, user] of mockUsers) {
        if (user.email === email) {
          foundUser = user;
          break;
        }
      }

      if (!foundUser) {
        logger.warn('Tentativa de login com email não encontrado (mock)', {
          email,
        });
        throw new Error('Invalid credentials');
      }

      // Validação de senha simples (em produção seria hash)
      if (foundUser.password !== password) {
        logger.warn('Tentativa de login com senha incorreta (mock)', { email });
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: foundUser._id },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '24h' }
      );

      logger.info('Login realizado com sucesso (mock)', {
        userId: foundUser._id,
        username: foundUser.username,
        email,
      });

      return {
        token,
        user: {
          id: foundUser._id,
          username: foundUser.username,
          email: foundUser.email,
          fullName: foundUser.fullName,
        },
      };
    }

    // Modo normal com banco
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Tentativa de login com email não encontrado', { email });
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    logger.info('Login realizado com sucesso', {
      userId: user._id,
      username: user.username,
      email,
    });

    return {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    };
  } catch (error) {
    logger.error('Erro no login', {
      error: error.message,
      email,
    });
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    // Modo mock para desenvolvimento sem banco
    if (useMockMode()) {
      logger.info(
        '🔧 Usando modo desenvolvimento (sem banco) - Listando usuários'
      );
      const users = Array.from(mockUsers.values());
      logger.info(`Retrieved ${users.length} users (mock)`);
      return users;
    }

    // Modo normal com banco
    const users = await User.find({}).sort({ createdAt: -1 });
    logger.info(`Retrieved ${users.length} users`);
    return users;
  } catch (error) {
    logger.error('Erro ao buscar usuários', { error: error.message });
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    // Modo mock para desenvolvimento sem banco
    if (useMockMode()) {
      logger.info(
        '🔧 Usando modo desenvolvimento (sem banco) - Buscando usuário por ID',
        { id }
      );
      const user = mockUsers.get(id);
      if (user) {
        logger.info(`User ${user.username} retrieved successfully (mock)`);
      }
      return user;
    }

    // Modo normal com banco
    const user = await User.findById(id);
    if (user) {
      logger.info(`User ${user.username} retrieved successfully`);
    }
    return user;
  } catch (error) {
    logger.error('Erro ao buscar usuário por ID', { error: error.message, id });
    throw error;
  }
};

const updateUser = async (id, updateData) => {
  try {
    // Modo mock para desenvolvimento sem banco
    if (useMockMode()) {
      logger.info(
        '🔧 Usando modo desenvolvimento (sem banco) - Atualizando usuário',
        { id, updateData }
      );
      const user = mockUsers.get(id);
      if (!user) {
        return null;
      }

      const updatedUser = {
        ...user,
        ...updateData,
        updatedAt: new Date(),
      };

      mockUsers.set(id, updatedUser);
      logger.info(`User ${updatedUser.username} updated successfully (mock)`);
      return updatedUser;
    }

    // Modo normal com banco
    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (user) {
      logger.info(`User ${user.username} updated successfully`);
    }
    return user;
  } catch (error) {
    logger.error('Erro ao atualizar usuário', {
      error: error.message,
      id,
      updateData,
    });
    throw error;
  }
};

// Gerar token JWT
const generateToken = (userId, email, username) => {
  const payload = {
    id: userId,
    email: email,
    username: username,
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret-key',
    options
  );
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  generateToken,
};
