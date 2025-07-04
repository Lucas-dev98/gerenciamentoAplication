/**
 * Teste Final das Rotas do Sistema EPU-Gestão
 *
 * Testa todas as rotas protegidas importantes:
 * - /api/projects
 * - /api/projects/statistics
 * - /api/projects-crud/stats
 * - /api/projects-crud/statistics
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Dados do usuário para login
const testUser = {
  email: 'l.o.bastos@live.com',
  password: '44351502741-+as',
};

let authToken = null;

/**
 * Faz login e retorna o token de autenticação
 */
async function login() {
  try {
    console.log('🔐 Fazendo login...');

    const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);

    if (response.data && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login realizado com sucesso');
      console.log('📋 Token obtido:', authToken.substring(0, 20) + '...');
      return authToken;
    } else {
      throw new Error('Token não encontrado na resposta do login');
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Testa uma rota protegida específica
 */
async function testProtectedRoute(routePath, routeName) {
  try {
    console.log(`\n🧪 Testando rota: ${routeName}`);
    console.log(`📍 URL: ${BASE_URL}${routePath}`);

    const response = await axios.get(`${BASE_URL}${routePath}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log(`✅ ${routeName} - Status: ${response.status}`);

    // Mostra dados relevantes da resposta
    if (routePath.includes('statistics') || routePath.includes('stats')) {
      console.log(`📊 Dados retornados:`, {
        total: response.data?.total || 'N/A',
        keys: Object.keys(response.data || {}),
      });
    } else {
      console.log(
        `📁 Projetos encontrados: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ ${routeName} - Erro:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    return false;
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('🚀 Iniciando testes das rotas do EPU-Gestão');
  console.log('=' + '='.repeat(50));

  try {
    // 1. Fazer login
    await login();

    // 2. Definir rotas para testar
    const routes = [
      {
        path: '/api/projects',
        name: 'Lista de Projetos Principal',
      },
      {
        path: '/api/projects/statistics',
        name: 'Estatísticas Projetos Principal',
      },
      {
        path: '/api/projects-crud',
        name: 'Lista de Projetos CRUD',
      },
      {
        path: '/api/projects-crud/stats',
        name: 'Estatísticas CRUD (stats)',
      },
      {
        path: '/api/projects-crud/statistics',
        name: 'Estatísticas CRUD (statistics)',
      },
    ];

    // 3. Testar cada rota
    let successCount = 0;
    let totalTests = routes.length;

    for (const route of routes) {
      const success = await testProtectedRoute(route.path, route.name);
      if (success) successCount++;
    }

    // 4. Resultado final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL DOS TESTES');
    console.log('='.repeat(60));
    console.log(`✅ Sucessos: ${successCount}/${totalTests}`);
    console.log(`❌ Falhas: ${totalTests - successCount}/${totalTests}`);

    if (successCount === totalTests) {
      console.log(
        '🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.'
      );
    } else {
      console.log('⚠️  Algumas rotas ainda apresentam problemas.');
    }
  } catch (error) {
    console.error('💥 Erro geral nos testes:', error.message);
  }
}

// Executar os testes
runAllTests()
  .then(() => {
    console.log('\n🏁 Testes finalizados');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
