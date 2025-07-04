/**
 * Teste do Frontend - Upload de CSV
 * Testa se o frontend consegue fazer upload de CSV corretamente
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';

async function testFrontendCSV() {
  try {
    console.log('🧪 TESTE FRONTEND - Upload de CSV');
    console.log('===================================\n');

    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Criar CSV de teste
    const csvContent = `name,description,type,priority,assignedTo,startDate,endDate,tags
Projeto Frontend 1,Descrição do projeto 1,desenvolvimento,high,Lucas Bastos,2025-01-01,2025-12-31,"frontend,teste"
Projeto Frontend 2,Descrição do projeto 2,manutencao,medium,Maria Silva,2025-02-01,2025-11-30,"backend,api"
Projeto Frontend 3,Descrição do projeto 3,pesquisa,low,João Santos,2025-03-01,2025-10-31,"pesquisa,dados"`;

    fs.writeFileSync('frontend-test.csv', csvContent);
    console.log('📁 Arquivo CSV de teste criado');

    // 3. Simular upload como o frontend faria
    console.log('📤 Testando upload como o frontend...');

    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream('frontend-test.csv'));
    formData.append('projectName', 'Projeto de Teste Frontend');
    formData.append(
      'projectDescription',
      'Projeto criado via frontend para teste'
    );
    formData.append('projectType', 'desenvolvimento');
    formData.append('priority', 'high');
    formData.append('assignedTo', 'Lucas Bastos');
    formData.append('tags', 'frontend,teste,csv');

    const response = await axios.post(
      `${BASE_URL}/api/projects/import-csv`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Upload realizado com sucesso!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta:', response.data);

    // 4. Verificar se os projetos foram criados
    console.log('\n📋 Verificando projetos criados...');
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const projects = projectsResponse.data.data?.data || [];
    console.log(`✅ Total de projetos: ${projects.length}`);

    // Buscar projetos que começam com "Projeto Frontend"
    const frontendProjects = projects.filter(
      (p) => p.name && p.name.startsWith('Projeto Frontend')
    );
    console.log(`📊 Projetos do teste frontend: ${frontendProjects.length}`);

    if (frontendProjects.length > 0) {
      console.log('📝 Projetos encontrados:');
      frontendProjects.forEach((project, index) => {
        console.log(
          `  ${index + 1}. ${project.name} - ${project.type} (${project.priority})`
        );
      });
    }

    // 5. Limpeza
    fs.unlinkSync('frontend-test.csv');
    console.log('\n🧹 Arquivo de teste removido');

    console.log('\n🎉 TESTE FRONTEND CONCLUÍDO COM SUCESSO!');
  } catch (error) {
    console.error('❌ Erro no teste frontend:');
    console.error('Status:', error.response?.status);
    console.error('Dados:', error.response?.data);
    console.error('Mensagem:', error.message);

    // Limpeza em caso de erro
    try {
      fs.unlinkSync('frontend-test.csv');
    } catch {}
  }
}

testFrontendCSV();
