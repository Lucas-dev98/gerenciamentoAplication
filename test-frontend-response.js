const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testFrontendResponse() {
  try {
    console.log('🧪 Teste: Resposta exata da API como o frontend recebe');
    console.log('='.repeat(60));

    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@csv.com',
      password: 'teste123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado');

    // 2. Criar projeto
    const projectData = {
      name: 'Projeto Teste Response',
      description: 'Teste de resposta da API',
      status: 'active',
      priority: 'medium',
    };

    const createResponse = await axios.post(
      `${BASE_URL}/api/projects`,
      projectData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const projectId = createResponse.data.data.project.id;
    console.log('✅ Projeto criado:', projectId);

    // 3. Criar CSV de teste
    const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
TESTE 1;4;S;50;45
TESTE 2;4;S;70;65`;

    const csvPath = path.join(__dirname, 'temp-response-test.csv');
    fs.writeFileSync(csvPath, csvContent);

    // 4. Simular exatamente como o frontend faz a chamada
    console.log('4. Testando upload exatamente como o frontend...');

    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvPath));

    try {
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

      console.log('📋 RESPOSTA COMPLETA RECEBIDA:');
      console.log('Status HTTP:', uploadResponse.status);
      console.log('Headers:', uploadResponse.headers);
      console.log(
        'Data completa:',
        JSON.stringify(uploadResponse.data, null, 2)
      );

      console.log('\n🔍 ANÁLISE DA RESPOSTA:');
      console.log('uploadResponse.data.status:', uploadResponse.data.status);
      console.log(
        'Tipo de uploadResponse.data.status:',
        typeof uploadResponse.data.status
      );
      console.log(
        'uploadResponse.data.status === "success"?',
        uploadResponse.data.status === 'success'
      );

      // Simular exatamente a condição do frontend
      if (uploadResponse.data.status === 'success') {
        console.log('✅ Condição do frontend PASSOU - Sucesso!');
      } else {
        console.log('❌ Condição do frontend FALHOU - Erro!');
        console.log(
          'Mensagem que seria exibida:',
          'Erro ao atualizar CSV: ' +
            (uploadResponse.data.message || 'Erro desconhecido')
        );
      }
    } catch (uploadError) {
      console.log('❌ Erro no upload:', uploadError.message);
      if (uploadError.response) {
        console.log('Dados do erro:', uploadError.response.data);
      }
    }

    // 5. Limpar arquivo
    fs.unlinkSync(csvPath);
    console.log('✅ Arquivo temporário removido');
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.error('Detalhes:', error.response.data);
    }
  }
}

testFrontendResponse();
