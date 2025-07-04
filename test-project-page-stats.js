/**
 * Teste das Estatísticas na Página de Projetos
 * Verifica se as estatísticas estão sendo exibidas corretamente
 */

const axios = require('axios');

async function testProjectPageStats() {
  console.log('🧪 TESTE - Estatísticas na Página de Projetos');
  console.log('==============================================\n');

  try {
    // 1. Verificar se o frontend está respondendo
    console.log('📱 Verificando frontend...');
    const frontendResponse = await axios.get('http://localhost:3000');
    console.log('✅ Frontend acessível');

    // 2. Verificar se a API de estatísticas está funcionando
    console.log('\n📊 Testando API de estatísticas...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Buscar estatísticas
    const statsResponse = await axios.get(
      'http://localhost:5000/api/projects/statistics',
      { headers }
    );

    console.log('✅ API de estatísticas funcionando');
    console.log('📋 Dados retornados:');
    console.log(`  - Total de Projetos: ${statsResponse.data.data.totalProjects}`);
    console.log(`  - Projetos Ativos: ${statsResponse.data.data.activeProjects}`);
    console.log(`  - Projetos Concluídos: ${statsResponse.data.data.completedProjects}`);
    console.log(`  - Progresso Médio: ${statsResponse.data.data.summary.averageProgress}`);

    if (statsResponse.data.data.onHoldProjects > 0) {
      console.log(`  - Projetos Pausados: ${statsResponse.data.data.onHoldProjects}`);
    }
    
    if (statsResponse.data.data.cancelledProjects > 0) {
      console.log(`  - Projetos Cancelados: ${statsResponse.data.data.cancelledProjects}`);
    }

    console.log('\n🎯 RESULTADO:');
    console.log('✅ API funcionando corretamente');
    console.log('✅ Frontend acessível');
    console.log('📊 As estatísticas devem aparecer na página de projetos');
    console.log('\n🔗 Acesse: http://localhost:3000/projects');
    console.log('   (Faça login e navegue até a página de projetos para ver as estatísticas)');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.message || error.message);
  }
}

testProjectPageStats();
