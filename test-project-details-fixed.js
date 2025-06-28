const axios = require('axios');

async function testProjectDetails() {
  try {
    console.log('🔍 Testando detalhes do projeto...');

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
    console.log('🔑 Token:', token ? 'Disponível' : 'Não encontrado');

    if (!token) {
      console.log(
        '📄 Resposta do login:',
        JSON.stringify(loginResponse.data, null, 2)
      );
      return;
    }

    // Buscar projetos
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(
      `📊 Total de projetos: ${projectsResponse.data.data?.projects?.length || 0}`
    );

    if (
      projectsResponse.data.data?.projects &&
      projectsResponse.data.data.projects.length > 0
    ) {
      const project = projectsResponse.data.data.projects[0]; // Pegar o primeiro projeto
      console.log(`\n🎯 Projeto: ${project.name}`);
      console.log(`📈 Progresso: ${project.progress}%`);
      console.log(`🆔 ID do projeto: ${project.id}`);

      // Buscar detalhes específicos do projeto
      console.log('\n🔍 Buscando detalhes específicos do projeto...');
      const projectDetailResponse = await axios.get(
        `http://localhost:5000/api/projects/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const projectDetails = projectDetailResponse.data.data;
      console.log('\n📋 Detalhes do projeto:');
      console.log(`   Nome: ${projectDetails.name}`);
      console.log(`   Status: ${projectDetails.status}`);
      console.log(`   Progresso: ${projectDetails.progress}%`);
      console.log(
        `   Total de atividades: ${projectDetails.activities?.length || 0}`
      );

      if (projectDetails.activities && projectDetails.activities.length > 0) {
        // Contar atividades por tipo
        const parada = projectDetails.activities.filter(
          (a) => a.type === 'parada'
        );
        const manutencao = projectDetails.activities.filter(
          (a) => a.type === 'manutencao'
        );
        const partida = projectDetails.activities.filter(
          (a) => a.type === 'partida'
        );

        console.log(`\n📊 Distribuição de atividades:`);
        console.log(`   🔴 Parada: ${parada.length} atividades`);
        console.log(`   🟡 Manutenção: ${manutencao.length} atividades`);
        console.log(`   🟢 Partida: ${partida.length} atividades`);

        // Mostrar exemplo de uma atividade de parada
        if (parada.length > 0) {
          console.log(`\n📝 Exemplo de atividade de PARADA:`);
          const exemploParada = parada[0];
          console.log(`   name: ${exemploParada.name}`);
          console.log(`   value: ${exemploParada.progress || 0}`);
          console.log(`   baseline: ${exemploParada.baseline || 0}`);

          if (
            exemploParada.subActivities &&
            exemploParada.subActivities.length > 0
          ) {
            console.log(`   sub_activities: `);
            const subActivitiesStr = exemploParada.subActivities
              .map(
                (sub) => `${sub.name}:${sub.progress || 0}|${sub.baseline || 0}`
              )
              .join('; ');
            console.log(`      ${subActivitiesStr}`);
          }
        }

        // Mostrar exemplo de uma atividade de manutenção
        if (manutencao.length > 0) {
          console.log(`\n📝 Exemplo de atividade de MANUTENÇÃO:`);
          const exemploManutencao = manutencao[0];
          console.log(`   name: ${exemploManutencao.name}`);
          console.log(`   value: ${exemploManutencao.progress || 0}`);
          console.log(`   baseline: ${exemploManutencao.baseline || 0}`);

          if (
            exemploManutencao.subActivities &&
            exemploManutencao.subActivities.length > 0
          ) {
            console.log(`   sub_activities: `);
            const subActivitiesStr = exemploManutencao.subActivities
              .map(
                (sub) => `${sub.name}:${sub.progress || 0}|${sub.baseline || 0}`
              )
              .join('; ');
            console.log(`      ${subActivitiesStr}`);
          }
        }
      }
    } else {
      console.log('❌ Nenhum projeto encontrado');
    }
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testProjectDetails();
