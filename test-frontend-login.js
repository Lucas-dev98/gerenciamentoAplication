const axios = require('axios');

async function testFrontendLogin() {
  try {
    console.log('🔐 Simulando login do frontend...\n');

    // Simular login igual ao frontend
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Login realizado');
    console.log('Response structure:', {
      status: loginResponse.status,
      hasData: !!loginResponse.data,
      dataKeys: Object.keys(loginResponse.data || {}),
    });

    // Verificar token
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('Token obtido:', token ? 'presente' : 'ausente');

    if (token) {
      // Simular chamada de projetos igual ao frontend
      console.log('\n📋 Buscando projetos como o frontend...');
      const projectsResponse = await axios.get(
        'http://localhost:5000/api/projects',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Resposta de projetos recebida');
      console.log('Response structure:', {
        status: projectsResponse.status,
        dataKeys: Object.keys(projectsResponse.data || {}),
      });

      // Simular exatamente o que o frontend faz
      console.log('\n🎯 Processando como o frontend:');
      const response = projectsResponse;
      console.log(
        'response.data?.data?.projects:',
        response.data?.data?.projects ? 'presente' : 'ausente'
      );
      console.log(
        'response.data?.projects:',
        response.data?.projects ? 'presente' : 'ausente'
      );
      console.log('response.data:', response.data ? 'presente' : 'ausente');

      const projectsData =
        response.data?.data?.projects ||
        response.data?.projects ||
        response.data ||
        [];
      console.log('projectsData length:', projectsData.length);

      if (projectsData.length > 0) {
        console.log('\n✅ Projetos encontrados para o frontend:');
        projectsData.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} (${project.id})`);
        });
      } else {
        console.log('\n❌ Nenhum projeto processado pelo frontend');
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendLogin();
