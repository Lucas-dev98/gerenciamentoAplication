const axios = require('axios');

async function createDebugUser() {
  try {
    console.log('📝 Criando usuário de debug...');

    const response = await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        username: 'debuguser',
        name: 'Debug User',
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );

    console.log('✅ Usuário de debug criado:', response.data);
  } catch (error) {
    console.log(
      '⚠️ Erro ao criar usuário:',
      error.response?.data || error.message
    );
  }
}

createDebugUser();
