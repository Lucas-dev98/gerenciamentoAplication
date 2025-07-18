// Conectar ao MongoDB e verificar usuários
const { MongoClient } = require('mongodb');

async function checkUsers() {
  console.log('🔍 Verificando usuários no MongoDB...\n');

  const client = new MongoClient('mongodb://localhost:27017');

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('epu-gestao');
    const usersCollection = db.collection('users');

    // Buscar todos os usuários
    const users = await usersCollection.find({}).toArray();
    console.log(`📊 ${users.length} usuários encontrados:`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nome: ${user.name || 'Não informado'}`);
      console.log(`   Role: ${user.role || 'Não informado'}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      console.log('Vamos criar um usuário admin diretamente no banco...');

      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = {
        name: 'Admin',
        email: 'admin@epu.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(adminUser);
      console.log('✅ Usuário admin criado:', result.insertedId);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.close();
  }
}

checkUsers();
