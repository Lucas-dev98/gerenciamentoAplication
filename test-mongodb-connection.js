const mongoose = require('mongoose');

// Configuração da conexão
const DB_URI =
  'mongodb://admin:epugestao123@localhost:27017/epu_gestao?authSource=admin';

const testConnection = async () => {
  try {
    console.log('🔗 Testando conexão com MongoDB...');

    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });

    console.log('✅ Conexão com MongoDB estabelecida');

    // Testar criação de um documento simples
    const testSchema = new mongoose.Schema({
      name: String,
      value: Number,
      createdAt: { type: Date, default: Date.now },
    });

    const TestModel = mongoose.model('Test', testSchema);

    const testDoc = new TestModel({
      name: 'Teste de Conexão',
      value: 123,
    });

    await testDoc.save();
    console.log('✅ Documento de teste criado com sucesso');

    // Limpar documento de teste
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Documento de teste removido');

    await mongoose.connection.close();
    console.log('✅ Conexão fechada com sucesso');
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Stack:', error.stack);
  }
};

testConnection();
