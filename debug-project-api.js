const axios = require('axios');

async function debugProjectAPI() {
  try {
    console.log('🔍 Debug da API de projetos...');

    // Login para obter token
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');

    // Buscar projetos
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('\n📋 Lista de projetos:');
    console.log(JSON.stringify(projectsResponse.data, null, 2));

    if (
      projectsResponse.data.data?.projects &&
      projectsResponse.data.data.projects.length > 0
    ) {
      const project = projectsResponse.data.data.projects[0];
      const projectId = project.id;

      console.log(`\n🎯 Testando detalhes do projeto: ${projectId}`);

      // Buscar detalhes específicos do projeto
      const projectDetailResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('\n📊 Resposta dos detalhes:');
      console.log(JSON.stringify(projectDetailResponse.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

debugProjectAPI();
