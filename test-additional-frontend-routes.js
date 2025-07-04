/**
 * Teste Adicional para Verificar Compatibilidade Frontend-Backend
 * Este script verifica rotas específicas que podem estar sendo usadas pelo frontend
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Rotas específicas que podem estar sendo usadas pelo frontend
const additionalRoutes = [
  // Dashboard routes
  { method: 'GET', path: '/api/dashboard/stats', name: 'Dashboard Stats' },
  {
    method: 'GET',
    path: '/api/dashboard/projects-progress',
    name: 'Dashboard Projects Progress',
  },
  {
    method: 'GET',
    path: '/api/dashboard/team-performance',
    name: 'Dashboard Team Performance',
  },
  {
    method: 'GET',
    path: '/api/dashboard/upcoming-events',
    name: 'Dashboard Upcoming Events',
  },
  {
    method: 'GET',
    path: '/api/dashboard/recent-activity',
    name: 'Dashboard Recent Activity',
  },

  // Project specific routes
  { method: 'GET', path: '/api/projects/1/frentes', name: 'Project Frentes' },
  {
    method: 'GET',
    path: '/api/projects/1/statistics',
    name: 'Project Statistics',
  },
  {
    method: 'GET',
    path: '/api/projects/1/procedimento-parada',
    name: 'Project Procedimento Parada',
  },
  {
    method: 'GET',
    path: '/api/projects/1/manutencao',
    name: 'Project Manutencao',
  },
  {
    method: 'GET',
    path: '/api/projects/1/procedimento-partida',
    name: 'Project Procedimento Partida',
  },
  {
    method: 'POST',
    path: '/api/projects/1/activities',
    name: 'Project Add Activity',
  },
  {
    method: 'PUT',
    path: '/api/projects/1/activities/1',
    name: 'Project Update Activity',
  },

  // Projects CRUD specific routes
  {
    method: 'GET',
    path: '/api/projects-crud/team/1',
    name: 'Projects CRUD by Team',
  },
  {
    method: 'GET',
    path: '/api/projects-crud/1/frentes-data',
    name: 'Projects CRUD Frentes Data',
  },

  // Auth routes that might be missing
  { method: 'PUT', path: '/api/auth/users/1', name: 'Update User by Admin' },

  // Missing member routes
  { method: 'GET', path: '/api/members/team/1', name: 'Members by Team' },

  // File upload routes that might be used
  {
    method: 'POST',
    path: '/api/projects-crud/import-csv',
    name: 'Projects CRUD Import CSV',
  },
  {
    method: 'POST',
    path: '/api/projects-crud/1/update-csv',
    name: 'Projects CRUD Update CSV',
  },
  {
    method: 'GET',
    path: '/api/projects-crud/1/export-csv',
    name: 'Projects CRUD Export CSV',
  },

  // Notice routes with parameters
  {
    method: 'GET',
    path: '/api/notices?status=active',
    name: 'Notices with Status Filter',
  },
];

async function testRoute(route) {
  try {
    let response;

    switch (route.method) {
      case 'GET':
        response = await api.get(route.path);
        break;
      case 'POST':
        response = await api.post(route.path, { test: 'data' });
        break;
      case 'PUT':
        response = await api.put(route.path, { test: 'data' });
        break;
      case 'DELETE':
        response = await api.delete(route.path);
        break;
    }

    if (response.status === 200) {
      log(`✅ ${route.name}: OK`, colors.green);
      return { route: route.name, status: 'OK', error: null };
    } else {
      log(`⚠️  ${route.name}: Status ${response.status}`, colors.yellow);
      return {
        route: route.name,
        status: 'WARNING',
        error: `Status ${response.status}`,
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        log(`❌ ${route.name}: Rota não encontrada (404)`, colors.red);
        return {
          route: route.name,
          status: 'NOT_FOUND',
          error: 'Route not found',
        };
      } else {
        log(`⚠️  ${route.name}: Erro ${error.response.status}`, colors.yellow);
        return {
          route: route.name,
          status: 'ERROR',
          error: `HTTP ${error.response.status}`,
        };
      }
    } else {
      log(`❌ ${route.name}: Erro de conexão`, colors.red);
      return {
        route: route.name,
        status: 'CONNECTION_ERROR',
        error: error.message,
      };
    }
  }
}

async function runAdditionalTests() {
  log(
    `${colors.bold}${colors.blue}🔍 Teste Adicional de Compatibilidade Frontend-Backend${colors.reset}\n`
  );

  const results = [];

  for (const route of additionalRoutes) {
    const result = await testRoute(route);
    results.push(result);
  }

  // Análise dos resultados
  const ok = results.filter((r) => r.status === 'OK').length;
  const warnings = results.filter((r) => r.status === 'WARNING').length;
  const notFound = results.filter((r) => r.status === 'NOT_FOUND').length;
  const errors = results.filter((r) => r.status === 'ERROR').length;
  const connectionErrors = results.filter(
    (r) => r.status === 'CONNECTION_ERROR'
  ).length;

  log(`\n${colors.bold}📊 RESULTADOS DO TESTE ADICIONAL:${colors.reset}`);
  log(`${colors.green}✅ Funcionando: ${ok}${colors.reset}`);
  log(`${colors.yellow}⚠️  Com avisos: ${warnings}${colors.reset}`);
  log(`${colors.red}❌ Não encontradas: ${notFound}${colors.reset}`);
  log(`${colors.red}❌ Com erros: ${errors}${colors.reset}`);
  log(`${colors.red}❌ Erro de conexão: ${connectionErrors}${colors.reset}`);

  // Rotas que precisam ser implementadas
  const missingRoutes = results.filter((r) => r.status === 'NOT_FOUND');
  if (missingRoutes.length > 0) {
    log(
      `\n${colors.bold}${colors.red}🚧 ROTAS QUE PRECISAM SER IMPLEMENTADAS:${colors.reset}`
    );
    missingRoutes.forEach((route) => {
      log(`   - ${route.route}`);
    });

    log(`\n${colors.bold}${colors.yellow}💡 RECOMENDAÇÕES:${colors.reset}`);
    log(`1. Implementar as rotas em falta no backend`);
    log(`2. Verificar se o frontend está usando essas rotas`);
    log(`3. Considerar implementar as rotas do dashboard para estatísticas`);
    log(`4. Implementar rotas específicas de projetos para dados detalhados`);
  }

  return results;
}

if (require.main === module) {
  runAdditionalTests()
    .then((results) => {
      const criticalIssues = results.filter(
        (r) => r.status === 'CONNECTION_ERROR' || r.status === 'ERROR'
      ).length;
      process.exit(criticalIssues === 0 ? 0 : 1);
    })
    .catch((error) => {
      log(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = { runAdditionalTests };
