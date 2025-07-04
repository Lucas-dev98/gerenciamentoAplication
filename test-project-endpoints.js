const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const PROJECT_ID = '6864447b916b6c03fbe1b260'; // ID do projeto criado

const testProjectEndpoints = async () => {
  console.log('🚀 Testando endpoints do projeto EPU...\n');
  
  const endpoints = [
    { name: 'Lista de Projetos', url: '/projects' },
    { name: 'Procedimento de Parada', url: `/projects/${PROJECT_ID}/procedimento-parada` },
    { name: 'Manutenção', url: `/projects/${PROJECT_ID}/manutencao` },
    { name: 'Procedimento de Partida', url: `/projects/${PROJECT_ID}/procedimento-partida` },
    { name: 'Todas as Frentes', url: `/projects/${PROJECT_ID}/frentes` },
    { name: 'Estatísticas', url: `/projects/${PROJECT_ID}/statistics` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testando: ${endpoint.name}`);
      
      const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
        timeout: 10000
      });
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        
        if (Array.isArray(data)) {
          console.log(`✅ ${endpoint.name}: ${data.length} itens`);
          if (data.length > 0) {
            console.log(`   📝 Primeiro item: ${data[0].name || data[0].id || 'N/A'}`);
            if (data[0].subActivities) {
              console.log(`   📊 Sub-atividades: ${data[0].subActivities.length}`);
            }
          }
        } else if (typeof data === 'object') {
          console.log(`✅ ${endpoint.name}: Dados recebidos`);
          if (data.parada && data.manutencao && data.partida) {
            console.log(`   📊 Parada: ${data.parada.length}, Manutenção: ${data.manutencao.length}, Partida: ${data.partida.length}`);
          } else {
            console.log(`   📈 Conteúdo: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
          }
        } else {
          console.log(`✅ ${endpoint.name}: ${data}`);
        }
      } else {
        console.log(`⚠️ ${endpoint.name}: ${response.data.message}`);
      }
      
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.response?.data?.message || error.message}`);
    }
    
    console.log(''); // Linha em branco entre testes
  }
  
  console.log('✨ Testes concluídos!');
};

testProjectEndpoints();
      'http://localhost:5000/api/auth/login',
      {
        email: 'l.o.bastos@live.com',
        password: '44351502741-+as',
      }
    );

    const token = loginResponse.data.token;
    console.log('✓ Login realizado com sucesso');

    // 2. Buscar projetos existentes
    console.log('\n2. Buscando projetos...');
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const projects = projectsResponse.data.data.projects;
    console.log(`✓ ${projects.length} projeto(s) encontrado(s)`);

    if (projects.length === 0) {
      console.log('❌ Nenhum projeto encontrado para testar');
      return;
    }

    const projectId = projects[0].id;
    console.log(
      `📋 Testando com projeto: ${projects[0].name} (ID: ${projectId})`
    );

    // 3. Testar endpoint de procedimento de parada
    console.log('\n3. Testando endpoint /procedimento-parada...');
    try {
      const paradaResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/procedimento-parada`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        '✓ Procedimento de parada:',
        paradaResponse.data.length,
        'atividades'
      );
      if (paradaResponse.data.length > 0) {
        console.log('  Primeira atividade:', paradaResponse.data[0].name);
      }
    } catch (error) {
      console.log(
        '❌ Erro no endpoint procedimento-parada:',
        error.response?.data || error.message
      );
    }

    // 4. Testar endpoint de manutenção
    console.log('\n4. Testando endpoint /manutencao...');
    try {
      const manutencaoResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/manutencao`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        '✓ Manutenção:',
        manutencaoResponse.data.length,
        'atividades'
      );
      if (manutencaoResponse.data.length > 0) {
        console.log('  Primeira atividade:', manutencaoResponse.data[0].name);
        console.log('  Progresso real:', manutencaoResponse.data[0].real + '%');
        console.log(
          '  Progresso planejado:',
          manutencaoResponse.data[0].planned + '%'
        );
        console.log(
          '  Subatividades:',
          manutencaoResponse.data[0].sub_activities.length
        );
      }
    } catch (error) {
      console.log(
        '❌ Erro no endpoint manutencao:',
        error.response?.data || error.message
      );
    }

    // 5. Testar endpoint de procedimento de partida
    console.log('\n5. Testando endpoint /procedimento-partida...');
    try {
      const partidaResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/procedimento-partida`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        '✓ Procedimento de partida:',
        partidaResponse.data.length,
        'atividades'
      );
      if (partidaResponse.data.length > 0) {
        console.log('  Primeira atividade:', partidaResponse.data[0].name);
        console.log('  Progresso real:', partidaResponse.data[0].real + '%');
        console.log(
          '  Progresso planejado:',
          partidaResponse.data[0].planned + '%'
        );
      }
    } catch (error) {
      console.log(
        '❌ Erro no endpoint procedimento-partida:',
        error.response?.data || error.message
      );
    }

    // 6. Testar endpoint de todas as frentes
    console.log('\n6. Testando endpoint /frentes...');
    try {
      const frentesResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/frentes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✓ Todas as frentes carregadas');
      console.log('  Blocos disponíveis:', Object.keys(frentesResponse.data));
      Object.keys(frentesResponse.data).forEach((bloco) => {
        console.log(
          `  - ${bloco}: ${frentesResponse.data[bloco].length} atividades`
        );
      });
    } catch (error) {
      console.log(
        '❌ Erro no endpoint frentes:',
        error.response?.data || error.message
      );
    }

    // 7. Testar endpoint de estatísticas
    console.log('\n7. Testando endpoint /statistics...');
    try {
      const statsResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✓ Estatísticas carregadas');
      const stats = statsResponse.data.data;
      console.log('  Progresso geral:', stats.geral.progressoGeral + '%');
      console.log('  Total de atividades:', stats.geral.totalAtividades);
      console.log('  Atividades por bloco:', stats.atividades);
    } catch (error) {
      console.log(
        '❌ Erro no endpoint statistics:',
        error.response?.data || error.message
      );
    }

    console.log('\n=== TESTE DOS ENDPOINTS CONCLUÍDO ===');
  } catch (error) {
    console.error(
      '❌ Erro geral no teste:',
      error.response?.data || error.message
    );
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testProjectEndpoints().catch(console.error);
}

module.exports = { testProjectEndpoints };
