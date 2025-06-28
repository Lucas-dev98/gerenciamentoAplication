const axios = require('axios');

async function debugProjectData() {
  try {
    console.log('🔍 Debug dos dados do projeto...');

    // Login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'upload@test.com',
        password: 'Password123!',
      }
    );

    const token = loginResponse.data.data?.token || loginResponse.data.token;

    if (!token) {
      console.log('❌ Token não encontrado');
      return;
    }

    // Buscar projeto específico
    const projectId = '685e9d074a4e70f2c97b865b';
    const projectResponse = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const project = projectResponse.data.data;
    console.log(`\n📊 Projeto: ${project.name}`);
    console.log(`📋 Total de atividades: ${project.activities?.length || 0}`);

    if (project.activities) {
      // Mostrar algumas atividades de exemplo
      const parada = project.activities.filter((a) => a.type === 'parada');

      console.log(`\n🔴 PROCEDIMENTO DE PARADA - Primeira atividade:`);
      if (parada[0]) {
        const activity = parada[0];
        console.log(`name: ${activity.name}`);
        console.log(`value: ${activity.progress}`);
        console.log(`baseline: ${activity.baseline}`);
        console.log(
          `sub_activities: ${activity.subActivities?.length || 0} itens`
        );

        if (activity.subActivities && activity.subActivities.length > 0) {
          console.log(`\nSubatividades:`);
          activity.subActivities.forEach((sub, idx) => {
            console.log(
              `  ${idx + 1}. ${sub.name}:${sub.progress}|${sub.baseline}`
            );
          });

          // Recriar formato CSV
          const csvSubActivities = activity.subActivities
            .map((sub) => `${sub.name}:${sub.progress}|${sub.baseline}`)
            .join('; ');

          console.log(`\n📄 Formato CSV recriado:`);
          console.log(
            `${activity.name},${activity.progress},${activity.baseline},${csvSubActivities}`
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

debugProjectData();
