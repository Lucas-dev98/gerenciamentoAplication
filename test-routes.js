/**
 * Teste para verificar rotas registradas
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testRoutes() {
  try {
    console.log('🧪 Testando rotas registradas...\n');

    // 1. Fazer login para obter token
    console.log('1. Fazendo login...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      loginData
    );
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Testar todas as variações de rotas de projetos
    console.log('\n2. Testando rotas de projetos...');

    const projectRoutes = [
      '/api/projects',
      '/api/projects/statistics',
      '/api/projects-crud',
      '/api/projects-crud/stats',
      '/api/projects-crud/statistics',
    ];

    for (const route of projectRoutes) {
      try {
        console.log(`\n🔍 Testando ${route}...`);
        const response = await axios.get(`${BASE_URL}${route}`, { headers });
        console.log(`✅ ${route}: OK (${response.status})`);
        if (route.includes('stat')) {
          console.log(
            `   📊 Dados:`,
            Object.keys(response.data.data || response.data)
          );
        }
      } catch (error) {
        console.log(
          `❌ ${route}: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
        if (error.response?.status === 500) {
          console.log(`   🔍 Detalhe do erro: ${error.response.data.message}`);
        }
      }
    }

    // 3. Verificar métodos HTTP suportados
    console.log(
      '\n3. Verificando métodos HTTP para /api/projects-crud/stats...'
    );
    try {
      const optionsResponse = await axios.options(
        `${BASE_URL}/api/projects-crud/stats`
      );
      console.log('✅ OPTIONS funcionou');
      console.log('   Allow:', optionsResponse.headers.allow);
    } catch (error) {
      console.log('❌ OPTIONS falhou:', error.response?.status);
    }

    // 4. Testar com diferentes caminhos
    console.log('\n4. Testando variações de caminhos...');
    const variations = [
      '/api/projects-crud/stats/',
      '/api/projects-crud/stats?format=json',
      '/api/projects-crud/statistics',
    ];

    for (const variation of variations) {
      try {
        console.log(`\n🔍 Testando ${variation}...`);
        const response = await axios.get(`${BASE_URL}${variation}`, {
          headers,
        });
        console.log(`✅ ${variation}: OK (${response.status})`);
      } catch (error) {
        console.log(
          `❌ ${variation}: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testRoutes().catch(console.error);
