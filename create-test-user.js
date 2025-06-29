const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function createTestUser() {
  try {
    console.log('Criando usuário de teste...');

    const userData = {
      name: 'Teste CSV',
      username: 'testecsv',
      email: 'teste@csv.com',
      password: 'teste123',
      role: 'admin',
    };

    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      userData
    );

    console.log('✅ Usuário criado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.includes('já existe')
    ) {
      console.log('✅ Usuário já existe, pode fazer login');
      return { exists: true };
    }
    console.error(
      '❌ Erro ao criar usuário:',
      error.response?.data || error.message
    );
    throw error;
  }
}

createTestUser();
