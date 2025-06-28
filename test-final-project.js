const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFinalProjectDetail() {
  try {
    console.log('🧪 Teste final - Frontend Project Detail...\n');

    // Login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'debug@example.com',
        password: 'DebugPass123!',
      }
    );
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');

    // Upload novo projeto
    const formData = new FormData();
    formData.append(
      'csvFile',
      fs.createReadStream(
        './backend/src/data/Project/250619 - Report - PFBT1.csv'
      )
    );
    formData.append('projectName', 'Segundo Projeto - Para Teste de Edição');

    console.log('📤 Fazendo upload...');
    const uploadResponse = await axios.post(
      'http://localhost:5000/api/projects/upload-csv',
      formData,
      {
        headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() },
      }
    );

    const projectId = uploadResponse.data.data.project.id;
    console.log(`✅ Projeto criado: ${projectId}`);

    // Buscar detalhes
    const detailsResponse = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const project = detailsResponse.data.data.project;
    console.log(`\n📊 Projeto: ${project.name}`);
    console.log(`Total de atividades: ${project.activities.length}`);

    // Separar por tipo
    const parada = project.activities.filter((a) => a.type === 'parada');
    const manutencao = project.activities.filter(
      (a) => a.type === 'manutencao'
    );
    const partida = project.activities.filter((a) => a.type === 'partida');

    console.log(`\n🔴 PROCEDIMENTO DE PARADA: ${parada.length} atividades`);
    console.log(`🟡 MANUTENÇÃO: ${manutencao.length} atividades`);
    console.log(`🟢 PROCEDIMENTO DE PARTIDA: ${partida.length} atividades`);

    // Mostrar atividades de PARTIDA (que correspondem ao CSV que você mostrou)
    console.log('\n🟢 DETALHES - PROCEDIMENTO DE PARTIDA:');
    partida.forEach((activity, index) => {
      console.log(`\n${index + 1}. ${activity.name}`);
      console.log(
        `   Progress: ${activity.progress}% | Baseline: ${activity.baseline}%`
      );
      console.log(`   Subatividades: ${activity.subActivities?.length || 0}`);

      if (activity.subActivities && activity.subActivities.length > 0) {
        activity.subActivities.slice(0, 3).forEach((sub, subIndex) => {
          console.log(`      ${subIndex + 1}. ${sub.name}`);
          console.log(
            `         Progress: ${sub.progress}% | Baseline: ${sub.baseline}%`
          );
        });
        if (activity.subActivities.length > 3) {
          console.log(
            `      ... e mais ${activity.subActivities.length - 3} subatividades`
          );
        }
      }
    });

    console.log(`\n🎯 ID do projeto para testar no frontend: ${projectId}`);
    console.log(
      `🌐 URL para acessar: http://localhost:3000/projetos/${projectId}`
    );
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFinalProjectDetail();
