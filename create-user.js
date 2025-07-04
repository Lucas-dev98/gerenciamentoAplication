const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createUser() {
  try {
    console.log('=== CRIANDO USUÁRIO DE TESTE ===');

    const userData = {
      name: 'Lucas Bastos',
      username: 'lucas.bastos',
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
      role: 'admin',
    };

    console.log('Enviando dados do usuário...');
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);

    console.log('✅ Usuário criado com sucesso:', {
      id: response.data.data.user.id,
      name: response.data.data.user.name,
      email: response.data.data.user.email,
      role: response.data.data.user.role,
    });

    return response.data.data.user;
  } catch (error) {
    if (error.response) {
      console.log('❌ Erro na criação do usuário:', error.response.data);
      if (error.response.status === 409) {
        console.log('👍 Usuário já existe, tentando fazer login...');
        return true; // Usuário já existe
      }
    } else {
      console.error('❌ Erro de conexão:', error.message);
    }
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createUser().catch(console.error);
}

module.exports = { createUser };
