const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testCSVUploadExistingProject() {
  try {
    console.log('🧪 Teste: Upload de CSV em Projeto Existente');
    console.log('='.repeat(50));

    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@csv.com',
      password: 'teste123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Listar projetos existentes
    console.log('2. Buscando projetos existentes...');
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const projects =
      projectsResponse.data.data?.projects || projectsResponse.data.data || [];
    if (projects.length === 0) {
      console.log('❌ Nenhum projeto encontrado. Crie um projeto primeiro.');
      return;
    }

    const project = projects[0];
    const projectId = project.id || project._id;
    console.log(`✅ Usando projeto existente: ${project.name} (${projectId})`);

    // 3. Criar arquivo CSV de teste
    console.log('3. Criando arquivo CSV...');
    const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
TESTE ATUALIZAÇÃO;3;;45;40
Sistema A;4;S;80;75
Sistema B;4;S;70;65
Sistema C;4;S;60;55
OPERAÇÃO;3;;30;25
Teste 1;4;S;50;45
Teste 2;4;S;40;35`;

    const csvPath = path.join(__dirname, 'teste-update.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log('✅ Arquivo CSV criado');

    // 4. Upload CSV para atualizar projeto
    console.log('4. Fazendo upload do CSV...');
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvPath));

    const uploadResponse = await axios.put(
      `${BASE_URL}/api/projects/${projectId}/update-csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log('✅ Upload realizado com sucesso!');
    console.log('📊 Resultado:', {
      status: uploadResponse.data.status,
      totalAtividades: uploadResponse.data.data.estatisticas.totalAtividades,
      progressoGeral:
        uploadResponse.data.data.estatisticas.progressoGeral + '%',
    });

    // 5. Limpar arquivo
    fs.unlinkSync(csvPath);
    console.log('✅ Arquivo temporário removido');

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log(
      '✅ A funcionalidade de upload de CSV na edição está funcionando!'
    );
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

testCSVUploadExistingProject();
