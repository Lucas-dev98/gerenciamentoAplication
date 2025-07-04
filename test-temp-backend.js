const axios = require('axios');

async function testTempBackend() {
  try {
    console.log('=== TESTANDO BACKEND TEMPORÁRIO ===');

    // Testar rota simples
    console.log('1. Testando rota simples...');
    const testResponse = await axios.get('http://localhost:6000/api/test');
    console.log('✓ Teste simples:', testResponse.data.message);

    // Testar endpoints do projeto
    const projectId = '123';

    console.log('2. Testando procedimento-parada...');
    const paradaResponse = await axios.get(
      `http://localhost:6000/api/projects/${projectId}/procedimento-parada`
    );
    console.log(
      '✓ Procedimento parada:',
      paradaResponse.data.length,
      'atividades'
    );

    console.log('3. Testando manutenção...');
    const manutencaoResponse = await axios.get(
      `http://localhost:6000/api/projects/${projectId}/manutencao`
    );
    console.log('✓ Manutenção:', manutencaoResponse.data.length, 'atividades');

    console.log('4. Testando procedimento-partida...');
    const partidaResponse = await axios.get(
      `http://localhost:6000/api/projects/${projectId}/procedimento-partida`
    );
    console.log(
      '✓ Procedimento partida:',
      partidaResponse.data.length,
      'atividades'
    );

    console.log('5. Testando frentes...');
    const frentesResponse = await axios.get(
      `http://localhost:6000/api/projects/${projectId}/frentes`
    );
    console.log('✓ Frentes:', Object.keys(frentesResponse.data));

    console.log('6. Testando statistics...');
    const statsResponse = await axios.get(
      `http://localhost:6000/api/projects/${projectId}/statistics`
    );
    console.log(
      '✓ Statistics:',
      statsResponse.data.data.geral.totalAtividades,
      'atividades'
    );

    console.log('\n=== TODOS OS ENDPOINTS FUNCIONARAM! ===');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testTempBackend();
