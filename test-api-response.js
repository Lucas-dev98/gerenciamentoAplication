// Teste para verificar resposta da API updateProjectCSV
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testAPIResponse() {
  try {
    console.log('🔍 Testando resposta da API updateProjectCSV');

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@csv.com',
      password: 'teste123',
    });
    const token = loginResponse.data.token;

    // Buscar projeto
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const projects =
      projectsResponse.data.data?.projects || projectsResponse.data.data || [];
    const projectId = projects[0].id || projects[0]._id;

    // Criar CSV
    const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
TESTE API;3;;50;45
Sistema X;4;S;75;70`;

    const csvPath = path.join(__dirname, 'test-api-response.csv');
    fs.writeFileSync(csvPath, csvContent);

    // Upload via axios (para testar resposta)
    console.log('📤 Testando upload com axios...');

    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvPath));

    // Upload via axios (para testar resposta)
    console.log('📤 Testando upload com axios...');

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

    console.log('✅ Resposta recebida via axios:');
    console.log('   Status HTTP:', uploadResponse.status);
    console.log('   Data.status:', uploadResponse.data.status);
    console.log('   Data.message:', uploadResponse.data.message);
    console.log(
      '   Estrutura completa:',
      JSON.stringify(uploadResponse.data, null, 2)
    );

    // Limpeza
    fs.unlinkSync(csvPath);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
    }
  }
}

testAPIResponse();
