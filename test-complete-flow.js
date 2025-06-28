const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCompleteUploadFlow() {
  try {
    console.log('🧪 Teste completo: Upload CSV + Consulta detalhes\n');

    // 1. Login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');

    // 2. Upload CSV
    const formData = new FormData();
    formData.append(
      'csvFile',
      fs.createReadStream(
        './backend/src/data/Project/250619 - Report - PFBT1.csv'
      )
    );
    formData.append('projectName', 'Teste Flow Completo Debug');

    console.log('📤 Fazendo upload do CSV...');
    const uploadResponse = await axios.post(
      'http://localhost:5000/api/projects/upload-csv',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log('✅ Upload concluído');
    console.log('📊 Resposta do upload:');
    console.log('   Status:', uploadResponse.data.status);
    console.log('   Projeto ID:', uploadResponse.data.data.project.id);
    console.log('   Nome:', uploadResponse.data.data.project.name);
    console.log(
      '   Atividades:',
      uploadResponse.data.data.project.activities?.length || 'não informado'
    );
    console.log(
      '   Metadata:',
      uploadResponse.data.data.project.metadata ? 'presente' : 'ausente'
    );

    const projectId = uploadResponse.data.data.project.id;

    // 3. Aguardar para garantir persistência
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. Consultar detalhes do projeto recém-criado
    console.log('\n🔍 Consultando detalhes do projeto recém-criado...');
    const detailsResponse = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Detalhes obtidos');
    console.log('📋 Dados retornados:');
    const project = detailsResponse.data.data.project;
    console.log('   Nome:', project.name);
    console.log('   Atividades:', project.activities?.length || 0);
    console.log('   Metadata presente:', project.metadata ? 'sim' : 'não');

    if (project.activities && project.activities.length > 0) {
      console.log('\n🎯 Primeiras 3 atividades:');
      project.activities.slice(0, 3).forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name || 'Sem nome'}`);
        console.log(`      Tipo: ${activity.type || 'N/A'}`);
        console.log(`      Progresso: ${activity.progress || 0}%`);
        console.log(
          `      Subatividades: ${activity.subActivities?.length || 0}`
        );
      });
    } else {
      console.log('❌ PROBLEMA: Nenhuma atividade encontrada!');
    }

    if (project.metadata) {
      console.log('\n📊 Metadata:');
      console.log('   CSV Import:', project.metadata.csvImport);
      console.log('   Blocos:', project.metadata.blocos);
      console.log('   Estatísticas:', project.metadata.estatisticas);
    } else {
      console.log('❌ PROBLEMA: Metadata não encontrada!');
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCompleteUploadFlow();
