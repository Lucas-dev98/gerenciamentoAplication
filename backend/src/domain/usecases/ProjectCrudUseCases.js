const CsvProcessorService = require('../../infrastructure/services/CsvProcessorService');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

class ProjectCrudUseCases {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
    this.csvProcessor = new CsvProcessorService();
  }

  async getAllProjects() {
    return await this.projectRepository.findAll();
  }

  async getProjectById(id) {
    return await this.projectRepository.findById(id);
  }

  async createProject(projectData) {
    return await this.projectRepository.create(projectData);
  }

  async updateProject(id, projectData) {
    return await this.projectRepository.update(id, projectData);
  }

  async deleteProject(id) {
    return await this.projectRepository.delete(id);
  }

  async getProjectsByTeam(teamId) {
    return await this.projectRepository.findByTeam(teamId);
  }

  async getProjectStats() {
    const projects = await this.projectRepository.findAll();

    return {
      total: projects.length,
      completed: projects.filter((p) => p.status === 'completed').length,
      inProgress: projects.filter((p) => p.status === 'in_progress').length,
      notStarted: projects.filter((p) => p.status === 'not_started').length,
      overdue: projects.filter((p) => p.status === 'overdue').length,
    };
  }

  /**
   * Cria projeto a partir de arquivo CSV
   */
  async createProjectFromCsv(csvFilePath, projectMetadata) {
    try {
      console.log('🔄 Iniciando criação de projeto via CSV...');

      // Processa o CSV
      const processedActivities = await this.csvProcessor.processCsvToProject(
        csvFilePath,
        projectMetadata
      );

      // Cria o projeto com as atividades processadas
      const projectData = {
        name: projectMetadata.name || 'Projeto EPU',
        description:
          projectMetadata.description || 'Projeto criado via importação CSV',
        type: projectMetadata.type || 'epu',
        status: 'in_progress',
        priority: projectMetadata.priority || 'medium',
        startDate: projectMetadata.startDate || new Date(),
        endDate:
          projectMetadata.endDate ||
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        assignedTo: projectMetadata.assignedTo || 'Equipe EPU',
        tags: ['csv-import', 'epu', ...(projectMetadata.tags || [])],
        procedimentoParada: processedActivities.procedimentoParada,
        manutencao: processedActivities.manutencao,
        procedimentoPartida: processedActivities.procedimentoPartida,
        totalActivities: this.calculateTotalActivities(processedActivities),
        progress: this.calculateOverallProgress(processedActivities),
        metadata: {
          csvImported: true,
          csvFileName: path.basename(csvFilePath),
          importDate: new Date(),
          ...projectMetadata,
        },
      };

      // Remove arquivo CSV temporário após processamento
      if (fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
      }

      const createdProject = await this.projectRepository.create(projectData);
      console.log('✅ Projeto criado com sucesso via CSV');

      return createdProject;
    } catch (error) {
      console.error('❌ Erro ao criar projeto via CSV:', error);

      // Remove arquivo CSV em caso de erro
      if (fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
      }

      throw new Error(`Erro ao criar projeto via CSV: ${error.message}`);
    }
  }

  /**
   * Importa projeto a partir de arquivo CSV
   */
  async importProjectFromCsv(csvFilePath, metadata) {
    try {
      console.log('🔄 Iniciando importação de projeto via CSV...');

      // Processa o arquivo CSV
      const csvData = await this.csvProcessor.processarFrentes(csvFilePath);

      // Cria o projeto com base nos dados processados
      const projectData = this.csvProcessor.criarProjetoDeCSV(
        csvData,
        metadata
      );

      // Salva no repositório
      const createdProject = await this.projectRepository.create(projectData);

      console.log(
        '✅ Projeto importado com sucesso via CSV:',
        createdProject.id
      );
      return createdProject;
    } catch (error) {
      console.error('❌ Erro ao importar projeto via CSV:', error);
      throw new Error(`Falha na importação CSV: ${error.message}`);
    }
  }

  /**
   * Atualiza projeto existente com dados de CSV
   */
  async updateProjectFromCsv(projectId, csvFilePath, options = {}) {
    try {
      console.log('🔄 Iniciando atualização de projeto via CSV...');

      // Verifica se projeto existe
      const existingProject = await this.projectRepository.findById(projectId);
      if (!existingProject) {
        throw new Error('Projeto não encontrado');
      }

      // Processa o novo CSV
      const csvData = await this.csvProcessor.processarFrentes(csvFilePath);

      // Cria metadados baseados no projeto existente
      const metadata = {
        name: existingProject.name,
        description: existingProject.description,
        type: existingProject.type,
        priority: existingProject.priority,
        assignedTo: existingProject.assignedTo,
        startDate: existingProject.startDate,
        endDate: existingProject.endDate,
        tags: existingProject.tags,
        location: existingProject.location,
        customFields: options.preserveCustomFields
          ? existingProject.metadata?.customFields
          : {},
      };

      // Atualiza dados do projeto mantendo informações existentes
      const updatedData = this.csvProcessor.criarProjetoDeCSV(
        csvData,
        metadata
      );

      // Preserva metadados importantes
      updatedData.id = projectId;
      updatedData.createdAt = existingProject.createdAt;
      updatedData.metadata = {
        ...existingProject.metadata,
        ...updatedData.metadata,
        lastCsvUpdate: new Date(),
        updatedBy: options.updatedBy || 'Sistema',
        updateReason: options.updateReason || 'Atualização via CSV',
      };

      // Atualiza no repositório
      const updatedProject = await this.projectRepository.update(
        projectId,
        updatedData
      );

      console.log('✅ Projeto atualizado com sucesso via CSV:', projectId);
      return updatedProject;
    } catch (error) {
      console.error('❌ Erro ao atualizar projeto via CSV:', error);
      throw new Error(`Falha na atualização via CSV: ${error.message}`);
    }
  }

  /**
   * Calcula total de atividades
   */
  calculateTotalActivities(processedActivities) {
    return (
      processedActivities.procedimentoParada.length +
      processedActivities.manutencao.length +
      processedActivities.procedimentoPartida.length
    );
  }

  /**
   * Calcula progresso geral do projeto
   */
  calculateOverallProgress(processedActivities) {
    const allActivities = [
      ...processedActivities.procedimentoParada,
      ...processedActivities.manutencao,
      ...processedActivities.procedimentoPartida,
    ];

    if (allActivities.length === 0) return 0;

    const totalProgress = allActivities.reduce(
      (sum, activity) => sum + activity.progress,
      0
    );
    return Math.round(totalProgress / allActivities.length);
  }

  /**
   * Exporta projeto para formato CSV
   */
  async exportProjectToCsv(projectId) {
    try {
      console.log('🔄 Iniciando exportação de projeto para CSV...');

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error('Projeto não encontrado');
      }

      const csvLines = this.csvProcessor.exportarParaCSV(project);

      // Converte para string CSV
      const csvContent = csvLines
        .map((linha) => linha.map((campo) => `"${campo}"`).join(','))
        .join('\n');

      console.log('✅ Projeto exportado para CSV com sucesso');
      return csvContent;
    } catch (error) {
      console.error('❌ Erro ao exportar projeto para CSV:', error);
      throw new Error(`Falha na exportação CSV: ${error.message}`);
    }
  }

  /**
   * Obtém dados das frentes de trabalho organizados por tipo
   */
  async getProjectFrentesData(projectId) {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error('Projeto não encontrado');
      }

      // Organiza atividades por tipo (similar ao app.py)
      const frentesData = {
        procedimento_parada: this.filterActivitiesByType(
          project.activities,
          'parada'
        ),
        manutencao: this.filterActivitiesByType(
          project.activities,
          'manutencao'
        ),
        procedimento_partida: this.filterActivitiesByType(
          project.activities,
          'partida'
        ),
      };

      return {
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          progress: project.progress,
        },
        frentes: frentesData,
      };
    } catch (error) {
      console.error('❌ Erro ao obter dados das frentes:', error);
      throw new Error(`Erro ao obter frentes: ${error.message}`);
    }
  }

  /**
   * Filtra atividades por tipo
   */
  filterActivitiesByType(activities, type) {
    if (!activities) return [];

    return activities
      .filter((activity) => activity.type === type)
      .map((activity) => ({
        name: activity.name,
        planned: activity.planned || 0,
        real: activity.real || 0,
        progress: activity.progress || 0,
        status: activity.status,
        image: activity.image,
        sub_activities: activity.subActivities || [],
      }));
  }

  /**
   * Duplica projeto
   */
  async duplicateProject(projectId, newProjectData = {}) {
    try {
      const originalProject = await this.projectRepository.findById(projectId);
      if (!originalProject) {
        throw new Error('Projeto não encontrado');
      }

      const duplicatedProject = {
        ...originalProject,
        name: newProjectData.name || `${originalProject.name} (Cópia)`,
        description:
          newProjectData.description ||
          `${originalProject.description} (Duplicado)`,
        startDate: newProjectData.startDate || new Date(),
        endDate:
          newProjectData.endDate ||
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'not_started',
        progress: 0,
        metadata: {
          ...originalProject.metadata,
          duplicatedFrom: projectId,
          duplicatedAt: new Date(),
        },
      };

      // Remove _id para criar novo projeto
      delete duplicatedProject._id;

      const createdProject =
        await this.projectRepository.create(duplicatedProject);
      return createdProject;
    } catch (error) {
      console.error('❌ Erro ao duplicar projeto:', error);
      throw new Error(`Erro ao duplicar projeto: ${error.message}`);
    }
  }
}

module.exports = ProjectCrudUseCases;
