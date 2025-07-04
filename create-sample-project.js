const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuração da conexão
const DB_URI =
  'mongodb://admin:epugestao123@localhost:27017/epu_gestao?authSource=admin';

// Schema do projeto
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: 'active' },
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
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'projects' }
);

const Project = mongoose.model('Project', projectSchema);

// Função para processar dados CSV
const processCSVData = (csvContent, activityType) => {
  const lines = csvContent.split('\n');
  const activities = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length >= 4) {
      const name = parts[0];
      const value = parts[1];
      const baseline = parts[2];
      const subActivitiesRaw = parts.slice(3).join(',');

      const subActivities = [];
      if (subActivitiesRaw) {
        const subParts = subActivitiesRaw.split(';');
        for (const sub of subParts) {
          const trimmed = sub.trim();
          if (trimmed) {
            const [subName, values] = trimmed.split(':');
            if (subName && values) {
              const [real, planejado] = values.split('|');
              subActivities.push({
                name: subName.trim(),
                progress: parseFloat(real?.replace(',', '.')) || 0,
                baseline: parseFloat(planejado?.replace(',', '.')) || 0,
              });
            }
          }
        }
      }

      activities.push({
        name: name.trim(),
        type: activityType,
        progress: parseFloat(value?.replace(',', '.')) || 0,
        baseline: parseFloat(baseline?.replace(',', '.')) || 0,
        subActivities: subActivities,
        order: activities.length,
      });
    }
  }

  return activities;
};

const importCSVData = async () => {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log('✅ Conectado com sucesso');

    // Carregar e processar os três CSVs
    const csvFiles = [
      { file: 'procedimento_parada.csv', type: 'parada' },
      { file: 'manutencao.csv', type: 'manutencao' },
      { file: 'procedimento_partida.csv', type: 'partida' },
    ];

    const allActivities = [];

    for (const { file, type } of csvFiles) {
      console.log(`\n📁 Processando ${file}...`);

      const filePath = path.join(
        __dirname,
        'backend',
        'src',
        'data',
        'csv',
        file
      );
      const csvContent = fs.readFileSync(filePath, 'utf8');

      const activities = processCSVData(csvContent, type);
      console.log(`✅ ${activities.length} atividades do tipo ${type}`);

      allActivities.push(...activities);
    }

    console.log(`\n📊 Total: ${allActivities.length} atividades`);

    // Calcular estatísticas
    const totalProgress = allActivities.reduce(
      (sum, act) => sum + act.progress,
      0
    );
    const averageProgress =
      allActivities.length > 0 ? totalProgress / allActivities.length : 0;

    // Criar projeto com todos os dados
    const projectData = {
      name: 'Projeto EPU - Dados Completos',
      description:
        'Projeto criado com dados dos três CSVs: procedimento de parada, manutenção e procedimento de partida',
      status: 'active',
      progress: Math.round(averageProgress),
      activities: allActivities,
      metadata: {
        csvImport: true,
        processedAt: new Date(),
      },
    };

    console.log('\n💾 Salvando projeto no banco...');
    const project = await Project.create(projectData);

    console.log(`🎉 Projeto criado com sucesso!`);
    console.log(`🆔 ID: ${project._id}`);
    console.log(`📈 Progresso geral: ${project.progress}%`);

    // Teste dos endpoints simulados
    console.log('\n🔍 Testando consultas...');

    const parada = project.activities.filter((act) => act.type === 'parada');
    const manutencao = project.activities.filter(
      (act) => act.type === 'manutencao'
    );
    const partida = project.activities.filter((act) => act.type === 'partida');

    console.log(`- Procedimento de Parada: ${parada.length} atividades`);
    console.log(`- Manutenção: ${manutencao.length} atividades`);
    console.log(`- Procedimento de Partida: ${partida.length} atividades`);

    await mongoose.connection.close();
    console.log('\n✅ Processo concluído com sucesso!');

    return project._id;
  } catch (error) {
    console.error('❌ Erro:', error);
    await mongoose.connection.close();
  }
};

importCSVData();
