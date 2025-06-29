const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.DB_URI) {
      console.log('⚠️  DB_URI não configurada no arquivo .env');
      console.log('📝 Configure sua string de conexão MongoDB no arquivo .env');
      return;
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    };

    await mongoose.connect(process.env.DB_URI, options);
    console.log('✅ MongoDB connected successfully');
    console.log(`🗄️ Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n🔧 Soluções possíveis:');
    console.log('1. Verifique se o MongoDB está rodando');
    console.log('2. Verifique a string de conexão no arquivo .env');
    console.log('3. Para MongoDB local: mongodb://localhost:27017/epu_gestao');
    console.log(
      '4. Para MongoDB com auth: mongodb://admin:password@host:port/database?authSource=admin'
    );
    console.log('\n📝 O servidor continuará rodando sem banco de dados...\n');

    // Não mata o processo, apenas mostra o erro
    // process.exit(1);
  }
};

module.exports = connectDB;
