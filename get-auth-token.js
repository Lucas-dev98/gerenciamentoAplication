const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

// Função para fazer login e obter token
const loginAndGetToken = async () => {
  try {
    console.log('🔐 Fazendo login para obter token...');

    // Criar usuário de teste
    try {
      const registerResponse = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          email: 'teste@teste.com',
          password: '123456',
          name: 'Usuário Teste',
          username: 'teste_user',
          role: 'admin',
        }
      );
      console.log('✅ Usuário criado com sucesso');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Usuário já existe, continuando...');
      } else {
        console.error(
          'Erro ao criar usuário:',
          error.response?.data || error.message
        );
      }
    }

    // Fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'teste@teste.com',
      password: '123456',
    });

    console.log('✅ Login realizado com sucesso');
    return loginResponse.data.data.token;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    return null;
  }
};

// Executar
loginAndGetToken()
  .then((token) => {
    if (token) {
      console.log('\n🎫 Token obtido:');
      console.log(token);
      console.log('\n📝 Use este token no arquivo test-csv-real-data.js');
    }
  })
  .catch(console.error);
