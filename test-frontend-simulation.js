const axios = require('axios');

async function testFrontendSimulation() {
  try {
    console.log('🎭 Simulando exatamente o que o frontend faz...\n');

    // 1. Login (simular login do frontend)
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Token obtido:', token ? 'presente' : 'ausente');

    // 2. Simular a chamada exata que o frontend faz
    const projectId = '685eb11c6de6cd14580fc990'; // ID do projeto criado no teste anterior

    console.log('📡 Chamando API exatamente como o frontend...');
    const response = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Resposta recebida:');
    console.log('   Status:', response.status);
    console.log('   Data structure:', typeof response.data);

    // Simular exatamente o que o frontend faz
    console.log('\n🎯 Processando como o frontend:');
    console.log(
      'response.data?.project:',
      response.data?.project ? 'presente' : 'ausente'
    );
    console.log('response.data:', typeof response.data);

    const projectData = response.data?.project || response.data;
    console.log('projectData após processamento:', typeof projectData);

    if (projectData && projectData.data) {
      console.log('📋 Dados do projeto (via projectData.data):');
      const project = projectData.data.project;
      console.log('   Nome:', project?.name);
      console.log('   Atividades:', project?.activities?.length);
    } else if (projectData && projectData.name) {
      console.log('📋 Dados do projeto (direto):');
      console.log('   Nome:', projectData.name);
      console.log('   Atividades:', projectData.activities?.length);
      console.log(
        '   Metadata:',
        projectData.metadata ? 'presente' : 'ausente'
      );
    } else {
      console.log('❌ Estrutura de dados não reconhecida');
      console.log('   Keys disponíveis:', Object.keys(projectData || {}));
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testFrontendSimulation();
