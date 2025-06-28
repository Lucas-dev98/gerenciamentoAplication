const axios = require('axios');

async function testFrontendDataFlow() {
  try {
    console.log('🧪 Testando fluxo de dados do frontend...\n');

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

    // Testar endpoint de projetos (como o frontend faz)
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('📊 Resposta dos projetos para o frontend:');
    console.log('- Status:', projectsResponse.data.status);
    console.log('- Count:', projectsResponse.data.data.count);
    console.log('- Projects:', projectsResponse.data.data.projects.length);

    // Simular como o frontend processa os dados
    const projects =
      projectsResponse.data.data?.projects ||
      projectsResponse.data?.projects ||
      [];
    console.log('📋 Projetos processados pelo frontend:', projects.length);

    if (projects.length > 0) {
      console.log('✅ Primeiro projeto:');
      console.log('- Nome:', projects[0].name);
      console.log('- Status:', projects[0].status);
      console.log('- ID:', projects[0].id);
    }

    // Testar dashboard data (como o DashboardPage faz)
    const dashboardProjects =
      projectsResponse.data?.projects ||
      projectsResponse.data?.data?.projects ||
      [];
    console.log('📊 Projetos para Dashboard:', dashboardProjects.length);

    const activeProjects = dashboardProjects.filter(
      (p) => p.status === 'active'
    );
    console.log('🟢 Projetos ativos:', activeProjects.length);

    // Testar detalhes de um projeto
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const detailResponse = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('\n🔍 Detalhes do projeto:');
      console.log('- Status response:', detailResponse.data.status);
      console.log('- Has project data:', !!detailResponse.data.data?.project);
      console.log(
        '- Has activities:',
        !!detailResponse.data.data?.project?.activities
      );
      console.log(
        '- Activities count:',
        detailResponse.data.data?.project?.activities?.length || 0
      );
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendDataFlow();
