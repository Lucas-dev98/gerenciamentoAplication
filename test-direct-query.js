const axios = require('axios');

async function testDirectProjectQuery() {
  try {
    console.log('🔍 Teste direto: Consulta projeto existente\n');

    // Usar um projeto que já existe (do teste anterior)
    const projectId = '685eabb8faa3361e43d6c2d5'; // ID do projeto que vimos no debug anterior

    console.log(`📋 Consultando projeto: ${projectId}`);

    // Tentar sem autenticação primeiro (verificar se o endpoint está aberto)
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`
      );
      console.log('✅ Dados obtidos (sem auth)');
      const project = response.data.data.project;

      console.log('📊 Projeto:');
      console.log('   Nome:', project.name);
      console.log('   Atividades:', project.activities?.length || 0);
      console.log('   Metadata:', project.metadata ? 'presente' : 'ausente');

      // Verificar se há atividades
      if (project.activities && project.activities.length > 0) {
        console.log('\n🎯 Primeiras 3 atividades:');
        project.activities.slice(0, 3).forEach((activity, index) => {
          console.log(`   ${index + 1}. ${activity.name || 'Sem nome'}`);
          console.log(`      Tipo: ${activity.type || 'N/A'}`);
          console.log(`      Progresso: ${activity.progress || 0}%`);
          console.log(
            `      Subatividades: ${activity.subActivities?.length || 0}`
          );
        });
      } else {
        console.log('❌ PROBLEMA: Nenhuma atividade encontrada!');
        console.log('🔍 Verificando resposta completa...');
        console.log(JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log('❌ Sem autenticação não funcionou:', error.response?.status);

      // Vamos tentar listar projetos para ver se conseguimos pegar um ID válido
      console.log('\n📋 Tentando listar projetos...');
      try {
        const listResponse = await axios.get(
          'http://localhost:5000/api/projects'
        );
        console.log('✅ Lista obtida');

        if (listResponse.data.data.projects.length > 0) {
          const firstProject = listResponse.data.data.projects[0];
          console.log(`\n🎯 Usando primeiro projeto: ${firstProject.id}`);

          const detailResponse = await axios.get(
            `http://localhost:5000/api/projects/${firstProject.id}`
          );
          const project = detailResponse.data.data.project;

          console.log('📋 Detalhes:');
          console.log('   Nome:', project.name);
          console.log('   Atividades:', project.activities?.length || 0);
          console.log(
            '   Metadata:',
            project.metadata ? 'presente' : 'ausente'
          );

          if (project.activities && project.activities.length > 0) {
            console.log('\n🎯 Primeiras 3 atividades:');
            project.activities.slice(0, 3).forEach((activity, index) => {
              console.log(`   ${index + 1}. ${activity.name || 'Sem nome'}`);
              console.log(`      Tipo: ${activity.type || 'N/A'}`);
              console.log(`      Progresso: ${activity.progress || 0}%`);
              console.log(
                `      Subatividades: ${activity.subActivities?.length || 0}`
              );
            });
          } else {
            console.log('❌ PROBLEMA: Nenhuma atividade encontrada!');
          }
        }
      } catch (listError) {
        console.log('❌ Erro ao listar projetos:', listError.response?.status);
      }
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDirectProjectQuery();
