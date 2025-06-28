const axios = require('axios');

async function registerUser() {
  try {
    console.log('📝 Registrando usuário...');

    const response = await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        username: 'csvtester',
        name: 'CSV Test User',
        email: 'csvtest@example.com',
        password: 'TestPass123!',
      }
    );

    console.log('✅ Usuário registrado com sucesso:', response.data);
  } catch (error) {
    console.log('⚠️ Erro ao registrar:', error.response?.data || error.message);
  }
}

registerUser();
