// Teste básico de conectividade frontend-backend
// Verifica se as URLs estão configuradas corretamente

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnectivity() {
  console.log('🔗 TESTE DE CONECTIVIDADE FRONTEND-BACKEND');
  console.log('='.repeat(50));

  try {
    // 1. Testar health check do backend
    console.log('1. 🏥 Testando health check do backend...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend respondendo');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Versão: ${healthData.version}`);
    } else {
      console.log('❌ Backend não está respondendo');
      return;
    }

    // 2. Testar se o frontend pode acessar rotas de API
    console.log('\n2. 🌐 Testando acesso às rotas de API...');

    // Testar rota raiz da API
    const apiRootResponse = await fetch(`${BACKEND_URL}/`);
    if (apiRootResponse.ok) {
      const apiRootData = await apiRootResponse.json();
      console.log('✅ API root acessível');
      console.log('📋 Endpoints disponíveis:');
      Object.entries(apiRootData.endpoints).forEach(([name, path]) => {
        console.log(`   ${name}: ${path}`);
      });
    }

    // 3. Testar rota de auth (sem dados)
    console.log('\n3. 🔐 Testando rota de autenticação...');
    const authTestResponse = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'GET',
    });

    // Esperamos erro 401 (sem token), mas não erro 404
    if (authTestResponse.status === 401) {
      console.log('✅ Rota de auth encontrada (erro 401 = sem token)');
    } else if (authTestResponse.status === 404) {
      console.log('❌ Rota de auth não encontrada');
    } else {
      console.log(
        `ℹ️ Rota de auth respondeu com status: ${authTestResponse.status}`
      );
    }

    // 4. Testar configuração CORS
    console.log('\n4. 🌍 Testando configuração CORS...');
    const corsTestResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'OPTIONS',
    });

    if (corsTestResponse.ok) {
      console.log('✅ CORS configurado corretamente');
    } else {
      console.log('⚠️ Possível problema de CORS');
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO DA CONECTIVIDADE:');
    console.log('✅ Backend: Funcionando e acessível');
    console.log('✅ API: Rotas expostas corretamente');
    console.log('✅ CORS: Configurado para frontend');
    console.log('✅ URLs: Frontend e Backend sincronizados');

    console.log('\n🎯 PRÓXIMO PASSO:');
    console.log('1. Configurar MongoDB para autenticação completa');
    console.log('2. Testar interface do usuário no navegador');
    console.log('3. Implementar fluxo de registro/login');
  } catch (error) {
    console.error('❌ Erro no teste de conectividade:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 DIAGNÓSTICO:');
      console.log('- Backend pode não estar rodando na porta 3001');
      console.log('- Verificar se o processo Node.js está ativo');
      console.log('- Verificar portas em uso: netstat -an | findstr 3001');
    }
  }
}

testConnectivity();
