/**
 * Teste das Estatísticas de Projetos
 * Para verificar a estrutura de dados retornada
 */

const axios = require('axios');

async function testProjectStats() {
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Buscar estatísticas
    console.log('📊 Buscando estatísticas dos projetos...\n');
    
    const statsResponse = await axios.get(
      'http://localhost:5000/api/projects/statistics',
      { headers }
    );

    console.log('✅ Resposta das estatísticas:');
    console.log(JSON.stringify(statsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testProjectStats();
