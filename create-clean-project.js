// Script to create real project data using Clean Architecture
require('dotenv').config({ path: './backend/.env' });

// Infrastructure
const DatabaseConnection = require('./backend/src/infrastructure/database/DatabaseConnection');
const MongoProjectRepository = require('./backend/src/infrastructure/repositories/MongoProjectRepository');

// Domain
const ProjectUseCases = require('./backend/src/domain/usecases/ProjectUseCases');
const Project = require('./backend/src/domain/entities/Project');
const Activity = require('./backend/src/domain/entities/Activity');

class ProjectDataSeeder {
  constructor() {
    this.database = new DatabaseConnection();
    this.projectRepository = new MongoProjectRepository();
    this.projectUseCases = new ProjectUseCases(this.projectRepository);
  }

  async seed() {
    try {
      console.log('🌱 Starting Project Data Seeding...');

      // Connect to database
      const connected = await this.database.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }

      // Create sample activities
      const activities = this.createSampleActivities();

      // Create project data
      const projectData = {
        name: 'Projeto Industrial - Clean Architecture',
        description:
          'Projeto demonstrativo usando Clean Architecture e Clean Code',
        status: 'active',
        priority: 'high',
        activities: activities,
        metadata: {
          csvFile: 'clean_architecture_project.csv',
          processedAt: new Date(),
          totalRows: activities.length,
          statistics: {
            totalProgress: 0, // Will be calculated
            completedActivities: 0,
            pendingActivities: activities.length,
          },
        },
      };

      // Create project using use cases
      const result = await this.projectUseCases.createProject(projectData);

      if (result.success) {
        console.log('✅ Project created successfully!');
        console.log(`📊 Project ID: ${result.data.id}`);
        console.log(`📈 Project Name: ${result.data.name}`);
        console.log(`🏗️ Activities: ${result.data.activities.length}`);
        console.log(`📊 Progress: ${result.data.progress.toFixed(1)}%`);

        // Show activities breakdown
        const parada = result.data.activities.filter(
          (a) => a.type === 'parada'
        ).length;
        const manutencao = result.data.activities.filter(
          (a) => a.type === 'manutencao'
        ).length;
        const partida = result.data.activities.filter(
          (a) => a.type === 'partida'
        ).length;

        console.log('\n📋 Activities Breakdown:');
        console.log(`   • Parada: ${parada} activities`);
        console.log(`   • Manutenção: ${manutencao} activities`);
        console.log(`   • Partida: ${partida} activities`);

        console.log('\n🔗 Test URLs:');
        console.log(
          `   • Project Details: http://localhost:5000/api/projects/${result.data.id}`
        );
        console.log(
          `   • Frentes: http://localhost:5000/api/projects/${result.data.id}/frentes`
        );
        console.log(
          `   • Statistics: http://localhost:5000/api/projects/${result.data.id}/statistics`
        );

        return result.data.id;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await this.database.disconnect();
    }
  }

  createSampleActivities() {
    return [
      // Parada Activities
      new Activity({
        type: 'parada',
        name: 'Sistema de Alimentação Principal',
        planned: 85,
        real: 78,
        image: '/static/images/frentes/alimentacao.png',
        subActivities: [
          { name: 'Transportador Principal', planned: 90, real: 85 },
          { name: 'Sistema de Pesagem', planned: 80, real: 72 },
          { name: 'Controle de Fluxo', planned: 85, real: 77 },
        ],
      }),

      new Activity({
        type: 'parada',
        name: 'Britagem e Moagem',
        planned: 92,
        real: 88,
        image: '/static/images/frentes/britagem.png',
        subActivities: [
          { name: 'Britador Primário', planned: 95, real: 90 },
          { name: 'Britador Secundário', planned: 90, real: 85 },
          { name: 'Peneiramento', planned: 88, real: 85 },
        ],
      }),

      new Activity({
        type: 'parada',
        name: 'Sistema de Transporte',
        planned: 75,
        real: 82,
        image: '/static/images/frentes/transporte.png',
        subActivities: [
          { name: 'Correias Transportadoras', planned: 80, real: 85 },
          { name: 'Elevadores de Caçamba', planned: 70, real: 78 },
        ],
      }),

      // Manutenção Activities
      new Activity({
        type: 'manutencao',
        name: 'Forno de Clinquerização',
        planned: 88,
        real: 92,
        image: '/static/images/frentes/forno.png',
        subActivities: [
          { name: 'Revestimento Refratário', planned: 85, real: 90 },
          { name: 'Sistema de Queima', planned: 90, real: 95 },
          { name: 'Resfriador de Clinquer', planned: 90, real: 90 },
        ],
      }),

      new Activity({
        type: 'manutencao',
        name: 'Moinho de Cimento',
        planned: 82,
        real: 87,
        image: '/static/images/frentes/moinho_cimento.png',
        subActivities: [
          { name: 'Revestimento Interno', planned: 80, real: 85 },
          { name: 'Sistema de Ventilação', planned: 85, real: 90 },
          { name: 'Separador Dinâmico', planned: 80, real: 85 },
        ],
      }),

      new Activity({
        type: 'manutencao',
        name: 'Sistemas Auxiliares',
        planned: 90,
        real: 85,
        image: '/static/images/frentes/auxiliares.png',
        subActivities: [
          { name: 'Compressores de Ar', planned: 92, real: 88 },
          { name: 'Sistema Hidráulico', planned: 88, real: 82 },
        ],
      }),

      // Partida Activities
      new Activity({
        type: 'partida',
        name: 'Sistema Elétrico Geral',
        planned: 95,
        real: 98,
        image: '/static/images/frentes/eletrico.png',
        subActivities: [
          { name: 'Painéis de Comando', planned: 100, real: 100 },
          { name: 'Motores e Drives', planned: 90, real: 95 },
          { name: 'Sistema de Proteção', planned: 95, real: 100 },
        ],
      }),

      new Activity({
        type: 'partida',
        name: 'Automação e Controle',
        planned: 87,
        real: 90,
        image: '/static/images/frentes/automacao.png',
        subActivities: [
          { name: 'Sistema SCADA', planned: 85, real: 88 },
          { name: 'PLCs e Controladores', planned: 90, real: 93 },
          { name: 'Rede Industrial', planned: 85, real: 88 },
        ],
      }),

      new Activity({
        type: 'partida',
        name: 'Testes e Comissionamento Final',
        planned: 80,
        real: 75,
        image: '/static/images/frentes/testes.png',
        subActivities: [
          { name: 'Testes Integrados', planned: 85, real: 80 },
          { name: 'Calibração Final', planned: 75, real: 70 },
          { name: 'Documentação Técnica', planned: 80, real: 75 },
        ],
      }),
    ];
  }
}

// Execute seeding
if (require.main === module) {
  const seeder = new ProjectDataSeeder();
  seeder
    .seed()
    .then((projectId) => {
      console.log(`\n🎉 Seeding completed successfully!`);
      console.log(`📝 Project ID: ${projectId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = ProjectDataSeeder;
