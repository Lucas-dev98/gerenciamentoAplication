const axios = require('axios');

async function testFrentesAPI() {
  try {
    console.log(
      '🚀 Testando APIs das Frentes de Trabalho (baseadas no Flask)...'
    );

    // Login para obter token
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'csvtest@example.com',
        password: 'TestPass123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');

    if (!token) {
      console.log('❌ Token não encontrado');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Testar API de Procedimento de Parada
    console.log('\n🔴 Testando /api/projects/api/procedimento_parada...');
    try {
      const paradaResponse = await axios.get(
        'http://localhost:5000/api/projects/api/procedimento_parada',
        { headers }
      );
      console.log(
        `✅ Procedimento de Parada: ${paradaResponse.data.data?.length || 0} frentes`
      );

      if (paradaResponse.data.data && paradaResponse.data.data.length > 0) {
        const exemploFrente = paradaResponse.data.data[0];
        console.log(`   📋 Exemplo: ${exemploFrente.name}`);
        console.log(
          `   📈 Real: ${exemploFrente.real}% | Planejado: ${exemploFrente.planned}%`
        );
        console.log(`   🖼️ Imagem: ${exemploFrente.image}`);
        console.log(
          `   📝 Subatividades: ${exemploFrente.sub_activities?.length || 0}`
        );
      }

      if (paradaResponse.data.statistics) {
        console.log(`   📊 Estatísticas:`, paradaResponse.data.statistics);
      }
    } catch (error) {
      console.log(
        '❌ Erro na API de Procedimento de Parada:',
        error.response?.data || error.message
      );
    }

    // Testar API de Manutenção
    console.log('\n🟡 Testando /api/projects/api/manutencao...');
    try {
      const manutencaoResponse = await axios.get(
        'http://localhost:5000/api/projects/api/manutencao',
        { headers }
      );
      console.log(
        `✅ Manutenção: ${manutencaoResponse.data.data?.length || 0} frentes`
      );

      if (manutencaoResponse.data.statistics) {
        console.log(`   📊 Estatísticas:`, manutencaoResponse.data.statistics);
      }
    } catch (error) {
      console.log(
        '❌ Erro na API de Manutenção:',
        error.response?.data || error.message
      );
    }

    // Testar API de Procedimento de Partida
    console.log('\n🟢 Testando /api/projects/api/procedimento_partida...');
    try {
      const partidaResponse = await axios.get(
        'http://localhost:5000/api/projects/api/procedimento_partida',
        { headers }
      );
      console.log(
        `✅ Procedimento de Partida: ${partidaResponse.data.data?.length || 0} frentes`
      );

      if (partidaResponse.data.statistics) {
        console.log(`   📊 Estatísticas:`, partidaResponse.data.statistics);
      }
    } catch (error) {
      console.log(
        '❌ Erro na API de Procedimento de Partida:',
        error.response?.data || error.message
      );
    }

    // Testar API de Todas as Frentes
    console.log(
      '\n📊 Testando /api/projects/api/frentes (todas as frentes)...'
    );
    try {
      const allFrentesResponse = await axios.get(
        'http://localhost:5000/api/projects/api/frentes',
        { headers }
      );
      console.log(`✅ Todas as Frentes carregadas`);

      const data = allFrentesResponse.data.data;
      if (data) {
        console.log(
          `   🔴 Procedimento de Parada: ${data.procedimento_parada?.length || 0} frentes`
        );
        console.log(
          `   🟡 Manutenção: ${data.manutencao?.length || 0} frentes`
        );
        console.log(
          `   🟢 Procedimento de Partida: ${data.procedimento_partida?.length || 0} frentes`
        );
      }

      if (allFrentesResponse.data.generalStats) {
        console.log(
          `   📈 Estatísticas Gerais:`,
          allFrentesResponse.data.generalStats
        );
      }
    } catch (error) {
      console.log(
        '❌ Erro na API de Todas as Frentes:',
        error.response?.data || error.message
      );
    }

    console.log('\n🎉 Teste das APIs concluído!');
  } catch (error) {
    console.error(
      '❌ Erro geral no teste:',
      error.response?.data || error.message
    );
  }
}

testFrentesAPI();
