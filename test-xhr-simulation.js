const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testXMLHttpRequestLike() {
  console.log('🧪 Simulando XMLHttpRequest do Frontend');
  console.log('='.repeat(50));

  try {
    // 1. Login para obter token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@csv.com',
      password: 'teste123',
    });
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');

    // 2. Criar projeto
    const createResponse = await axios.post(
      `${BASE_URL}/api/projects`,
      {
        name: 'Teste XMLHttpRequest',
        description: 'Teste de simulação',
        status: 'active',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const projectId = createResponse.data.data.project.id;
    console.log('✅ Projeto criado:', projectId);

    // 3. Criar CSV
    const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
TESTE XMLHttp;4;S;80;75`;
    const csvPath = path.join(__dirname, 'temp-xhr-test.csv');
    fs.writeFileSync(csvPath, csvContent);

    // 4. Simular o que o XMLHttpRequest faz
    console.log('4. Simulando XMLHttpRequest...');

    // Simular FormData (não é possível fazer exatamente igual no Node.js, mas podemos simular o resultado)
    const FormData = require('form-data');
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

    // Simular exatamente o que acontece no frontend
    console.log('\n📋 SIMULANDO O QUE ACONTECE NO FRONTEND:');
    console.log(
      'xhr.responseText (string):',
      JSON.stringify(uploadResponse.data)
    );

    // O que o XMLHttpRequest faz: JSON.parse(xhr.responseText)
    const parsedResponse = uploadResponse.data; // axios já faz o parse
    console.log('Resposta parseada:', parsedResponse);

    // Verificação que o frontend faz
    console.log('\n🔍 VERIFICAÇÕES DO FRONTEND:');
    console.log('response:', parsedResponse);
    console.log('response.status:', parsedResponse.status);
    console.log('typeof response.status:', typeof parsedResponse.status);
    console.log(
      'response.status === "success"?',
      parsedResponse.status === 'success'
    );

    // Simular exatamente a lógica do frontend
    if (parsedResponse.status === 'success') {
      console.log(
        '✅ FRONTEND: Sucesso - Mensagem que seria exibida: "CSV atualizado com sucesso! Recarregando dados..."'
      );
    } else {
      console.log(
        '❌ FRONTEND: Erro - Mensagem que seria exibida:',
        'Erro ao atualizar CSV: ' +
          (parsedResponse.message || 'Erro desconhecido')
      );
    }

    // Limpar
    fs.unlinkSync(csvPath);
    console.log('✅ Arquivo temporário removido');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Detalhes:', error.response.data);
    }
  }
}

testXMLHttpRequestLike();
