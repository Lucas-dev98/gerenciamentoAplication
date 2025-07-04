const mongoose = require('mongoose');

// Schema do projeto (copiado do backend)
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: 'active' },
    priority: { type: String, default: 'medium' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    activities: [
      {
        name: String,
        type: { type: String, enum: ['parada', 'manutencao', 'partida'] },
        progress: { type: Number, default: 0 },
        baseline: { type: Number, default: 0 },
        subActivities: [
          {
            name: String,
            progress: { type: Number, default: 0 },
            baseline: { type: Number, default: 0 },
          },
        ],
        order: { type: Number, default: 0 },
      },
    ],
    metadata: {
      csvImport: { type: Boolean, default: false },
      processedAt: Date,
      statistics: {
        totalActivities: { type: Number, default: 0 },
        completedActivities: { type: Number, default: 0 },
        averageProgress: { type: Number, default: 0 },
      },
    },
  },
  { collection: 'projects' }
);

const Project = mongoose.model('Project', projectSchema);

async function createTestProjects() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(
      'mongodb://admin:epugestao123@localhost:27017/epu_gestao?authSource=admin',
      {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }
    );

    console.log('✅ Conectado ao MongoDB');

    // Limpar projetos existentes
    await Project.deleteMany({});
    console.log('🧹 Projetos antigos removidos');

    // Criar projetos de teste
    const testProjects = [
      {
        name: 'Projeto Alpha',
        description:
          'Projeto de teste para validar estatísticas - Status Ativo',
        status: 'active',
        priority: 'high',
        progress: 75,
        activities: [
          {
            name: 'Atividade 1',
            type: 'parada',
            progress: 80,
            baseline: 75,
            order: 1,
          },
          {
            name: 'Atividade 2',
            type: 'manutencao',
            progress: 70,
            baseline: 65,
            order: 2,
          },
        ],
        metadata: {
          csvImport: false,
          statistics: {
            totalActivities: 2,
            completedActivities: 1,
            averageProgress: 75,
          },
        },
      },
      {
        name: 'Projeto Beta',
        description: 'Projeto de teste - Status Pausado',
        status: 'paused',
        priority: 'medium',
        progress: 45,
        activities: [
          {
            name: 'Atividade 1',
            type: 'partida',
            progress: 45,
            baseline: 50,
            order: 1,
          },
        ],
        metadata: {
          csvImport: false,
          statistics: {
            totalActivities: 1,
            completedActivities: 0,
            averageProgress: 45,
          },
        },
      },
      {
        name: 'Projeto Gamma',
        description: 'Projeto de teste - Status Concluído',
        status: 'completed',
        priority: 'low',
        progress: 100,
        activities: [
          {
            name: 'Atividade Final',
            type: 'parada',
            progress: 100,
            baseline: 100,
            order: 1,
          },
        ],
        metadata: {
          csvImport: false,
          statistics: {
            totalActivities: 1,
            completedActivities: 1,
            averageProgress: 100,
          },
        },
      },
    ];

    for (const projectData of testProjects) {
      const project = new Project(projectData);
      await project.save();
      console.log(`✅ Projeto criado: ${project.name}`);
    }

    console.log('🎉 Todos os projetos de teste foram criados com sucesso!');

    // Verificar estatísticas
    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          pausedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          highPriorityCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
          },
          mediumPriorityCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] },
          },
          lowPriorityCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] },
          },
          averageProgress: { $avg: '$progress' },
        },
      },
    ]);

    console.log('📊 Estatísticas criadas:', JSON.stringify(stats[0], null, 2));
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado do MongoDB');
  }
}

createTestProjects();
