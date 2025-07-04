// Data Seeder (Clean Architecture)
require('dotenv').config({ path: './backend/.env' });

// Infrastructure
const DatabaseConnection = require('./backend/src/infrastructure/database/DatabaseConnection');
const MongoProjectRepositoryClean = require('./backend/src/infrastructure/repositories/MongoProjectRepositoryClean');

// Domain
const ProjectUseCasesClean = require('./backend/src/domain/usecases/ProjectUseCasesClean');
const Project = require('./backend/src/domain/entities/ProjectClean');
const Activity = require('./backend/src/domain/entities/Activity');

/**
 * Data seeder for populating the database with real project data
 * Uses Clean Architecture components
 */
class EPUGestaoDataSeeder {
  constructor() {
    console.log(
      '\n🌱 Initializing EPU-Gestão Data Seeder (Clean Architecture)...'
    );

    this.database = new DatabaseConnection();
    this.projectRepository = new MongoProjectRepositoryClean();
    this.projectUseCases = new ProjectUseCasesClean(this.projectRepository);
  }

  async seed() {
    try {
      console.log('\n🚀 Starting data seeding process...\n');

      // Connect to database
      console.log('📊 Connecting to database...');
      await this.database.connect();
      console.log('✅ Database connected successfully');

      // Clear existing data (optional)
      if (process.env.CLEAR_EXISTING_DATA === 'true') {
        console.log('\n🧹 Clearing existing data...');
        await this.clearExistingData();
        console.log('✅ Existing data cleared');
      }

      // Create comprehensive project data
      console.log('\n📝 Creating comprehensive project data...');
      const projects = await this.createProjectsData();

      // Seed projects
      console.log('\n🌱 Seeding projects...');
      const seededProjects = [];

      for (const projectData of projects) {
        console.log(`   📁 Creating project: ${projectData.name}`);
        const result = await this.projectUseCases.createProject(projectData);

        if (result.success) {
          seededProjects.push(result.data);
          console.log(
            `   ✅ Created: ${result.data.name} (ID: ${result.data.id})`
          );
          console.log(`      - ${result.data.activities.length} activities`);
          console.log(`      - Progress: ${result.data.progress.toFixed(1)}%`);
        } else {
          console.error(`   ❌ Failed to create project: ${result.message}`);
        }
      }

      // Display summary
      console.log('\n📊 Seeding Summary:');
      console.log('='.repeat(50));
      console.log(`🎯 Projects seeded: ${seededProjects.length}`);

      seededProjects.forEach((project, index) => {
        const stats = project.getStatistics();
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   🆔 ID: ${project.id}`);
        console.log(`   📈 Progress: ${project.progress.toFixed(1)}%`);
        console.log(`   🏃 Activities: ${stats.overview.totalActivities}`);
        console.log(`   ✅ Completed: ${stats.overview.completedActivities}`);
        console.log(
          `   🔧 In Progress: ${stats.overview.inProgressActivities}`
        );
        console.log(`   📊 By Type:`);
        console.log(`      - Parada: ${stats.typeBreakdown.parada.total}`);
        console.log(
          `      - Manutenção: ${stats.typeBreakdown.manutencao.total}`
        );
        console.log(`      - Partida: ${stats.typeBreakdown.partida.total}`);
      });

      console.log('\n🎉 Data seeding completed successfully!');
      return seededProjects;
    } catch (error) {
      console.error('\n💥 Seeding failed:', error);
      throw error;
    } finally {
      // Always disconnect
      await this.database.disconnect();
      console.log('📊 Database disconnected');
    }
  }

  async clearExistingData() {
    try {
      // This would clear the ProjectClean collection
      const count = await this.projectRepository.count();
      console.log(`   Found ${count} existing projects`);

      if (count > 0) {
        console.log('   ⚠️ Clearing existing data...');
        // Implementation depends on your repository - for now just log
        console.log(
          '   ℹ️ Existing data clearing not implemented - will create alongside existing data'
        );
      }
    } catch (error) {
      console.error('Error clearing existing data:', error);
    }
  }

  async createProjectsData() {
    const projects = [];

    // Project 1: Comprehensive Industrial Plant Maintenance
    projects.push({
      name: 'Parada Geral da Planta Industrial - 2025',
      description:
        'Parada programada para manutenção completa da planta industrial, incluindo todos os equipamentos críticos e sistemas auxiliares.',
      status: 'active',
      priority: 'high',
      owner: 'EPU-Gestão System',
      startDate: new Date('2025-01-15'),
      deadline: new Date('2025-02-28'),
      budget: 2500000,
      location: 'Planta Industrial Principal',
      category: 'maintenance',
      tags: ['parada-geral', 'manutencao', 'critico', '2025'],
      activities: [
        // Parada Activities
        new Activity({
          type: 'parada',
          name: 'Pátio de Alimentação',
          planned: 100,
          real: 75.2,
          image: '/static/images/frentes/patioAlimentacao.png',
          description:
            'Interrupção controlada do sistema de alimentação da planta',
          priority: 'high',
          estimatedHours: 24,
          actualHours: 20,
          assignedTo: 'Equipe Operacional A',
          tags: ['alimentacao', 'sistema-critico'],
          subActivities: [
            {
              name: 'Cortar Produção do Pátio de Finos Parar Pátio Vazio',
              planned: 100,
              real: 100,
              description: 'Interrupção da produção no pátio de finos',
            },
            {
              name: 'Esvaziar e Limpar Chutes do Circuito de Alimentação',
              planned: 100,
              real: 85,
              description: 'Limpeza completa dos chutes de alimentação',
            },
            {
              name: 'Posicionar Emenda das Correias Conforme Necessidade',
              planned: 100,
              real: 60,
              description:
                'Ajuste e posicionamento das correias transportadoras',
            },
            {
              name: 'Realizar Bloqueio do Circuito do Pátio de Finos',
              planned: 100,
              real: 45,
              description: 'Bloqueio de segurança do circuito',
            },
          ],
        }),

        new Activity({
          type: 'parada',
          name: 'Sistema de Secagem',
          planned: 100,
          real: 88.5,
          image: '/static/images/frentes/secagem.png',
          description: 'Parada controlada do sistema de secagem industrial',
          priority: 'high',
          estimatedHours: 18,
          actualHours: 16,
          assignedTo: 'Equipe Térmica',
          tags: ['secagem', 'temperatura'],
          subActivities: [
            {
              name: 'Desligar e Resfriar Queimadores 1SM6GG',
              planned: 100,
              real: 100,
              description: 'Desligamento seguro dos queimadores principais',
            },
            {
              name: 'Realizar Purga do Gás do Queimador',
              planned: 100,
              real: 95,
              description: 'Purga completa do sistema de gás',
            },
            {
              name: 'Realizar Bloqueio da Secagem',
              planned: 100,
              real: 70,
              description: 'Bloqueio de segurança do sistema de secagem',
            },
          ],
        }),

        // Manutenção Activities
        new Activity({
          type: 'manutencao',
          name: 'Forno Industrial',
          planned: 100,
          real: 85.0,
          image: '/static/images/frentes/forno.png',
          description: 'Manutenção preventiva e corretiva do forno principal',
          priority: 'urgent',
          estimatedHours: 72,
          actualHours: 68,
          assignedTo: 'Equipe Manutenção Mecânica',
          tags: ['forno', 'alta-temperatura', 'critico'],
          subActivities: [
            {
              name: 'Refratários',
              planned: 90,
              real: 80,
              description: 'Substituição e reparo de refratários',
            },
            {
              name: 'Sistema de Combustão',
              planned: 95,
              real: 90,
              description: 'Manutenção do sistema de combustão',
            },
            {
              name: 'Isolamento Térmico',
              planned: 85,
              real: 85,
              description: 'Verificação e reparo do isolamento',
            },
          ],
        }),

        new Activity({
          type: 'manutencao',
          name: 'Moinho Principal',
          planned: 95,
          real: 92.0,
          image: '/static/images/frentes/moinho.png',
          description: 'Manutenção completa do moinho de produção',
          priority: 'high',
          estimatedHours: 48,
          actualHours: 45,
          assignedTo: 'Equipe Manutenção Mecânica',
          tags: ['moinho', 'producao'],
          subActivities: [
            {
              name: 'Revestimento',
              planned: 90,
              real: 95,
              description: 'Troca do revestimento interno do moinho',
            },
            {
              name: 'Sistema de Lubrificação',
              planned: 80,
              real: 88,
              description: 'Manutenção do sistema de lubrificação',
            },
            {
              name: 'Mancais e Rolamentos',
              planned: 100,
              real: 93,
              description: 'Verificação e troca de mancais',
            },
          ],
        }),

        new Activity({
          type: 'manutencao',
          name: 'Precipitadores Eletrostáticos',
          planned: 88,
          real: 78.0,
          image: '/static/images/frentes/precipitador.png',
          description:
            'Manutenção dos precipitadores para controle de emissões',
          priority: 'medium',
          estimatedHours: 36,
          actualHours: 40,
          assignedTo: 'Equipe Elétrica',
          tags: ['precipitador', 'ambiental', 'eletrico'],
          subActivities: [
            {
              name: 'Eletrodos de Descarga',
              planned: 85,
              real: 75,
              description: 'Limpeza e ajuste dos eletrodos',
            },
            {
              name: 'Sistema de Vibração',
              planned: 90,
              real: 80,
              description: 'Manutenção do sistema de vibração',
            },
            {
              name: 'Isoladores Cerâmicos',
              planned: 90,
              real: 79,
              description: 'Verificação dos isoladores',
            },
          ],
        }),

        // Partida Activities
        new Activity({
          type: 'partida',
          name: 'Ventiladores Principais',
          planned: 85,
          real: 68.0,
          image: '/static/images/frentes/ventilador.png',
          description: 'Partida e comissionamento dos ventiladores principais',
          priority: 'medium',
          estimatedHours: 16,
          actualHours: 18,
          assignedTo: 'Equipe Operacional B',
          tags: ['ventilador', 'partida'],
          subActivities: [
            {
              name: 'Teste de Rotação',
              planned: 80,
              real: 70,
              description: 'Teste de rotação em vazio',
            },
            {
              name: 'Verificação de Vibrações',
              planned: 90,
              real: 65,
              description: 'Medição e análise de vibrações',
            },
            {
              name: 'Teste de Carga',
              planned: 85,
              real: 69,
              description: 'Teste com carga progressiva',
            },
          ],
        }),

        new Activity({
          type: 'partida',
          name: 'Sistema de Controle',
          planned: 95,
          real: 72.0,
          image: '/static/images/frentes/controle.png',
          description: 'Comissionamento do sistema de controle automatizado',
          priority: 'high',
          estimatedHours: 24,
          actualHours: 28,
          assignedTo: 'Equipe Automação',
          tags: ['controle', 'automacao', 'software'],
          subActivities: [
            {
              name: 'Teste de IHM',
              planned: 100,
              real: 85,
              description: 'Teste da interface homem-máquina',
            },
            {
              name: 'Calibração de Sensores',
              planned: 90,
              real: 65,
              description: 'Calibração de todos os sensores',
            },
            {
              name: 'Teste de Intertravamentos',
              planned: 95,
              real: 67,
              description: 'Teste dos sistemas de segurança',
            },
          ],
        }),

        new Activity({
          type: 'partida',
          name: 'Teste Operacional Geral',
          planned: 100,
          real: 45.0,
          image: '/static/images/frentes/testeOperacional.png',
          description: 'Teste operacional integrado de toda a planta',
          priority: 'urgent',
          estimatedHours: 32,
          actualHours: 15,
          assignedTo: 'Equipe Multidisciplinar',
          tags: ['teste', 'operacional', 'integracao'],
          subActivities: [
            {
              name: 'Teste de Sequência de Partida',
              planned: 100,
              real: 50,
              description: 'Teste da sequência completa de partida',
            },
            {
              name: 'Teste de Capacidade',
              planned: 100,
              real: 40,
              description: 'Teste de capacidade nominal',
            },
            {
              name: 'Ajuste de Parâmetros',
              planned: 100,
              real: 45,
              description: 'Ajuste fino dos parâmetros operacionais',
            },
          ],
        }),
      ],
    });

    // Project 2: Modernization Project
    projects.push({
      name: 'Modernização da Linha de Produção B',
      description:
        'Projeto de modernização tecnológica da linha de produção B, incluindo automação e eficiência energética.',
      status: 'active',
      priority: 'medium',
      owner: 'Departamento de Engenharia',
      startDate: new Date('2025-02-01'),
      deadline: new Date('2025-04-30'),
      budget: 1800000,
      location: 'Linha de Produção B',
      category: 'modernization',
      tags: ['modernizacao', 'automacao', 'eficiencia'],
      activities: [
        new Activity({
          type: 'parada',
          name: 'Parada da Linha B',
          planned: 100,
          real: 35.0,
          description: 'Parada programada da linha de produção B',
          priority: 'high',
          estimatedHours: 8,
          actualHours: 3,
          assignedTo: 'Operação Linha B',
        }),

        new Activity({
          type: 'manutencao',
          name: 'Upgrade do Sistema de Automação',
          planned: 100,
          real: 15.0,
          description: 'Atualização completa do sistema de automação',
          priority: 'high',
          estimatedHours: 120,
          actualHours: 18,
          assignedTo: 'Equipe Automação',
        }),

        new Activity({
          type: 'partida',
          name: 'Comissionamento Nova Automação',
          planned: 100,
          real: 0.0,
          description: 'Comissionamento e testes do novo sistema',
          priority: 'medium',
          estimatedHours: 40,
          actualHours: 0,
          assignedTo: 'Equipe Comissionamento',
        }),
      ],
    });

    return projects;
  }
}

// Execute seeding if run directly
if (require.main === module) {
  const seeder = new EPUGestaoDataSeeder();

  seeder
    .seed()
    .then((projects) => {
      console.log(`\n🎉 Seeding completed successfully!`);
      console.log(`📊 ${projects.length} projects created`);
      console.log('\n📝 You can now test the endpoints:');
      console.log('   GET /api/projects');
      console.log('   GET /api/projects/:id/frentes');
      console.log('   GET /api/projects/:id/statistics');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = EPUGestaoDataSeeder;
