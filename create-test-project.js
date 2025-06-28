const axios = require('axios');

async function createTestProject() {
  try {
    console.log('📝 Criando projeto de teste...\n');

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

    // Criar projeto simples
    const projectData = {
      name: 'Projeto Teste - Edição',
      description: 'Projeto criado para testar edição e exclusão',
      status: 'draft',
      priority: 'medium',
      activities: [
        {
          name: 'Atividade de Teste',
          type: 'parada',
          duration: 10,
          subActivities: [
            {
              name: 'Sub-atividade 1',
              duration: 5,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutos depois
            },
            {
              name: 'Sub-atividade 2',
              duration: 5,
              startDate: new Date(Date.now() + 5 * 60000).toISOString(),
              endDate: new Date(Date.now() + 10 * 60000).toISOString(),
            },
          ],
        },
      ],
      metadata: {
        csvFileName: 'manual-test.csv',
        uploadDate: new Date().toISOString(),
        totalActivities: 1,
        totalSubActivities: 2,
      },
    };

    const createResponse = await axios.post(
      'http://localhost:5000/api/projects',
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Projeto criado com sucesso');
    console.log('ID:', createResponse.data.data.project.id);
    console.log('Nome:', createResponse.data.data.project.name);
    console.log('Status:', createResponse.data.data.project.status);

    // Criar segundo projeto para teste de exclusão
    const project2Data = {
      ...projectData,
      name: 'Projeto Teste 2 - Para Exclusão',
      description: 'Segundo projeto para testar exclusão',
    };

    const create2Response = await axios.post(
      'http://localhost:5000/api/projects',
      project2Data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Segundo projeto criado com sucesso');
    console.log('ID:', create2Response.data.data.project.id);
    console.log('Nome:', create2Response.data.data.project.name);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

createTestProject();
