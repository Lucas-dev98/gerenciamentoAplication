const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFrontendEndpoints() {
  console.log('🧪 Testando endpoints que o frontend utiliza...\n');

  try {
    // Test 1: Get projects stats (required by frontend statistics)
    console.log('1. Testando /api/projects-crud/stats...');
    try {
      const statsResponse = await axios.get(
        `${BASE_URL}/api/projects-crud/stats`
      );
      console.log('✅ Stats obtidas:', statsResponse.data);
    } catch (error) {
      console.log('❌ Erro nas stats:', error.response?.data || error.message);
    }

    // Test 2: Get all projects (used by frontend list)
    console.log('\n2. Testando /api/projects-crud...');
    try {
      const projectsResponse = await axios.get(`${BASE_URL}/api/projects-crud`);
      console.log(
        '✅ Projetos obtidos:',
        projectsResponse.data.projects?.length || 0,
        'projetos'
      );
    } catch (error) {
      console.log(
        '❌ Erro nos projetos:',
        error.response?.data || error.message
      );
    }

    // Test 3: Create a new project (frontend form)
    console.log('\n3. Testando criação de projeto...');
    const newProject = {
      name: 'Projeto Teste Frontend',
      description: 'Projeto criado para testar o frontend',
      status: 'active',
      priority: 'medium',
      budget: 10000,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      owner: 'Admin',
      tags: ['teste', 'frontend'],
    };

    try {
      const createResponse = await axios.post(
        `${BASE_URL}/api/projects-crud`,
        newProject
      );
      console.log(
        '✅ Resposta completa da criação:',
        JSON.stringify(createResponse.data, null, 2)
      );
      console.log('✅ Projeto criado:', createResponse.data.project?.name);

      // Test 4: Get single project (for detail view)
      const projectId = createResponse.data.project?._id;
      if (!projectId) {
        console.log('❌ ID do projeto não encontrado na resposta');
        return;
      }
      console.log('\n4. Testando visualização de projeto...');
      try {
        const detailResponse = await axios.get(
          `${BASE_URL}/api/projects/${projectId}`
        );
        console.log(
          '✅ Detalhes do projeto obtidos:',
          detailResponse.data.data?.project?.name
        );

        // Test 5: Update project (edit functionality)
        console.log('\n5. Testando edição de projeto...');
        try {
          const updateResponse = await axios.put(
            `${BASE_URL}/api/projects/${projectId}`,
            {
              name: 'Projeto Teste Frontend - Editado',
              description: 'Projeto editado via teste',
            }
          );
          console.log('✅ Projeto editado:', updateResponse.data.project?.name);

          // Test 6: Delete project (delete functionality)
          console.log('\n6. Testando exclusão de projeto...');
          try {
            const deleteResponse = await axios.delete(
              `${BASE_URL}/api/projects/${projectId}`
            );
            console.log('✅ Projeto excluído:', deleteResponse.data.message);
          } catch (error) {
            console.log(
              '❌ Erro na exclusão:',
              error.response?.data || error.message
            );
          }
        } catch (error) {
          console.log(
            '❌ Erro na edição:',
            error.response?.data || error.message
          );
        }
      } catch (error) {
        console.log(
          '❌ Erro nos detalhes:',
          error.response?.data || error.message
        );
      }
    } catch (error) {
      console.log('❌ Erro na criação:', error.response?.data || error.message);
    }

    console.log('\n✅ Teste de endpoints do frontend concluído!');
    console.log(
      '\n📌 Para testar o CSV upload, use a interface web em http://localhost:3000'
    );
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

// Execute the test
testFrontendEndpoints();
