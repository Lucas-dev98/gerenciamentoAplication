const axios = require('axio    console.log(`📊 Total de projetos: ${projectsResponse.data.data?.projects?.length || 0}`);
    
    if (projectsResponse.data.data?.projects && projectsResponse.data.data.projects.length > 0) {
      const project = projectsResponse.data.data.projects[0]; // Pegar o primeiro projeto

async function testProjectDetails() {
  try {
    console.log('🔍 Testando detalhes do projeto...');
    
    // Login para obter token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'csvtest@example.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login realizado');
    console.log('🔑 Token:', token ? 'Disponível' : 'Não encontrado');
    
    if (!token) {
      console.log('📄 Resposta do login:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    
    // Buscar projetos
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`� Resposta completa:`, JSON.stringify(projectsResponse.data, null, 2));
    console.log(`�📊 Total de projetos: ${projectsResponse.data.data?.length || 0}`);
    
    if (projectsResponse.data.data && projectsResponse.data.data.length > 0) {
      const project = projectsResponse.data.data[0]; // Pegar o primeiro projeto
      console.log(`\n🎯 Projeto: ${project.name}`);
      console.log(`📈 Progresso: ${project.progress}%`);
      console.log(`📋 Total de atividades: ${project.activities?.length || 0}`);
      
      if (project.activities) {
        // Contar atividades por tipo
        const parada = project.activities.filter(a => a.type === 'parada');
        const manutencao = project.activities.filter(a => a.type === 'manutencao');
        const partida = project.activities.filter(a => a.type === 'partida');
        
        console.log(`\n📊 Distribuição de atividades:`);
        console.log(`   🔴 Parada: ${parada.length} atividades`);
        console.log(`   🟡 Manutenção: ${manutencao.length} atividades`);
        console.log(`   🟢 Partida: ${partida.length} atividades`);
        
        // Mostrar algumas atividades de exemplo
        console.log(`\n📝 Exemplos de atividades:`);
        
        if (parada.length > 0) {
          console.log(`\n🔴 PARADA - "${parada[0].name}"`);
          console.log(`   Progresso: ${parada[0].progress}% | Baseline: ${parada[0].baseline}%`);
          if (parada[0].subActivities && parada[0].subActivities.length > 0) {
            console.log(`   Subatividades (${parada[0].subActivities.length}):`);
            parada[0].subActivities.slice(0, 3).forEach(sub => {
              console.log(`     - ${sub.name}: ${sub.progress}%/${sub.baseline}%`);
            });
          }
        }
        
        if (manutencao.length > 0) {
          console.log(`\n🟡 MANUTENÇÃO - "${manutencao[0].name}"`);
          console.log(`   Progresso: ${manutencao[0].progress}% | Baseline: ${manutencao[0].baseline}%`);
          if (manutencao[0].subActivities && manutencao[0].subActivities.length > 0) {
            console.log(`   Subatividades (${manutencao[0].subActivities.length}):`);
            manutencao[0].subActivities.slice(0, 3).forEach(sub => {
              console.log(`     - ${sub.name}: ${sub.progress}%/${sub.baseline}%`);
            });
          }
        }
        
        if (partida.length > 0) {
          console.log(`\n🟢 PARTIDA - "${partida[0].name}"`);
          console.log(`   Progresso: ${partida[0].progress}% | Baseline: ${partida[0].baseline}%`);
          if (partida[0].subActivities && partida[0].subActivities.length > 0) {
            console.log(`   Subatividades (${partida[0].subActivities.length}):`);
            partida[0].subActivities.slice(0, 3).forEach(sub => {
              console.log(`     - ${sub.name}: ${sub.progress}%/${sub.baseline}%`);
            });
          }
        }
      }
      
      console.log(`\n🔗 Acesse: http://localhost:3000/projetos/${project._id}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testProjectDetails();
