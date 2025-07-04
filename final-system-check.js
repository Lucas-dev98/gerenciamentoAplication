/**
 * Verificação Final do Sistema EPU-Gestão
 * Teste rápido após correção do CSV
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function finalSystemCheck() {
  console.log('🔍 VERIFICAÇÃO FINAL DO SISTEMA EPU-Gestão');
  console.log('===========================================\n');

  try {
    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    });
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Autenticação: OK');

    // 2. Saúde do backend
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(
      `✅ Backend: ${healthResponse.data.status} (v${healthResponse.data.version})`
    );

    // 3. Projetos
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers,
    });
    const projectCount = projectsResponse.data.data?.data?.length || 0;
    console.log(`✅ Projetos: ${projectCount} encontrados`);

    // 4. Equipes
    const teamsResponse = await axios.get(`${BASE_URL}/api/teams`, { headers });
    const teamCount = teamsResponse.data.data?.length || 0;
    console.log(`✅ Equipes: ${teamCount} encontradas`);

    // 5. Frontend
    const frontendResponse = await axios.get('http://localhost:3000');
    console.log('✅ Frontend: Acessível');

    // 6. Upload CSV (principal correção)
    const FormData = require('form-data');
    const fs = require('fs');

    const csvContent =
      'name,description,type\nVerificação Final,Teste pós-correção,desenvolvimento';
    fs.writeFileSync('final-check.csv', csvContent);

    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream('final-check.csv'));
    formData.append('projectName', 'Verificação Final');

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/projects/import-csv`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fs.unlinkSync('final-check.csv');
    console.log('✅ Upload CSV: FUNCIONANDO (problema resolvido!)');

    console.log('\n🎉 SISTEMA 100% OPERACIONAL');
    console.log('============================');
    console.log('📊 Status: Todos os componentes funcionando');
    console.log('🔧 Correção CSV: Aplicada com sucesso');
    console.log('🚀 Sistema pronto para uso!');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data?.message || error.message);
  }
}

finalSystemCheck();
