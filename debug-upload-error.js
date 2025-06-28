const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function debugUploadError() {
  try {
    console.log('🔍 Debug do erro de upload...');

    // Primeiro, fazer login
    console.log('📝 Fazendo login...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');
    console.log('🔑 Token:', token ? 'Obtido' : 'Não encontrado');

    if (!token) {
      console.error('❌ Token não encontrado na resposta:', loginResponse.data);
      return;
    }

    // Verificar se arquivo existe
    const csvPath = path.join(
      __dirname,
      'backend/src/data/Project/250619 - Report - PFBT1.csv'
    );
    console.log('📄 Verificando arquivo CSV:', csvPath);
    console.log('📄 Arquivo existe?', fs.existsSync(csvPath));

    if (!fs.existsSync(csvPath)) {
      console.error('❌ Arquivo CSV não encontrado');
      return;
    }

    // Verificar tamanho do arquivo
    const stats = fs.statSync(csvPath);
    console.log('📊 Tamanho do arquivo:', stats.size, 'bytes');

    // Criar FormData
    const form = new FormData();
    form.append('csvFile', fs.createReadStream(csvPath));
    form.append('projectName', 'Debug Upload Test');

    console.log('⬆️ Fazendo upload do CSV...');
    console.log('🔗 URL:', 'http://localhost:5000/api/projects/upload-csv');
    console.log('📋 Headers:', {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
    });

    // Fazer upload
    const uploadResponse = await axios.post(
      'http://localhost:5000/api/projects/upload-csv',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000, // 30 segundos
      }
    );

    console.log('✅ Upload realizado com sucesso!');
    console.log('📊 Resultado:', JSON.stringify(uploadResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Erro detalhado:');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    console.error('Stack:', error.stack);
  }
}

debugUploadError();
