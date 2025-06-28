const axios = require('axios');

async function testProjectsList() {
  try {
    console.log('📋 Testando listagem de projetos...\n');

    // Login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');

    // Listar projetos
    console.log('📡 Buscando lista de projetos...');
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`✅ Resposta recebida - Status: ${projectsResponse.status}`);

    const projectsData = projectsResponse.data;
    console.log('\n📊 Estrutura da resposta:');
    console.log('- Status:', projectsData.status);
    console.log('- Message:', projectsData.message);
    console.log('- Count:', projectsData.data?.count);
    console.log(
      '- Projects array length:',
      projectsData.data?.projects?.length
    );

    if (projectsData.data?.projects && projectsData.data.projects.length > 0) {
      console.log('\n🎯 Projetos encontrados:');
      projectsData.data.projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   ID: ${project.id}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Progresso: ${project.progress}%`);
        console.log(
          `   Criado: ${new Date(project.createdAt).toLocaleString('pt-BR')}`
        );
        console.log(`   Descrição: ${project.description}`);
        console.log(`   Tags: ${project.tags?.join(', ') || 'Nenhuma'}`);
      });

      // Verificar se o projeto mais recente é o que criamos
      const latestProject = projectsData.data.projects[0];
      if (latestProject.name.includes('Test Final')) {
        console.log('\n✅ Projeto criado pelo teste encontrado na listagem!');
        console.log(
          `🌐 URL do card: http://localhost:3000/projetos/${latestProject.id}`
        );
      }
    } else {
      console.log('\n❌ Nenhum projeto encontrado na listagem');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testProjectsList();
