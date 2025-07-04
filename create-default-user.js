// Script para criar um usuário padrão se não existir
const mongoose = require('mongoose');

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.DB_URI || 'mongodb://localhost:27017/epu_gestao'
    );
    console.log('✅ MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Importar modelos
const User = require('./backend/src/models/userModels');

async function createDefaultUserIfNotExists() {
  try {
    await connectDB();

    // Verificar se existe algum usuário
    const userCount = await User.countDocuments();
    console.log(`👥 Total de usuários no banco: ${userCount}`);

    if (userCount === 0) {
      console.log('🔧 Criando usuário padrão...');

      const defaultUser = new User({
        name: 'Administrador',
        email: 'admin@epu-gestao.com',
        password: '$2a$10$dummyHashForDefaultUser', // Hash dummy
        role: 'admin',
        isActive: true,
      });

      const savedUser = await defaultUser.save();
      console.log(`✅ Usuário padrão criado: ${savedUser._id}`);
      console.log(`📧 Email: ${savedUser.email}`);

      return savedUser._id;
    } else {
      // Buscar o primeiro usuário para usar como owner padrão
      const firstUser = await User.findOne({}).exec();
      console.log(
        `👤 Usando usuário existente como owner padrão: ${firstUser._id}`
      );
      console.log(`📧 Email: ${firstUser.email}`);

      return firstUser._id;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar/criar usuário padrão:', error);
    process.exit(1);
  }
}

createDefaultUserIfNotExists()
  .then((userId) => {
    console.log(`🎯 Owner padrão para projetos: ${userId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
