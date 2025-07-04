const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_PROJECT_ID = '60d5ec49f1b2c8b1f8c4e456'; // Mock project ID

async function testEndpoints() {
  console.log('🔧 Testando endpoints corrigidos...\n');

  const endpoints = [
    `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/frentes`,
    `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/statistics`,
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testando: ${endpoint}`);
      const response = await axios.get(endpoint);

      console.log(`✅ Status: ${response.status}`);
      console.log(
        `📊 Fonte dos dados: ${response.data.source || 'não especificada'}`
      );
      console.log(`📝 Resposta:`, JSON.stringify(response.data, null, 2));
      console.log('─'.repeat(50));
    } catch (error) {
      console.log(`❌ Erro: ${error.response?.status || 'Connection'}`);
      console.log(
        `📝 Mensagem: ${error.response?.data?.message || error.message}`
      );
      console.log('─'.repeat(50));
    }
  }
}

// Verificar se servidor está rodando primeiro
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/api/test`);
    console.log('✅ Servidor está rodando\n');
    return true;
  } catch (error) {
    console.log('❌ Servidor não está respondendo');
    console.log('💡 Execute: cd backend && node epu-backend-complete.js\n');
    return false;
  }
}

async function main() {
  console.log('🚀 Teste dos endpoints corrigidos\n');

  const serverRunning = await checkServer();
  if (serverRunning) {
    await testEndpoints();
  }
}

main().catch(console.error);
