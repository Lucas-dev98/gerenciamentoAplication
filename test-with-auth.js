const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Configure axios to handle cookies and headers
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

async function createUserIfNotExists() {
  try {
    console.log('=== CRIANDO/VERIFICANDO USUÁRIO DE TESTE ===');

    const userData = {
      name: 'Lucas Bastos',
      username: 'lucas.bastos',
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
      role: 'admin',
    };

    console.log('Tentando criar usuário...');
    const response = await api.post('/auth/register', userData);

    console.log('✅ Usuário criado com sucesso:', {
      id: response.data.data.user.id,
      name: response.data.data.user.name,
      email: response.data.data.user.email,
      role: response.data.data.user.role,
    });

    return response.data.data.user;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('👍 Usuário já existe, continuando...');
      return { email: 'l.o.bastos@live.com' };
    } else {
      console.log(
        '❌ Erro na criação do usuário:',
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

async function loginUser() {
  try {
    console.log('\n=== FAZENDO LOGIN ===');

    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    console.log('Enviando dados de login...');
    const response = await api.post('/auth/login', loginData);

    console.log('✅ Login realizado com sucesso');
    console.log('Token recebido:', response.data.data.token ? 'SIM' : 'NÃO');

    authToken = response.data.data.token;

    // Set the token for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    return response.data;
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

async function testHealthCheck() {
  try {
    console.log('\n=== TESTANDO HEALTH CHECK ===');
    const response = await api.get('/health');
    console.log('✅ Health check OK:', response.data.status);
    return true;
  } catch (error) {
    console.log(
      '❌ Health check falhou:',
      error.response?.data || error.message
    );
    return false;
  }
}

async function testDatabaseHealth() {
  try {
    console.log('\n=== TESTANDO DATABASE HEALTH ===');
    const response = await api.get('/health/db');
    console.log('✅ Database health OK:', response.data.database.status);
    return true;
  } catch (error) {
    console.log(
      '❌ Database health falhou:',
      error.response?.data || error.message
    );
    return false;
  }
}

async function testAuthVerification() {
  try {
    console.log('\n=== TESTANDO VERIFICAÇÃO DE TOKEN ===');
    const response = await api.get('/auth/verify');
    console.log('✅ Token válido:', response.data.user.email);
    return true;
  } catch (error) {
    console.log(
      '❌ Verificação de token falhou:',
      error.response?.data || error.message
    );
    return false;
  }
}

async function testProjectsList() {
  try {
    console.log('\n=== TESTANDO LISTA DE PROJETOS ===');
    const response = await api.get('/projects');
    console.log(
      '✅ Lista de projetos obtida:',
      response.data.data?.length || 0,
      'projetos'
    );
    return response.data.data || [];
  } catch (error) {
    console.log(
      '❌ Erro ao obter lista de projetos:',
      error.response?.data || error.message
    );
    return [];
  }
}

async function testProjectEndpoints(projectId) {
  console.log(`\n=== TESTANDO ENDPOINTS DO PROJETO ${projectId} ===`);

  const endpoints = [
    '/procedimento-parada',
    '/manutencao',
    '/procedimento-partida',
    '/frentes',
    '/statistics',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTestando: /projects/${projectId}${endpoint}`);
      const response = await api.get(`/projects/${projectId}${endpoint}`);

      if (response.data && response.data.data) {
        console.log(
          `✅ ${endpoint.replace('/', '')} OK:`,
          Array.isArray(response.data.data)
            ? `${response.data.data.length} itens`
            : 'dados obtidos'
        );

        // Show sample data for verification
        if (endpoint === '/statistics') {
          console.log('   Estatísticas:', {
            total_atividades: response.data.data.total_atividades,
            total_horas_planejadas: response.data.data.total_horas_planejadas,
            total_horas_reais: response.data.data.total_horas_reais,
            progresso_geral: response.data.data.progresso_geral + '%',
          });
        } else if (
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          console.log(
            '   Primeira atividade:',
            response.data.data[0].atividade
          );
        }
      } else {
        console.log(`⚠️ ${endpoint.replace('/', '')} retornou dados vazios`);
      }
    } catch (error) {
      console.log(
        `❌ Erro em ${endpoint}:`,
        error.response?.data || error.message
      );
    }
  }
}

async function testProjectDetail(projectId) {
  try {
    console.log(`\n=== TESTANDO DETALHES DO PROJETO ${projectId} ===`);
    const response = await api.get(`/projects/${projectId}`);
    console.log('✅ Detalhes do projeto obtidos:', response.data.data.name);
    return response.data.data;
  } catch (error) {
    console.log(
      '❌ Erro ao obter detalhes do projeto:',
      error.response?.data || error.message
    );
    return null;
  }
}

async function runAllTests() {
  try {
    console.log('🚀 INICIANDO TESTES COM AUTENTICAÇÃO\n');

    // Step 1: Create user if needed
    await createUserIfNotExists();

    // Step 2: Login and get token
    await loginUser();

    if (!authToken) {
      throw new Error('Não foi possível obter token de autenticação');
    }

    // Step 3: Test basic endpoints
    await testHealthCheck();
    await testDatabaseHealth();
    await testAuthVerification();

    // Step 4: Test project endpoints
    const projects = await testProjectsList();

    if (projects.length > 0) {
      const firstProject = projects[0];
      console.log(
        `\n📋 Testando com projeto: ${firstProject.name} (ID: ${firstProject._id})`
      );

      // Test project detail
      await testProjectDetail(firstProject._id);

      // Test all project visualization endpoints
      await testProjectEndpoints(firstProject._id);
    } else {
      console.log(
        '\n⚠️ Nenhum projeto encontrado para testar endpoints específicos'
      );
      console.log(
        '💡 Você pode usar o script test-csv-upload.js para criar um projeto de teste'
      );
    }

    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS!');
  } catch (error) {
    console.error('\n💥 ERRO FATAL:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testProjectEndpoints,
  loginUser,
  createUserIfNotExists,
};
