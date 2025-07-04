require('dotenv').config({ path: './backend/.env' });

console.log('🔧 Testando configurações do ambiente...');
console.log(
  'DB_URI:',
  process.env.DB_URI ? '✅ Configurado' : '❌ Não configurado'
);
console.log('PORT:', process.env.PORT || 'Padrão (5000)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Não definido');

// Testar conexão com MongoDB
const mongoose = require('mongoose');

const testDB = async () => {
  try {
    console.log('\n🔗 Testando conexão via variável de ambiente...');
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Conexão funcionando via .env');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erro na conexão via .env:', error.message);
  }
};

testDB();
