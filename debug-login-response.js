const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugLoginResponse() {
  try {
    console.log('=== ANALISANDO RESPOSTA DO LOGIN ===\n');

    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);

    console.log('2. Resposta completa do backend:');
    console.log(JSON.stringify(loginResponse.data, null, 2));

    console.log('\n3. Estrutura da resposta:');
    console.log('- loginResponse.data.success:', loginResponse.data.success);
    console.log(
      '- loginResponse.data.token:',
      loginResponse.data.token ? 'EXISTE' : 'NÃO EXISTE'
    );
    console.log(
      '- loginResponse.data.user:',
      loginResponse.data.user ? 'EXISTE' : 'NÃO EXISTE'
    );
    console.log(
      '- loginResponse.data.data:',
      loginResponse.data.data ? 'EXISTE' : 'NÃO EXISTE'
    );

    if (loginResponse.data.data) {
      console.log(
        '- loginResponse.data.data.token:',
        loginResponse.data.data.token ? 'EXISTE' : 'NÃO EXISTE'
      );
      console.log(
        '- loginResponse.data.data.user:',
        loginResponse.data.data.user ? 'EXISTE' : 'NÃO EXISTE'
      );
    }

    console.log('\n4. O que o frontend está tentando acessar:');
    console.log('- Frontend busca: response.data.token');
    console.log('- Backend retorna: response.token');
    console.log('- Compatibilidade: ❌ INCOMPATÍVEL');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

debugLoginResponse().catch(console.error);
