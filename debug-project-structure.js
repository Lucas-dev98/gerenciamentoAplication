const mongoose = require('./backend/node_modules/mongoose');
const Project = require('./backend/src/models/projectModels');

async function debugProjectData() {
  try {
    // Conectar ao banco
    await mongoose.connect('mongodb://localhost:27017/project_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Conectado ao MongoDB');

    // Buscar todos os projetos
    const projects = await Project.find({}).sort({ createdAt: -1 }).limit(5);

    console.log(`\n📊 Total de projetos: ${projects.length}\n`);

    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name}`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Criado em: ${project.createdAt}`);
      console.log(
        `   Atividades: ${project.activities ? project.activities.length : 0}`
      );

      if (project.activities && project.activities.length > 0) {
        console.log('   📋 Primeiras 3 atividades:');
        project.activities.slice(0, 3).forEach((activity, index) => {
          console.log(
            `      ${index + 1}. ${activity.name || activity.title || 'Sem nome'}`
          );
          console.log(`         Tipo: ${activity.type || 'Não definido'}`);
          console.log(`         Progresso: ${activity.progress || 0}%`);
          console.log(
            `         Subatividades: ${activity.subactivities ? activity.subactivities.length : 0}`
          );
        });
      }

      if (project.metadata) {
        console.log(`   📊 Metadata:`);
        console.log(
          `      Total blocos: ${Object.keys(project.metadata).length}`
        );
        console.log(`      Tipos: ${Object.keys(project.metadata).join(', ')}`);
      }

      console.log('   ─────────────────────────────────\n');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

debugProjectData();
