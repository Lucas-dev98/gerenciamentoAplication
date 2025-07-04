// Final verification of all working endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const PROJECT_ID = '60d5ec49f1b2c8b1f8c4e456';

async function finalTest() {
  console.log('🎯 VERIFICAÇÃO FINAL DOS ENDPOINTS CORRIGIDOS\n');

  const endpoints = [
    { name: 'Health Check', url: `${BASE_URL}/api/test` },
    { name: 'Project List', url: `${BASE_URL}/api/projects` },
    {
      name: 'Procedimento Parada',
      url: `${BASE_URL}/api/projects/${PROJECT_ID}/procedimento-parada`,
    },
    {
      name: 'Manutenção',
      url: `${BASE_URL}/api/projects/${PROJECT_ID}/manutencao`,
    },
    {
      name: 'Procedimento Partida',
      url: `${BASE_URL}/api/projects/${PROJECT_ID}/procedimento-partida`,
    },
    {
      name: 'Frentes (CORRIGIDO)',
      url: `${BASE_URL}/api/projects/${PROJECT_ID}/frentes`,
    },
    {
      name: 'Statistics (CORRIGIDO)',
      url: `${BASE_URL}/api/projects/${PROJECT_ID}/statistics`,
    },
  ];

  let successCount = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url);
      const source = response.data.source || 'database';
      const dataCount = Array.isArray(response.data.data)
        ? response.data.data.length
        : typeof response.data.data === 'object'
          ? Object.keys(response.data.data).length
          : 1;

      console.log(`✅ ${endpoint.name}:`);
      console.log(
        `   Status: ${response.status} | Fonte: ${source} | Dados: ${dataCount} item(s)`
      );
      successCount++;
    } catch (error) {
      console.log(`❌ ${endpoint.name}:`);
      console.log(
        `   Erro: ${error.response?.status || 'Connection'} - ${error.response?.data?.message || error.message}`
      );
    }
  }

  console.log(
    `\n📊 RESULTADO: ${successCount}/${endpoints.length} endpoints funcionando`
  );

  if (successCount === endpoints.length) {
    console.log('🎉 TODOS OS ENDPOINTS ESTÃO FUNCIONANDO CORRETAMENTE!');
    console.log('✅ Sistema pronto para integração com frontend');
  } else {
    console.log('⚠️ Alguns endpoints ainda precisam de correção');
  }
}

finalTest().catch(console.error);
