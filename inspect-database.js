const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('./backend/node_modules/mongoose');
const Project = require('./backend/src/models/projectModels');

async function inspectDatabase() {
  try {
    console.log('🔍 Inspecionando banco de dados...\n');

    // Conectar ao MongoDB (vai usar o in-memory se não encontrar local)
    let mongoUri = 'mongodb://localhost:27017/project_management_test';

    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Conectado ao MongoDB local');
    } catch (error) {
      console.log('⚠️ MongoDB local não disponível, usando memória...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Conectado ao MongoDB em memória');
    }

    // Buscar todos os projetos
    const projects = await Project.find({}).sort({ createdAt: -1 }).limit(5);

    console.log(`📊 Projetos encontrados: ${projects.length}\n`);

    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name}`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Progresso: ${project.progress}%`);
      console.log(`   Criado: ${project.createdAt}`);

      // Verificar activities
      if (project.activities && project.activities.length > 0) {
        console.log(
          `   ✅ Activities: ${project.activities.length} encontradas`
        );
        console.log('   📋 Primeiras 3 atividades:');
        project.activities.slice(0, 3).forEach((activity, index) => {
          console.log(`      ${index + 1}. ${activity.name || 'Sem nome'}`);
          console.log(`         Tipo: ${activity.type || 'N/A'}`);
          console.log(`         Progresso: ${activity.progress || 0}%`);
          console.log(
            `         Subatividades: ${activity.subActivities?.length || 0}`
          );
        });
      } else {
        console.log('   ❌ Activities: Nenhuma encontrada');
      }

      // Verificar metadata
      if (project.metadata) {
        console.log('   ✅ Metadata: Presente');
        console.log(`      CSV Import: ${project.metadata.csvImport}`);
        if (project.metadata.blocos) {
          console.log(
            `      Blocos: ${JSON.stringify(project.metadata.blocos)}`
          );
        }
        if (project.metadata.estatisticas) {
          console.log(
            `      Total Atividades: ${project.metadata.estatisticas.totalAtividades}`
          );
        }
      } else {
        console.log('   ❌ Metadata: Ausente');
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

inspectDatabase();
