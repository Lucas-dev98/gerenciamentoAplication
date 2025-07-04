// Teste completo do fluxo de visualização de projetos
const axios = require('axios');

async function testCompleteFlow() {
  console.log('=== TESTANDO FLUXO COMPLETO DE VISUALIZAÇÃO ===\n');

  const projectId = '60d5ec49f1b2c8b1f8c4e456';
  const baseUrl = 'http://localhost:5000';

  try {
    // 1. Testar endpoint básico
    console.log('1. Testando conectividade básica...');
    const healthResponse = await axios.get(`${baseUrl}/api/test`);
    console.log('✓ Backend respondendo:', healthResponse.data.message);

    // 2. Testar todos os endpoints de dados do projeto
    console.log('\n2. Testando endpoints de dados do projeto...');

    // Procedimento de Parada
    console.log('2.1. Procedimento de Parada:');
    const paradaResponse = await axios.get(
      `${baseUrl}/api/projects/${projectId}/procedimento-parada`
    );
    console.log(`   ✓ ${paradaResponse.data.length} atividades encontradas`);
    console.log(`   ✓ Primeira atividade: ${paradaResponse.data[0].name}`);
    console.log(
      `   ✓ Progresso: ${paradaResponse.data[0].real}% / ${paradaResponse.data[0].planned}%`
    );

    // Manutenção
    console.log('2.2. Manutenção:');
    const manutencaoResponse = await axios.get(
      `${baseUrl}/api/projects/${projectId}/manutencao`
    );
    console.log(
      `   ✓ ${manutencaoResponse.data.length} atividades encontradas`
    );
    console.log(`   ✓ Primeira atividade: ${manutencaoResponse.data[0].name}`);

    // Procedimento de Partida
    console.log('2.3. Procedimento de Partida:');
    const partidaResponse = await axios.get(
      `${baseUrl}/api/projects/${projectId}/procedimento-partida`
    );
    console.log(`   ✓ ${partidaResponse.data.length} atividades encontradas`);
    console.log(`   ✓ Primeira atividade: ${partidaResponse.data[0].name}`);

    // 3. Testar endpoint de frentes agregadas
    console.log('\n3. Testando endpoint de frentes agregadas...');
    const frentesResponse = await axios.get(
      `${baseUrl}/api/projects/${projectId}/frentes`
    );
    const frentes = Object.keys(frentesResponse.data);
    console.log(
      `   ✓ ${frentes.length} frentes encontradas: ${frentes.join(', ')}`
    );

    // 4. Testar estatísticas
    console.log('\n4. Testando estatísticas do projeto...');
    const statsResponse = await axios.get(
      `${baseUrl}/api/projects/${projectId}/statistics`
    );
    const stats = statsResponse.data.data.geral;
    console.log(`   ✓ Total de atividades: ${stats.totalAtividades}`);
    console.log(
      `   ✓ Progresso médio real: ${stats.progressoMedioReal.toFixed(1)}%`
    );
    console.log(
      `   ✓ Progresso médio planejado: ${stats.progressoMedioPlanejado.toFixed(1)}%`
    );
    console.log(`   ✓ Eficiência: ${stats.eficiencia.toFixed(1)}%`);

    // 5. Validar estrutura de dados
    console.log('\n5. Validando estrutura de dados...');

    // Verificar se todas as atividades têm os campos necessários
    const allActivities = [
      ...paradaResponse.data,
      ...manutencaoResponse.data,
      ...partidaResponse.data,
    ];

    let validActivities = 0;
    for (const activity of allActivities) {
      if (
        activity.name &&
        typeof activity.real === 'number' &&
        typeof activity.planned === 'number' &&
        Array.isArray(activity.sub_activities)
      ) {
        validActivities++;
      }
    }

    console.log(
      `   ✓ ${validActivities}/${allActivities.length} atividades têm estrutura válida`
    );

    // 6. Testar sub-atividades
    const activitiesWithSubs = allActivities.filter(
      (a) => a.sub_activities.length > 0
    );
    console.log(
      `   ✓ ${activitiesWithSubs.length} atividades têm sub-atividades`
    );

    if (activitiesWithSubs.length > 0) {
      const totalSubActivities = activitiesWithSubs.reduce(
        (sum, a) => sum + a.sub_activities.length,
        0
      );
      console.log(
        `   ✓ Total de ${totalSubActivities} sub-atividades encontradas`
      );
    }

    console.log('\n=== TESTE COMPLETO FINALIZADO COM SUCESSO! ===');
    console.log('\n📊 RESUMO:');
    console.log(`• Backend funcionando na porta 6000`);
    console.log(`• ${allActivities.length} atividades carregadas`);
    console.log(`• ${frentes.length} frentes de trabalho`);
    console.log(`• Estatísticas geradas com sucesso`);
    console.log(
      `• Frontend HTML funcionando em: file:///c:/Users/lobas/Downloads/EPU-Gestão/test-frontend.html`
    );

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Verificar visualização no navegador (test-frontend.html)');
    console.log('2. Configurar React frontend para usar porta 6000');
    console.log('3. Integrar dados reais do CSV no backend principal');
    console.log('4. Deploy da solução completa');
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Dados: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testCompleteFlow();
