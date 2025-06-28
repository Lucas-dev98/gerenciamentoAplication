const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testCSVUpload() {
  try {
    console.log('🚀 Iniciando teste de upload CSV...');

    // Primeiro, fazer login para obter token
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Token:', token ? 'Obtido' : 'Não encontrado');

    if (!token) {
      console.error('❌ Token não encontrado na resposta:', loginResponse.data);
      return;
    }

    // Preparar arquivo CSV
    const csvPath = path.join(
      __dirname,
      'backend/src/data/Project/250619 - Report - PFBT1.csv'
    );

    if (!fs.existsSync(csvPath)) {
      console.error('❌ Arquivo CSV não encontrado:', csvPath);
      return;
    }

    console.log('📄 Arquivo CSV encontrado:', csvPath);

    // Criar FormData
    const form = new FormData();
    form.append('csvFile', fs.createReadStream(csvPath));
    form.append('projectName', 'Teste PFBT1 - Cronograma Operacional');

    // Fazer upload
    console.log('⬆️ Fazendo upload do CSV...');
    const uploadResponse = await axios.post(
      'http://localhost:5000/api/projects/upload-csv',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Upload realizado com sucesso!');
    console.log('📊 Resultado:', JSON.stringify(uploadResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testCSVUpload();
