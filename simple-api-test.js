// Teste simples da API sem auth
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🔄 Testando endpoint simples...');

    const response = await axios.get('http://localhost:3001/api/projects', {
      timeout: 5000,
    });

    console.log('✅ Resposta recebida:', response.data);
  } catch (error) {
    console.error('❌ Erro na requisição:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
};

testAPI();
