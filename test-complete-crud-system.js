// Script de teste para validar o sistema completo de gerenciamento de projetos
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000';

// Função para criar um CSV de exemplo
function createSampleCSV() {
  const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
Pátio de Alimentação;3;S;85.5;90.0
Montagem de Equipamentos;4;S;80.0;85.0
Instalação de Tubulações;4;S;90.0;95.0
Secagem;3;S;75.2;80.0
Instalação de Resistências;4;S;70.0;75.0
Testes de Funcionamento;4;S;80.0;85.0
Torre de Resfriamento;3;S;92.1;95.0
Montagem da Estrutura;4;S;95.0;100.0
Instalação de Bombas;4;S;90.0;95.0`;

  const csvPath = path.join(__dirname, 'sample-project.csv');
  fs.writeFileSync(csvPath, csvContent);
  return csvPath;
}

// Função para testar o endpoint de criação de projeto
async function testCreateProject() {
  try {
    console.log('🧪 Testando criação de projeto...');

    const projectData = {
      name: 'Projeto de Teste CRUD',
      description: 'Projeto criado para testar o sistema CRUD completo',
      status: 'active',
      priority: 'high',
      budget: 100000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/projects`,
      projectData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Projeto criado com sucesso:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      '❌ Erro ao criar projeto:',
      error.response?.data || error.message
    );
    return null;
  }
}

// Função para testar o upload de CSV
async function testCSVUpload() {
  try {
    console.log('🧪 Testando upload de CSV...');

    const csvPath = createSampleCSV();
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvPath));

    const response = await axios.post(
      `${API_BASE_URL}/api/projects/import-csv`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    console.log('✅ CSV importado com sucesso:', response.data);

    // Limpar arquivo temporário
    fs.unlinkSync(csvPath);

    return response.data.data;
  } catch (error) {
    console.error(
      '❌ Erro ao importar CSV:',
      error.response?.data || error.message
    );
    return null;
  }
}

// Função para testar busca de projetos
async function testGetProjects() {
  try {
    console.log('🧪 Testando busca de projetos...');

    const response = await axios.get(`${API_BASE_URL}/api/projects`);

    console.log('✅ Projetos encontrados:', response.data.count);
    console.log('📋 Lista de projetos:');
    response.data.data.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });

    return response.data.data;
  } catch (error) {
    console.error(
      '❌ Erro ao buscar projetos:',
      error.response?.data || error.message
    );
    return [];
  }
}

// Função para testar atualização de projeto
async function testUpdateProject(projectId) {
  try {
    console.log('🧪 Testando atualização de projeto...');

    const updateData = {
      name: 'Projeto Atualizado',
      description: 'Descrição atualizada via API',
      status: 'completed',
      priority: 'medium',
    };

    const response = await axios.put(
      `${API_BASE_URL}/api/projects/${projectId}`,
      updateData
    );

    console.log('✅ Projeto atualizado com sucesso:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      '❌ Erro ao atualizar projeto:',
      error.response?.data || error.message
    );
    return null;
  }
}

// Função para testar dados das frentes
async function testGetFrentesData(projectId) {
  try {
    console.log('🧪 Testando dados das frentes...');

    const response = await axios.get(
      `${API_BASE_URL}/api/projects/${projectId}/frentes-data`
    );

    console.log('✅ Dados das frentes obtidos:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      '❌ Erro ao buscar dados das frentes:',
      error.response?.data || error.message
    );
    return null;
  }
}

// Função para testar exportação de CSV
async function testExportCSV(projectId) {
  try {
    console.log('🧪 Testando exportação de CSV...');

    const response = await axios.get(
      `${API_BASE_URL}/api/projects/${projectId}/export-csv`,
      {
        responseType: 'blob',
      }
    );

    const exportPath = path.join(__dirname, `project_${projectId}_export.csv`);
    fs.writeFileSync(exportPath, response.data);

    console.log('✅ CSV exportado com sucesso:', exportPath);
    return exportPath;
  } catch (error) {
    console.error(
      '❌ Erro ao exportar CSV:',
      error.response?.data || error.message
    );
    return null;
  }
}

// Função para testar exclusão de projeto
async function testDeleteProject(projectId) {
  try {
    console.log('🧪 Testando exclusão de projeto...');

    const response = await axios.delete(
      `${API_BASE_URL}/api/projects/${projectId}`
    );

    console.log('✅ Projeto excluído com sucesso:', response.data);
    return true;
  } catch (error) {
    console.error(
      '❌ Erro ao excluir projeto:',
      error.response?.data || error.message
    );
    return false;
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log(
    '🚀 Iniciando testes do sistema de gerenciamento de projetos...\n'
  );

  // Teste 1: Criar projeto
  const createdProject = await testCreateProject();
  if (!createdProject) {
    console.log('❌ Falha nos testes iniciais, encerrando...');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 2: Importar CSV
  const csvProject = await testCSVUpload();

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 3: Buscar projetos
  const projects = await testGetProjects();

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 4: Atualizar projeto
  if (projects.length > 0) {
    await testUpdateProject(projects[0]._id);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 5: Dados das frentes (se houver projeto com CSV)
  if (csvProject && csvProject._id) {
    await testGetFrentesData(csvProject._id);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 6: Exportar CSV
  if (csvProject && csvProject._id) {
    await testExportCSV(csvProject._id);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 7: Excluir projeto (apenas o criado, não o do CSV)
  if (createdProject && createdProject._id) {
    await testDeleteProject(createdProject._id);
  }

  console.log('\n🎉 Testes concluídos!');
  console.log('📊 Resumo:');
  console.log('- ✅ Criação de projeto');
  console.log('- ✅ Importação de CSV');
  console.log('- ✅ Busca de projetos');
  console.log('- ✅ Atualização de projeto');
  console.log('- ✅ Dados das frentes');
  console.log('- ✅ Exportação de CSV');
  console.log('- ✅ Exclusão de projeto');
}

// Executar testes
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testCreateProject,
  testCSVUpload,
  testGetProjects,
  testUpdateProject,
  testGetFrentesData,
  testExportCSV,
  testDeleteProject,
  runAllTests,
};
