/**
 * Teste Completo de Todas as Rotas do Frontend EPU-Gestão
 * Este script testa todas as rotas do frontend e suas integrações com o backend
 */

const axios = require('axios');

// Configuração base
const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_BASE_URL = 'http://localhost:3000';

// Configuração do axios com timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Resultados dos testes
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// Função para log colorido
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Função para teste individual
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    log(`\n${colors.blue}🧪 Testando: ${testName}${colors.reset}`);
    await testFunction();
    log(`${colors.green}✅ PASSOU: ${testName}${colors.reset}`);
    testResults.passed++;
    testResults.details.push({ test: testName, status: 'PASSOU', error: null });
  } catch (error) {
    log(`${colors.red}❌ FALHOU: ${testName}${colors.reset}`);
    log(`${colors.red}   Erro: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.details.push({
      test: testName,
      status: 'FALHOU',
      error: error.message,
    });
  }
}

// Função para verificar se o backend está rodando
async function checkBackendHealth() {
  const response = await api.get('/health');
  if (response.status !== 200) {
    throw new Error('Backend health check failed');
  }
  return response.data;
}

// ============================================================================
// TESTES DE AUTENTICAÇÃO
// ============================================================================

async function testAuthLogin() {
  const response = await api.post('/api/auth/login', {
    email: 'test@test.com',
    password: 'password123',
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Login failed');
  }

  if (!response.data.data.token || !response.data.data.user) {
    throw new Error('Login response missing required data');
  }

  return response.data.data.token;
}

async function testAuthRegister() {
  const response = await api.post('/api/auth/register', {
    name: 'Test User',
    email: 'newuser@test.com',
    password: 'password123',
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Register failed');
  }

  if (!response.data.data.token || !response.data.data.user) {
    throw new Error('Register response missing required data');
  }
}

async function testAuthVerify() {
  const response = await api.get('/api/auth/verify');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Auth verify failed');
  }

  if (!response.data.data.id) {
    throw new Error('Auth verify response missing user data');
  }
}

async function testAuthProfile() {
  const response = await api.put('/api/auth/profile', {
    name: 'Updated Name',
    email: 'updated@test.com',
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Profile update failed');
  }
}

async function testAuthUsers() {
  const response = await api.get('/api/auth/users');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get users failed');
  }

  if (!Array.isArray(response.data.data)) {
    throw new Error('Users response should be an array');
  }
}

// ============================================================================
// TESTES DE PROJETOS
// ============================================================================

async function testProjectsGet() {
  const response = await api.get('/api/projects');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get projects failed');
  }

  if (!response.data.data.projects || !response.data.data.pagination) {
    throw new Error('Projects response missing required structure');
  }
}

async function testProjectsGetWithParams() {
  const response = await api.get(
    '/api/projects?page=1&limit=10&sortBy=name&sortOrder=asc&status=active'
  );

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get projects with params failed');
  }

  const pagination = response.data.data.pagination;
  if (pagination.page !== 1 || pagination.limit !== 10) {
    throw new Error('Pagination parameters not handled correctly');
  }
}

async function testProjectCreate() {
  const projectData = {
    name: 'Test Project',
    description: 'Test project description',
    type: 'development',
    status: 'active',
    priority: 'high',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const response = await api.post('/api/projects', projectData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Create project failed');
  }

  if (!response.data.data.id) {
    throw new Error('Created project should have an ID');
  }

  return response.data.data.id;
}

async function testProjectGetById() {
  // Primeiro criar um projeto
  const projectId = await testProjectCreate();

  const response = await api.get(`/api/projects/${projectId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get project by ID failed');
  }

  if (response.data.data.id !== projectId) {
    throw new Error('Project ID mismatch');
  }
}

async function testProjectUpdate() {
  const projectId = await testProjectCreate();

  const updateData = {
    name: 'Updated Project Name',
    description: 'Updated description',
  };

  const response = await api.put(`/api/projects/${projectId}`, updateData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Update project failed');
  }
}

async function testProjectDelete() {
  const projectId = await testProjectCreate();

  const response = await api.delete(`/api/projects/${projectId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Delete project failed');
  }
}

async function testProjectCSVImport() {
  const response = await api.post('/api/projects/import-csv', {
    csvData: 'name,description\nTest CSV Project,CSV Description',
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error('CSV import failed');
  }
}

async function testProjectCSVExport() {
  const projectId = await testProjectCreate();

  const response = await api.get(`/api/projects/${projectId}/export-csv`);

  if (response.status !== 200) {
    throw new Error('CSV export failed');
  }

  if (!response.headers['content-type'].includes('text/csv')) {
    throw new Error('CSV export should return CSV content type');
  }
}

// ============================================================================
// TESTES DE PROJETOS CRUD
// ============================================================================

async function testProjectsCrudGet() {
  const response = await api.get('/api/projects-crud');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get projects-crud failed');
  }
}

async function testProjectsCrudStats() {
  const response = await api.get('/api/projects-crud/stats');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get projects-crud stats failed');
  }

  const stats = response.data.data;
  if (
    typeof stats.total === 'undefined' ||
    typeof stats.active === 'undefined'
  ) {
    throw new Error('Stats response missing required fields');
  }
}

async function testProjectsCrudCreate() {
  const projectData = {
    name: 'CRUD Test Project',
    description: 'CRUD test description',
    type: 'maintenance',
    status: 'planning',
  };

  const response = await api.post('/api/projects-crud', projectData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Create projects-crud failed');
  }

  return response.data.data.id;
}

async function testProjectsCrudUpdate() {
  const projectId = await testProjectsCrudCreate();

  const updateData = {
    name: 'Updated CRUD Project',
    status: 'active',
  };

  const response = await api.put(`/api/projects-crud/${projectId}`, updateData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Update projects-crud failed');
  }
}

async function testProjectsCrudDelete() {
  const projectId = await testProjectsCrudCreate();

  const response = await api.delete(`/api/projects-crud/${projectId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Delete projects-crud failed');
  }
}

async function testProjectsCrudDuplicate() {
  const projectId = await testProjectsCrudCreate();

  const response = await api.post(`/api/projects-crud/${projectId}/duplicate`, {
    name: 'Duplicated Project',
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Duplicate projects-crud failed');
  }
}

// ============================================================================
// TESTES DE EQUIPES
// ============================================================================

async function testTeamsGet() {
  const response = await api.get('/api/teams');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get teams failed');
  }

  if (!response.data.data.teams) {
    throw new Error('Teams response missing teams array');
  }
}

async function testTeamCreate() {
  const teamData = {
    name: 'Test Team',
    description: 'Test team description',
    department: 'Engineering',
  };

  const response = await api.post('/api/teams', teamData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Create team failed');
  }

  return response.data.data.id;
}

async function testTeamGetById() {
  const teamId = await testTeamCreate();

  const response = await api.get(`/api/teams/${teamId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get team by ID failed');
  }
}

async function testTeamUpdate() {
  const teamId = await testTeamCreate();

  const updateData = {
    name: 'Updated Team Name',
  };

  const response = await api.put(`/api/teams/${teamId}`, updateData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Update team failed');
  }
}

async function testTeamDelete() {
  const teamId = await testTeamCreate();

  const response = await api.delete(`/api/teams/${teamId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Delete team failed');
  }
}

async function testTeamOrganogram() {
  const response = await api.get('/api/teams/organogram');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get team organogram failed');
  }
}

async function testTeamBirthdays() {
  const teamId = await testTeamCreate();

  const response = await api.get(`/api/teams/${teamId}/birthdays`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get team birthdays failed');
  }
}

// ============================================================================
// TESTES DE MEMBROS
// ============================================================================

async function testMembersGet() {
  const response = await api.get('/api/members');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get members failed');
  }

  if (!response.data.data.members) {
    throw new Error('Members response missing members array');
  }
}

async function testMemberCreate() {
  const memberData = {
    name: 'Test Member',
    email: 'member@test.com',
    role: 'Developer',
    department: 'Engineering',
  };

  const response = await api.post('/api/members', memberData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Create member failed');
  }

  return response.data.data.id;
}

async function testMemberGetById() {
  const memberId = await testMemberCreate();

  const response = await api.get(`/api/members/${memberId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get member by ID failed');
  }
}

async function testMemberUpdate() {
  const memberId = await testMemberCreate();

  const updateData = {
    name: 'Updated Member Name',
  };

  const response = await api.put(`/api/members/${memberId}`, updateData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Update member failed');
  }
}

async function testMemberDelete() {
  const memberId = await testMemberCreate();

  const response = await api.delete(`/api/members/${memberId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Delete member failed');
  }
}

async function testMembersBirthdays() {
  const response = await api.get('/api/members/birthdays');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get members birthdays failed');
  }

  if (!response.data.data.birthdays) {
    throw new Error('Birthdays response missing birthdays array');
  }
}

// ============================================================================
// TESTES DE EVENTOS
// ============================================================================

async function testEventsGet() {
  const response = await api.get('/api/events');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get events failed');
  }
}

async function testEventCreate() {
  const eventData = {
    title: 'Test Event',
    description: 'Test event description',
    date: new Date().toISOString(),
    type: 'meeting',
  };

  const response = await api.post('/api/events', eventData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Create event failed');
  }

  return response.data.data.id;
}

async function testEventGetById() {
  const eventId = await testEventCreate();

  const response = await api.get(`/api/events/${eventId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get event by ID failed');
  }
}

async function testEventUpdate() {
  const eventId = await testEventCreate();

  const updateData = {
    title: 'Updated Event Title',
  };

  const response = await api.put(`/api/events/${eventId}`, updateData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Update event failed');
  }
}

async function testEventDelete() {
  const eventId = await testEventCreate();

  const response = await api.delete(`/api/events/${eventId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Delete event failed');
  }
}

// ============================================================================
// TESTES DE AVISOS
// ============================================================================

async function testNoticesGet() {
  const response = await api.get('/api/notices');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get notices failed');
  }
}

async function testNoticesGetActive() {
  const response = await api.get('/api/notices/active');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get active notices failed');
  }
}

async function testNoticeCreate() {
  const noticeData = {
    title: 'Test Notice',
    content: 'Test notice content',
    type: 'info',
    status: 'active',
  };

  const response = await api.post('/api/notices', noticeData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Create notice failed');
  }

  return response.data.data.id;
}

async function testNoticeGetById() {
  const noticeId = await testNoticeCreate();

  const response = await api.get(`/api/notices/${noticeId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Get notice by ID failed');
  }
}

async function testNoticeUpdate() {
  const noticeId = await testNoticeCreate();

  const updateData = {
    title: 'Updated Notice Title',
  };

  const response = await api.put(`/api/notices/${noticeId}`, updateData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Update notice failed');
  }
}

async function testNoticeDelete() {
  const noticeId = await testNoticeCreate();

  const response = await api.delete(`/api/notices/${noticeId}`);

  if (response.status !== 200 || !response.data.success) {
    throw new Error('Delete notice failed');
  }
}

// ============================================================================
// TESTES DE ROTAS ESPECIAIS
// ============================================================================

async function testHealthEndpoint() {
  const response = await api.get('/health');

  if (response.status !== 200 || response.data.status !== 'OK') {
    throw new Error('Health endpoint failed');
  }

  if (!response.data.service || !response.data.timestamp) {
    throw new Error('Health response missing required fields');
  }
}

async function testApiTest() {
  const response = await api.get('/api/test');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('API test endpoint failed');
  }
}

async function testApiDocs() {
  const response = await api.get('/api/docs');

  if (response.status !== 200 || !response.data.success) {
    throw new Error('API docs endpoint failed');
  }
}

async function test404Handler() {
  try {
    await api.get('/api/nonexistent-endpoint');
    throw new Error('404 handler should have thrown an error');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Esperado - erro 404
      return;
    }
    throw error;
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function runAllTests() {
  log(
    `${colors.bold}${colors.blue}🚀 Iniciando Teste Completo das Rotas do Frontend EPU-Gestão${colors.reset}\n`
  );

  try {
    // Verificar se o backend está rodando
    log(
      `${colors.yellow}📡 Verificando conexão com o backend...${colors.reset}`
    );
    await checkBackendHealth();
    log(`${colors.green}✅ Backend está rodando corretamente${colors.reset}\n`);

    // Testes de Saúde
    log(`${colors.bold}${colors.yellow}🔍 TESTES DE SAÚDE${colors.reset}`);
    await runTest('Health Endpoint', testHealthEndpoint);
    await runTest('API Test Endpoint', testApiTest);
    await runTest('API Docs Endpoint', testApiDocs);
    await runTest('404 Handler', test404Handler);

    // Testes de Autenticação
    log(
      `${colors.bold}${colors.yellow}🔐 TESTES DE AUTENTICAÇÃO${colors.reset}`
    );
    await runTest('Auth Login', testAuthLogin);
    await runTest('Auth Register', testAuthRegister);
    await runTest('Auth Verify', testAuthVerify);
    await runTest('Auth Profile Update', testAuthProfile);
    await runTest('Auth Get Users', testAuthUsers);

    // Testes de Projetos
    log(`${colors.bold}${colors.yellow}📁 TESTES DE PROJETOS${colors.reset}`);
    await runTest('Projects Get', testProjectsGet);
    await runTest('Projects Get with Params', testProjectsGetWithParams);
    await runTest('Project Create', testProjectCreate);
    await runTest('Project Get by ID', testProjectGetById);
    await runTest('Project Update', testProjectUpdate);
    await runTest('Project Delete', testProjectDelete);
    await runTest('Project CSV Import', testProjectCSVImport);
    await runTest('Project CSV Export', testProjectCSVExport);

    // Testes de Projetos CRUD
    log(
      `${colors.bold}${colors.yellow}📋 TESTES DE PROJETOS CRUD${colors.reset}`
    );
    await runTest('Projects CRUD Get', testProjectsCrudGet);
    await runTest('Projects CRUD Stats', testProjectsCrudStats);
    await runTest('Projects CRUD Create', testProjectsCrudCreate);
    await runTest('Projects CRUD Update', testProjectsCrudUpdate);
    await runTest('Projects CRUD Delete', testProjectsCrudDelete);
    await runTest('Projects CRUD Duplicate', testProjectsCrudDuplicate);

    // Testes de Equipes
    log(`${colors.bold}${colors.yellow}👥 TESTES DE EQUIPES${colors.reset}`);
    await runTest('Teams Get', testTeamsGet);
    await runTest('Team Create', testTeamCreate);
    await runTest('Team Get by ID', testTeamGetById);
    await runTest('Team Update', testTeamUpdate);
    await runTest('Team Delete', testTeamDelete);
    await runTest('Team Organogram', testTeamOrganogram);
    await runTest('Team Birthdays', testTeamBirthdays);

    // Testes de Membros
    log(`${colors.bold}${colors.yellow}👤 TESTES DE MEMBROS${colors.reset}`);
    await runTest('Members Get', testMembersGet);
    await runTest('Member Create', testMemberCreate);
    await runTest('Member Get by ID', testMemberGetById);
    await runTest('Member Update', testMemberUpdate);
    await runTest('Member Delete', testMemberDelete);
    await runTest('Members Birthdays', testMembersBirthdays);

    // Testes de Eventos
    log(`${colors.bold}${colors.yellow}📅 TESTES DE EVENTOS${colors.reset}`);
    await runTest('Events Get', testEventsGet);
    await runTest('Event Create', testEventCreate);
    await runTest('Event Get by ID', testEventGetById);
    await runTest('Event Update', testEventUpdate);
    await runTest('Event Delete', testEventDelete);

    // Testes de Avisos
    log(`${colors.bold}${colors.yellow}📋 TESTES DE AVISOS${colors.reset}`);
    await runTest('Notices Get', testNoticesGet);
    await runTest('Notices Get Active', testNoticesGetActive);
    await runTest('Notice Create', testNoticeCreate);
    await runTest('Notice Get by ID', testNoticeGetById);
    await runTest('Notice Update', testNoticeUpdate);
    await runTest('Notice Delete', testNoticeDelete);
  } catch (error) {
    log(`${colors.red}❌ Erro crítico: ${error.message}${colors.reset}`);
    log(
      `${colors.red}Verifique se o backend está rodando em ${API_BASE_URL}${colors.reset}`
    );
  }

  // Relatório final
  log(`\n${colors.bold}${colors.blue}📊 RELATÓRIO FINAL${colors.reset}`);
  log(`${colors.bold}Total de testes: ${testResults.total}${colors.reset}`);
  log(
    `${colors.green}${colors.bold}✅ Passou: ${testResults.passed}${colors.reset}`
  );
  log(
    `${colors.red}${colors.bold}❌ Falhou: ${testResults.failed}${colors.reset}`
  );

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(
    1
  );
  log(`${colors.bold}Taxa de sucesso: ${successRate}%${colors.reset}`);

  if (testResults.failed > 0) {
    log(`\n${colors.bold}${colors.red}❌ TESTES QUE FALHARAM:${colors.reset}`);
    testResults.details
      .filter((result) => result.status === 'FALHOU')
      .forEach((result, index) => {
        log(`${index + 1}. ${result.test}: ${result.error}`);
      });
  }

  log(
    `\n${colors.bold}${colors.blue}🎯 ANÁLISE E RECOMENDAÇÕES:${colors.reset}`
  );

  if (testResults.failed === 0) {
    log(
      `${colors.green}🎉 Perfeito! Todas as rotas estão funcionando corretamente.${colors.reset}`
    );
    log(
      `${colors.green}✅ O frontend pode ser integrado com segurança.${colors.reset}`
    );
  } else {
    log(
      `${colors.yellow}⚠️  Algumas rotas precisam de correção.${colors.reset}`
    );
    log(
      `${colors.yellow}🔧 Corrija os problemas identificados antes de colocar em produção.${colors.reset}`
    );
  }

  return testResults;
}

// Executar os testes
if (require.main === module) {
  runAllTests()
    .then((results) => {
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch((error) => {
      log(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = { runAllTests };
