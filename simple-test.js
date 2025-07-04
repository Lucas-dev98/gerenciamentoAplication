const axios = require('axios');

async function simpleTest() {
  try {
    // Login primeiro
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'l.o.bastos@live.com',
        password: '44351502741-+as',
      }
    );

    const token = loginResponse.data.token;
    console.log('✓ Login realizado com sucesso');

    // Testar endpoint simples
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const project = projectsResponse.data.data.projects[0];
    const projectId = project.id;
    console.log('✓ Projeto encontrado:', project.name);

    // Testar endpoint simples primeiro
    console.log('Testando endpoint simples...');
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✓ Teste simples funcionou:', testResponse.data);

    // Testar endpoint específico
    console.log(
      'Testando endpoint:',
      `http://localhost:5000/api/projects/${projectId}/procedimento-parada`
    );
    const response = await axios.get(
      `http://localhost:5000/api/projects/${projectId}/procedimento-parada`
    );

    console.log('✓ Resposta recebida:', response.status, typeof response.data);
  } catch (error) {
    console.error(
      '❌ Erro:',
      error.response?.status,
      error.response?.data || error.message
    );
  }
}

simpleTest();
