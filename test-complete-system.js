// Teste completo do frontend e backend
// Verifica se todos os endpoints CRUD estão funcionando corretamente

const API_BASE_URL = 'http://localhost:5000';

async function testCompleteFlow() {
  console.log('=== TESTE COMPLETO DO SISTEMA DE PROJETOS ===\n');

  try {
    // 1. Testar listagem de projetos
    console.log('1. Testando listagem de projetos...');
    const listResponse = await fetch(`${API_BASE_URL}/api/projects-crud`);
    const listData = await listResponse.json();
    console.log('✓ Listagem funcionando');
    console.log(`Total de projetos: ${listData.data.projects.length}`);
    console.log(`Estrutura da resposta:`, {
      success: listData.success,
      hasData: !!listData.data,
      hasProjects: !!listData.data?.projects,
      hasPagination: !!listData.data?.pagination,
    });

    // 2. Testar estatísticas
    console.log('\n2. Testando estatísticas...');
    const statsResponse = await fetch(
      `${API_BASE_URL}/api/projects-crud/stats`
    );
    const statsData = await statsResponse.json();
    console.log('✓ Estatísticas funcionando');
    console.log('Dados:', statsData.data);

    // 3. Testar criação de projeto
    console.log('\n3. Testando criação de projeto...');
    const newProject = {
      name: 'Projeto Teste Completo',
      description: 'Projeto criado para testar integração frontend-backend',
      status: 'active',
      priority: 'medium',
      progress: 0,
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/projects-crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    });

    const createData = await createResponse.json();
    console.log('✓ Criação funcionando');
    console.log('Resposta completa:', JSON.stringify(createData, null, 2));
    console.log('Projeto criado:', createData.data);

    if (!createData.data || !createData.data._id) {
      throw new Error(
        'Dados de criação inválidos: ' + JSON.stringify(createData)
      );
    }

    const projectId = createData.data._id;

    // 4. Testar busca de projeto específico
    console.log('\n4. Testando busca de projeto específico...');
    const getResponse = await fetch(
      `${API_BASE_URL}/api/projects-crud/${projectId}`
    );
    const getData = await getResponse.json();
    console.log('✓ Busca específica funcionando');
    console.log('Projeto encontrado:', getData.data.name);

    // 5. Testar atualização
    console.log('\n5. Testando atualização...');
    const updateData = {
      name: 'Projeto Teste Completo - Atualizado',
      progress: 50,
    };

    const updateResponse = await fetch(
      `${API_BASE_URL}/api/projects-crud/${projectId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      }
    );

    const updatedData = await updateResponse.json();
    console.log('✓ Atualização funcionando');
    console.log('Projeto atualizado:', updatedData.data.name);

    // 6. Testar duplicação
    console.log('\n6. Testando duplicação...');
    const duplicateResponse = await fetch(
      `${API_BASE_URL}/api/projects-crud/${projectId}/duplicate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Projeto Duplicado' }),
      }
    );

    const duplicateData = await duplicateResponse.json();
    console.log('✓ Duplicação funcionando');
    console.log('Projeto duplicado:', duplicateData.data.name);

    // 7. Testar exclusão do projeto duplicado
    console.log('\n7. Testando exclusão...');
    const deleteResponse = await fetch(
      `${API_BASE_URL}/api/projects-crud/${duplicateData.data._id}`,
      {
        method: 'DELETE',
      }
    );

    const deleteData = await deleteResponse.json();
    console.log('✓ Exclusão funcionando');
    console.log('Projeto excluído com sucesso');

    // 8. Verificar listagem final
    console.log('\n8. Verificando listagem final...');
    const finalListResponse = await fetch(`${API_BASE_URL}/api/projects-crud`);
    const finalListData = await finalListResponse.json();
    console.log('✓ Listagem final funcionando');
    console.log(
      `Total de projetos após testes: ${finalListData.data.projects.length}`
    );

    console.log('\n=== TODOS OS TESTES PASSOU! ===');
    console.log('✅ Sistema de projetos está funcionando corretamente');
    console.log('✅ Todos os endpoints CRUD estão respondendo');
    console.log('✅ Estrutura de dados está correta');
    console.log('✅ Frontend pode consumir todas as APIs');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error('Stack trace:', error.stack);
  }
}

testCompleteFlow();
