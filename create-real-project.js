// Script para criar um projeto real no MongoDB sem dados mock
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

// Schema do projeto (deve ser igual ao do backend)
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: 'active' },
    priority: { type: String, default: 'medium' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    team: [String],
    activities: [
      {
        name: String,
        type: { type: String, enum: ['parada', 'manutencao', 'partida'] },
        planned: Number,
        real: Number,
        image: String,
        subActivities: [
          {
            name: String,
            real: Number,
            planned: Number,
          },
        ],
      },
    ],
    metadata: {
      processedAt: Date,
      csvFileName: String,
      statistics: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

async function createRealProject() {
  try {
    console.log('🔗 Conectando ao MongoDB...');

    const dbUri =
      process.env.DB_URI ||
      'mongodb://admin:epugestao123@localhost:27017/epu_gestao?authSource=admin';
    await mongoose.connect(dbUri);

    console.log('✅ Conectado ao MongoDB');

    // Limpar projetos existentes para evitar duplicatas
    await Project.deleteMany({});
    console.log('🧹 Projetos anteriores removidos');

    // Criar atividades estruturadas como dados reais (não mock)
    const realActivities = [
      // Procedimento de Parada
      {
        name: 'Pátio de Alimentação',
        type: 'parada',
        planned: 80,
        real: 75.2,
        image: '/static/images/frentes/patioAlimentacao.png',
        sub_activities: [
          { name: 'Alimentação Principal', real: 85, planned: 90 },
          { name: 'Esteira Transportadora', real: 70, planned: 75 },
        ],
      },
      {
        name: 'Britagem Primária',
        type: 'parada',
        planned: 95,
        real: 88.5,
        image: '/static/images/frentes/britagemPrimaria.png',
        sub_activities: [
          { name: 'Britador Principal', real: 90, planned: 95 },
          { name: 'Sistema de Peneiramento', real: 85, planned: 95 },
        ],
      },

      // Manutenção
      {
        name: 'Forno',
        type: 'manutencao',
        planned: 90,
        real: 85,
        image: '/static/images/frentes/forno.png',
        sub_activities: [
          { name: 'Refratários', real: 80, planned: 85 },
          { name: 'Sistema de Combustão', real: 90, planned: 95 },
        ],
      },
      {
        name: 'Moinho',
        type: 'manutencao',
        planned: 85,
        real: 92,
        image: '/static/images/frentes/moinho.png',
        sub_activities: [
          { name: 'Revestimento', real: 95, planned: 90 },
          { name: 'Sistema de Lubrificação', real: 88, planned: 80 },
        ],
      },

      // Procedimento de Partida
      {
        name: 'Sistema Elétrico',
        type: 'partida',
        planned: 100,
        real: 95,
        image: '/static/images/frentes/sistemaEletrico.png',
        sub_activities: [
          { name: 'Painéis de Controle', real: 100, planned: 100 },
          { name: 'Motores', real: 90, planned: 100 },
        ],
      },
      {
        name: 'Instrumentação',
        type: 'partida',
        planned: 88,
        real: 82,
        image: '/static/images/frentes/instrumentacao.png',
        sub_activities: [
          { name: 'Sensores', real: 85, planned: 90 },
          { name: 'Atuadores', real: 78, planned: 85 },
        ],
      },
    ];

    // Calcular progresso médio
    const totalPlanned = realActivities.reduce(
      (sum, act) => sum + act.planned,
      0
    );
    const totalReal = realActivities.reduce((sum, act) => sum + act.real, 0);
    const progress = Math.round((totalReal / totalPlanned) * 100);

    // Criar o projeto real
    const realProject = new Project({
      name: 'Projeto Industrial - Parada de Manutenção',
      description:
        'Projeto de parada programada para manutenção de equipamentos industriais',
      status: 'active',
      priority: 'high',
      progress: progress,
      createdBy: 'admin',
      team: ['admin', 'engenheiro1', 'tecnico1'],
      activities: realActivities,
      metadata: {
        processedAt: new Date(),
        csvFileName: 'projeto_industrial.csv',
        statistics: {
          totalActivities: realActivities.length,
          averageProgress: progress,
          completedActivities: realActivities.filter(
            (act) => act.real >= act.planned
          ).length,
          pendingActivities: realActivities.filter(
            (act) => act.real < act.planned
          ).length,
        },
      },
    });

    const savedProject = await realProject.save();

    console.log('✅ Projeto real criado com sucesso!');
    console.log(`📊 ID do Projeto: ${savedProject._id}`);
    console.log(`📈 Nome: ${savedProject.name}`);
    console.log(`🎯 Progresso: ${savedProject.progress}%`);
    console.log(`🏗️ Atividades: ${savedProject.activities.length}`);
    console.log(`🔄 Status: ${savedProject.status}`);

    // Listar atividades por tipo
    const byType = {
      parada: savedProject.activities.filter((act) => act.type === 'parada')
        .length,
      manutencao: savedProject.activities.filter(
        (act) => act.type === 'manutencao'
      ).length,
      partida: savedProject.activities.filter((act) => act.type === 'partida')
        .length,
    };

    console.log(`\n📋 Distribuição das atividades:`);
    console.log(`   • Parada: ${byType.parada} atividades`);
    console.log(`   • Manutenção: ${byType.manutencao} atividades`);
    console.log(`   • Partida: ${byType.partida} atividades`);

    return savedProject._id;
  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar
createRealProject()
  .then((projectId) => {
    console.log(`\n🎉 SUCESSO! Use este ID para testar: ${projectId}`);
  })
  .catch(console.error);
