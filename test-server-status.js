const axios = require('axios');

async function testServer() {
  try {
    console.log('🔍 Testando se o servidor está funcionando...\n');

    const response = await axios.get('http://localhost:5000/api/auth/profile', {
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Aceita qualquer status entre 200-499
      },
    });

    console.log('✅ Servidor está respondendo!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Servidor não está rodando ou não está acessível');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ Não foi possível resolver o hostname');
    } else {
      console.log('✅ Servidor está rodando (retornou erro esperado)');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
    }
  }
}

testServer();
