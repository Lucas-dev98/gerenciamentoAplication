const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const logger = require('../utils/logger');

const register = async ({ username, email, password, fullName, phone }) => {
  try {
    logger.debug('Verificando se usuário já existe', { username, email });

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
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  logger.info(`User ${user.username} logged in successfully`);
  return {
    token,
    user: { id: user._id, username: user.username, email: user.email },
  };
};

const getAllUsers = async () => {
  const users = await User.find({}).sort({ createdAt: -1 });
  logger.info(`Retrieved ${users.length} users`);
  return users;
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (user) {
    logger.info(`User ${user.username} retrieved successfully`);
  }
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (user) {
    logger.info(`User ${user.username} updated successfully`);
  }
  return user;
};

module.exports = { register, login, getAllUsers, getUserById, updateUser };
