// Teste específico para XMLHttpRequest - simulando exatamente o que o frontend faz
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Simulação mais exata da função updateProjectCSV do frontend
function simulateUpdateProjectCSV(projectId, fileBuffer, token) {
  return new Promise((resolve, reject) => {
    const XMLHttpRequest = require('xhr2'); // Polyfill para Node.js
    const FormData = require('form-data');

    const formData = new FormData();
    const stream = require('stream');
    const readable = new stream.Readable();
    readable.push(fileBuffer);
    readable.push(null);

    formData.append('csvFile', readable, { filename: 'test.csv' });

    // Usando axios para simular mais precisamente, mas vamos focar na resposta
    axios
      .put(
        `http://localhost:5000/api/projects/${projectId}/update-csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...formData.getHeaders(),
          },
        }
      )
      .then((response) => {
        // Simular exatamente o que o XMLHttpRequest retorna
        console.log('📋 AXIOS RESPONSE STATUS:', response.status);
        console.log('📋 AXIOS RESPONSE DATA:', response.data);

        // O XMLHttpRequest resolve com response.data diretamente
        resolve(response.data);
      })
      .catch((error) => {
        console.log('❌ AXIOS ERROR:', error.message);
        if (error.response) {
          console.log('❌ ERROR RESPONSE STATUS:', error.response.status);
          console.log('❌ ERROR RESPONSE DATA:', error.response.data);

          // XMLHttpRequest rejeita com um erro personalizado
          const customError = new Error(
            error.response.data.message || 'Update failed'
          );
          customError.response = {
            status: error.response.status,
            data: error.response.data,
          };
          reject(customError);
        } else {
          reject(new Error('Network error during update'));
        }
      });
  });
}

async function testExactFrontendFlow() {
  try {
    console.log('🧪 Teste: Fluxo Exato do Frontend');
    console.log('='.repeat(50));

    // 1. Login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'teste@csv.com',
        password: 'teste123',
      }
    );
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');

    // 2. Criar projeto
    const createResponse = await axios.post(
      'http://localhost:5000/api/projects',
      {
        name: 'Teste Fluxo Exato',
        description: 'Teste do fluxo exato do frontend',
        status: 'active',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const projectId = createResponse.data.data.project.id;
    console.log('✅ Projeto criado:', projectId);

    // 3. Criar arquivo CSV
    const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
TESTE FRONTEND;4;S;85;80`;
    const csvBuffer = Buffer.from(csvContent, 'utf8');

    // 4. Simular exatamente o que o frontend faz
    console.log('4. Simulando exatamente o frontend...');

    try {
      const response = await simulateUpdateProjectCSV(
        projectId,
        csvBuffer,
        token
      );

      console.log('\n📋 RESPOSTA RECEBIDA:');
      console.log('response:', response);
      console.log('response.status:', response.status);
      console.log('typeof response.status:', typeof response.status);

      // Simular exatamente a condição do frontend
      if (response.status === 'success') {
        console.log('✅ FRONTEND: Condição PASSOU - Sucesso!');
        console.log(
          'Mensagem: "CSV atualizado com sucesso! Recarregando dados..."'
        );
      } else {
        console.log('❌ FRONTEND: Condição FALHOU');
        console.log(
          'Mensagem de erro:',
          'Erro ao atualizar CSV: ' + (response.message || 'Erro desconhecido')
        );
      }
    } catch (uploadError) {
      console.log('\n❌ ERRO CAPTURADO (catch block):');
      console.log('error:', uploadError.message);
      console.log('error.response:', uploadError.response);

      // Simular exatamente o catch do frontend
      const errorMessage =
        'Erro ao enviar arquivo: ' +
        (uploadError.response?.data?.message ||
          uploadError.message ||
          'Erro desconhecido');
      console.log('Mensagem que seria exibida:', errorMessage);
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testExactFrontendFlow();
