const axios = require('axios');

async function testFrontendUpdateFlow() {
  try {
    console.log('🧪 Testando fluxo completo de atualização via frontend...\n');

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

    // Criar um projeto para testar
    const projectData = {
      name: 'Projeto Frontend Test',
      description: 'Projeto para testar atualização via frontend',
      status: 'draft',
      priority: 'medium',
      budget: 10000,
      startDate: new Date().toISOString(),
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
              endDate: new Date(Date.now() + 5 * 60000).toISOString(),
            },
          ],
        },
      ],
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

    const projectId = createResponse.data.data.project.id;
    console.log('✅ Projeto criado:', projectId);

    // Simular atualização como faria o frontend
    const updateData = {
      name: 'Projeto Frontend Test - ATUALIZADO',
      description: 'Descrição atualizada via frontend',
      status: 'active',
      priority: 'high',
      budget: 15000,
    };

    console.log('\n✏️ Atualizando projeto...');
    const updateResponse = await axios.put(
      `http://localhost:5000/api/projects/${projectId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Projeto atualizado com sucesso!');
    console.log('- Nome:', updateResponse.data.data.project.name);
    console.log('- Status:', updateResponse.data.data.project.status);
    console.log('- Prioridade:', updateResponse.data.data.project.priority);
    console.log('- Orçamento:', updateResponse.data.data.project.budget);

    // Verificar se os dados foram persistidos
    console.log('\n🔍 Verificando persistência...');
    const getResponse = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const project = getResponse.data.data.project;
    console.log('✅ Dados verificados:');
    console.log('- Nome:', project.name);
    console.log('- Descrição:', project.description);
    console.log('- Status:', project.status);
    console.log('- Prioridade:', project.priority);
    console.log('- Orçamento:', project.budget);

    // Testar exclusão
    console.log('\n🗑️ Testando exclusão...');
    const deleteResponse = await axios.delete(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Projeto excluído com sucesso!');
    console.log('Response:', deleteResponse.data.message);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendUpdateFlow();
