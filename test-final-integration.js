const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// Test data
const testProject = {
  name: 'Projeto Test CRUD',
  description: 'Projeto criado para testar funcionalidades CRUD',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'Em andamento',
  progress: 25,
  responsible: 'Test User',
  budget: 100000,
  frentes: [
    {
      name: 'Frente A',
      description: 'Primeira frente do projeto',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      progress: 50,
      responsible: 'Responsável A',
    },
  ],
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log(`${options.method || 'GET'} ${url}:`, response.status, data);
    return { response, data };
  } catch (error) {
    console.error('Request failed:', error);
    return { error };
  }
}

async function testCompleteFlow() {
  console.log('🚀 Iniciando teste completo de CRUD e CSV...\n');

  // 1. Test health check
  console.log('1. Testando health check...');
  await makeRequest(`${BASE_URL}/health`);

  // 2. Test get all projects (should be empty initially)
  console.log('\n2. Testando GET /api/projects...');
  const { data: initialProjects } = await makeRequest(
    `${BASE_URL}/api/projects`
  );

  // 3. Test create project
  console.log('\n3. Testando POST /api/projects (CREATE)...');
  const { data: createdProject } = await makeRequest(
    `${BASE_URL}/api/projects`,
    {
      method: 'POST',
      body: JSON.stringify(testProject),
    }
  );

  if (!createdProject || createdProject.error) {
    console.error('❌ Failed to create project');
    return;
  }

  const projectId = createdProject.data?.id || createdProject.id;
  console.log('✅ Project created with ID:', projectId);

  // 4. Test get project by ID
  console.log('\n4. Testando GET /api/projects/:id (READ)...');
  await makeRequest(`${BASE_URL}/api/projects/${projectId}`);

  // 5. Test update project
  console.log('\n5. Testando PUT /api/projects/:id (UPDATE)...');
  const updatedData = {
    ...testProject,
    name: 'Projeto Test CRUD - ATUALIZADO',
    progress: 50,
    status: 'Concluído',
  };
  await makeRequest(`${BASE_URL}/api/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  // 6. Test CSV creation
  console.log('\n6. Testando criação de arquivo CSV para upload...');
  const csvContent = `nome,descricao,dataInicio,dataFim,status,progresso,responsavel,orcamento
Projeto CSV Test,Projeto criado via CSV,2024-01-01,2024-12-31,Em andamento,30,CSV User,150000
Projeto CSV Test 2,Segundo projeto via CSV,2024-02-01,2024-11-30,Planejamento,10,CSV User 2,200000`;

  const csvFilePath = path.join(__dirname, 'test-projects.csv');
  fs.writeFileSync(csvFilePath, csvContent);
  console.log('✅ CSV file created at:', csvFilePath);

  // 7. Test CSV import
  console.log('\n7. Testando POST /api/projects/import-csv (CSV IMPORT)...');
  try {
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvFilePath));

    const response = await fetch(`${BASE_URL}/api/projects/import-csv`, {
      method: 'POST',
      body: formData,
    });

    const csvResult = await response.json();
    console.log('CSV Import Response:', response.status, csvResult);
  } catch (error) {
    console.error('❌ CSV Import failed:', error);
  }

  // 8. Test get all projects after CSV import
  console.log('\n8. Testando GET /api/projects após importação CSV...');
  const { data: allProjects } = await makeRequest(`${BASE_URL}/api/projects`);
  console.log(
    `✅ Total projects after import: ${allProjects?.data?.length || allProjects?.length || 0}`
  );

  // 9. Test CSV export
  console.log('\n9. Testando GET /api/projects/export-csv (CSV EXPORT)...');
  try {
    const response = await fetch(`${BASE_URL}/api/projects/export-csv`);
    console.log('CSV Export Response:', response.status);

    if (response.ok) {
      const csvData = await response.text();
      console.log('✅ CSV Export successful, length:', csvData.length);
      console.log('CSV Preview:', csvData.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ CSV Export failed:', error);
  }

  // 10. Test delete project
  console.log('\n10. Testando DELETE /api/projects/:id (DELETE)...');
  await makeRequest(`${BASE_URL}/api/projects/${projectId}`, {
    method: 'DELETE',
  });

  // 11. Final verification
  console.log('\n11. Verificação final - GET /api/projects...');
  const { data: finalProjects } = await makeRequest(`${BASE_URL}/api/projects`);
  console.log(
    `✅ Final project count: ${finalProjects?.data?.length || finalProjects?.length || 0}`
  );

  // Cleanup
  try {
    fs.unlinkSync(csvFilePath);
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('Cleanup warning:', error.message);
  }

  console.log('\n🎉 Teste completo finalizado!');
}

// Run the test
testCompleteFlow().catch(console.error);
