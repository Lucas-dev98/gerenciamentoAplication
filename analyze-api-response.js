const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function analyzeAPIResponse() {
  console.log('🔍 ANALISANDO ESTRUTURA DA RESPOSTA DA API');
  console.log('==========================================');

  try {
    // Fazer login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    });

    const token = loginResponse.data.token;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Testar /api/projects
    console.log('\n📋 Analisando GET /api/projects:');
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers,
    });
    console.log('✅ Status:', projectsResponse.status);
    console.log('📊 Estrutura da resposta completa:');
    console.log(JSON.stringify(projectsResponse.data, null, 2));

    console.log('\n🔍 Analisando estrutura esperada pelo frontend:');
    console.log('O frontend está buscando: response.data?.projects');
    console.log(
      'Mas a API retorna: response.data.data.data (array de projetos)'
    );

    const actualProjects = projectsResponse.data.data?.data || [];
    console.log(
      `\n📈 Projetos encontrados na estrutura real: ${actualProjects.length}`
    );

    if (actualProjects.length > 0) {
      console.log('\n📝 Estrutura de um projeto:');
      console.log(JSON.stringify(actualProjects[0], null, 2));
    }

    // Testar também /api/projects-crud para comparar
    console.log('\n\n📋 Analisando GET /api/projects-crud:');
    try {
      const projectsCrudResponse = await axios.get(
        `${BASE_URL}/api/projects-crud`,
        { headers }
      );
      console.log('✅ Status:', projectsCrudResponse.status);
      console.log('📊 Estrutura da resposta CRUD:');
      console.log(JSON.stringify(projectsCrudResponse.data, null, 2));
    } catch (error) {
      console.log(
        '❌ Erro na rota CRUD:',
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

analyzeAPIResponse();
