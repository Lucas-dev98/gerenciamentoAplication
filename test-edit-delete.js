const axios = require('axios');

async function testEditDeleteProject() {
  try {
    console.log('🧪 Testando editar e excluir projeto...\n');

    // Aguardar um pouco para evitar rate limit
    await new Promise((resolve) => setTimeout(resolve, 2000));

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

    // Listar projetos
    const projectsResponse = await axios.get(
      'http://localhost:5000/api/projects',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const projects = projectsResponse.data.data.projects;
    console.log(`📋 Projetos encontrados: ${projects.length}`);

    if (projects.length > 0) {
      const project = projects[0];
      console.log(`\n🎯 Testando com projeto: ${project.name} (${project.id})`);

      // Testar EDIÇÃO
      console.log('\n✏️ Testando edição...');
      const updateData = {
        name: project.name + ' - EDITADO',
        description: 'Descrição editada via teste',
        status: 'active',
        priority: 'high',
      };

      const updateResponse = await axios.put(
        `http://localhost:5000/api/projects/${project.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Projeto editado com sucesso');
      console.log('Nome atualizado:', updateResponse.data.data.project.name);

      // Verificar se a edição funcionou
      const detailResponse = await axios.get(
        `http://localhost:5000/api/projects/${project.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Verificação da edição:');
      console.log('- Nome:', detailResponse.data.data.project.name);
      console.log('- Descrição:', detailResponse.data.data.project.description);
      console.log('- Status:', detailResponse.data.data.project.status);
      console.log('- Prioridade:', detailResponse.data.data.project.priority);

      // Testar EXCLUSÃO (se houver mais de 1 projeto)
      if (projects.length > 1) {
        const projectToDelete = projects[1];
        console.log(
          `\n🗑️ Testando exclusão do projeto: ${projectToDelete.name}`
        );

        const deleteResponse = await axios.delete(
          `http://localhost:5000/api/projects/${projectToDelete.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log('✅ Projeto excluído com sucesso');
        console.log('Response:', deleteResponse.data.message);

        // Verificar se a exclusão funcionou
        const updatedProjectsResponse = await axios.get(
          'http://localhost:5000/api/projects',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(
          `✅ Verificação da exclusão: ${updatedProjectsResponse.data.data.projects.length} projetos restantes`
        );
      } else {
        console.log(
          '\n⚠️ Apenas 1 projeto disponível, pulando teste de exclusão'
        );
      }
    } else {
      console.log('❌ Nenhum projeto encontrado para testar');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testEditDeleteProject();
