/**
 * Project Service - Business Logic Layer
 *
 * Responsabilidade única: Lógica de negócio para projetos
 * - Validação de regras de negócio
 * - Orquestração de operações
 * - Transformação de dados
 * - Integração com repositórios
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Application Layer
 */

const ProjectRepository = require('../repositories/ProjectRepository');
const csvProcessor = require('./CSVProcessor');
const frentesService = require('./FrentesService');
const logger = require('../utils/logger');

class ProjectService {
  constructor() {
    this.repository = new ProjectRepository();
    this.csvProcessor = csvProcessor;
    this.frentesService = frentesService;
  }

  /**
   * Busca todos os projetos com filtros e paginação
   */
  async getAllProjects(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {},
      } = options;

      // Validação de entrada
      if (page < 1 || limit < 1 || limit > 100) {
        throw new Error('Invalid pagination parameters');
      }

      const projects = await this.repository.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
        filters,
      });

      return {
        data: projects.data,
        pagination: {
          page,
          limit,
          total: projects.total,
          totalPages: Math.ceil(projects.total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getAllProjects:', error);
      throw error;
    }
  }

  /**
   * Busca um projeto por ID
   */
  async getProjectById(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await this.repository.findById(id);

      if (!project) {
        return null;
      }

      // Enriquece dados do projeto se necessário
      return await this.enrichProjectData(project);
    } catch (error) {
      logger.error(`Error in getProjectById for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo projeto
   */
  async createProject(projectData) {
    try {
      // Validação de dados obrigatórios
      this.validateProjectData(projectData);

      // Normaliza e enriquece os dados
      const normalizedData = await this.normalizeProjectData(projectData);

      // Cria o projeto
      const newProject = await this.repository.create(normalizedData);

      logger.info(`Project created successfully: ${newProject.id}`);
      return newProject;
    } catch (error) {
      logger.error('Error in createProject:', error);
      throw error;
    }
  }

  /**
   * Atualiza um projeto existente
   */
  async updateProject(id, updateData) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      // Verifica se o projeto existe
      const existingProject = await this.repository.findById(id);
      if (!existingProject) {
        return null;
      }

      // Valida dados de atualização
      this.validateUpdateData(updateData);

      // Normaliza os dados
      const normalizedData = await this.normalizeUpdateData(
        updateData,
        existingProject
      );

      // Atualiza o projeto
      const updatedProject = await this.repository.update(id, normalizedData);

      logger.info(`Project updated successfully: ${id}`);
      return updatedProject;
    } catch (error) {
      logger.error(`Error in updateProject for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove um projeto
   */
  async deleteProject(id, userId) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      // Verifica se o projeto existe e se o usuário tem permissão
      const project = await this.repository.findById(id);
      if (!project) {
        return false;
      }

      // Verifica permissões (apenas proprietário ou admin pode deletar)
      if (!this.canDeleteProject(project, userId)) {
        throw new Error('Insufficient permissions to delete project');
      }

      // Remove o projeto
      const deleted = await this.repository.delete(id);

      if (deleted) {
        logger.info(`Project deleted successfully: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Error in deleteProject for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Processa um arquivo CSV
   */
  async processCSVFile(filePath, userId) {
    try {
      if (!filePath) {
        throw new Error('File path is required');
      }

      // Processa o arquivo CSV
      const csvData = await this.csvProcessor.processFile(filePath);

      // Valida os dados do CSV
      const validatedData = await this.validateCSVData(csvData);

      // Cria ou atualiza projetos baseado nos dados do CSV
      const result = await this.processCSVData(validatedData, userId);

      logger.info(
        `CSV processed successfully: ${result.processed} projects processed`
      );
      return result;
    } catch (error) {
      logger.error('Error in processCSVFile:', error);
      throw error;
    }
  }

  /**
   * Exporta dados do projeto em formato CSV
   */
  async exportProjectCSV(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await this.repository.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      const csvData = await this.csvProcessor.exportProject(project);
      return csvData;
    } catch (error) {
      logger.error(`Error in exportProjectCSV for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca dados do dashboard para um projeto
   */
  async getProjectDashboard(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await this.repository.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      // Calcula métricas do dashboard
      const dashboardData = await this.calculateDashboardMetrics(project);

      return dashboardData;
    } catch (error) {
      logger.error(`Error in getProjectDashboard for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca frentes de um projeto
   */
  async getProjectFrentes(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await this.repository.findById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      const frentes = await this.frentesService.getFrentesByProject(id);
      return frentes;
    } catch (error) {
      logger.error(`Error in getProjectFrentes for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza uma frente específica
   */
  async updateProjectFrente(projectId, frenteId, updateData) {
    try {
      if (!projectId || !frenteId) {
        throw new Error('Project ID and Frente ID are required');
      }

      // Verifica se o projeto existe
      const project = await this.repository.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Atualiza a frente
      const updatedFrente = await this.frentesService.updateFrente(
        frenteId,
        updateData
      );

      // Atualiza o progresso do projeto se necessário
      await this.updateProjectProgress(projectId);

      return updatedFrente;
    } catch (error) {
      logger.error(
        `Error in updateProjectFrente for project ${projectId}, frente ${frenteId}:`,
        error
      );
      throw error;
    }
  }

  // Métodos auxiliares privados

  /**
   * Valida dados obrigatórios do projeto
   */
  validateProjectData(data) {
    const required = ['name', 'owner'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Field '${field}' is required`);
      }
    }

    if (data.name.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }
  }

  /**
   * Valida dados de atualização
   */
  validateUpdateData(data) {
    if (data.name && data.name.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }

    if (data.progress && (data.progress < 0 || data.progress > 100)) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  /**
   * Normaliza dados do projeto
   */
  async normalizeProjectData(data) {
    return {
      ...data,
      status: data.status || 'active',
      priority: data.priority || 'medium',
      progress: data.progress || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Normaliza dados de atualização
   */
  async normalizeUpdateData(data, existingProject) {
    return {
      ...data,
      updatedAt: new Date(),
    };
  }

  /**
   * Enriquece dados do projeto com informações adicionais
   */
  async enrichProjectData(project) {
    try {
      // Convert Mongoose document to plain object
      const projectObj = project.toObject ? project.toObject() : project;

      // Skip frentes for now to avoid complexity
      // const frentes = await this.frentesService.getFrentesByProject(projectObj._id || projectObj.id);

      return {
        ...projectObj,
        frentesCount: 0,
        lastUpdated: projectObj.updatedAt,
      };
    } catch (error) {
      logger.warn('Failed to enrich project data:', error);
      // Return plain object even on error
      return project.toObject ? project.toObject() : project;
    }
  }

  /**
   * Verifica se um usuário pode deletar um projeto
   */
  canDeleteProject(project, userId) {
    // Convert to string for comparison to handle ObjectId vs string
    const projectOwner = (project.owner || project.createdBy || '').toString();
    const userIdStr = (userId || '').toString();

    return (
      projectOwner === userIdStr ||
      (project.createdBy || '').toString() === userIdStr
    );
  }

  /**
   * Valida dados do CSV
   */
  async validateCSVData(csvData) {
    // Implementar validação específica dos dados CSV
    return csvData;
  }

  /**
   * Processa dados do CSV e cria/atualiza projetos
   */
  async processCSVData(csvData, userId) {
    // Implementar lógica de processamento do CSV
    return {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
    };
  }

  /**
   * Calcula métricas do dashboard
   */
  async calculateDashboardMetrics(project) {
    return {
      id: project.id,
      name: project.name,
      progress: project.progress || 0,
      status: project.status,
      priority: project.priority,
      lastUpdated: project.updatedAt,
      metrics: {
        totalTasks: project.activities?.length || 0,
        completedTasks:
          project.activities?.filter((a) => a.status === 'completed').length ||
          0,
        inProgressTasks:
          project.activities?.filter((a) => a.status === 'in_progress')
            .length || 0,
      },
    };
  }

  /**
   * Atualiza o progresso do projeto baseado nas frentes
   */
  async updateProjectProgress(projectId) {
    try {
      const frentes = await this.frentesService.getFrentesByProject(projectId);

      if (frentes.length === 0) return;

      const totalProgress = frentes.reduce(
        (sum, frente) => sum + (frente.progress || 0),
        0
      );
      const averageProgress = Math.round(totalProgress / frentes.length);

      await this.repository.update(projectId, {
        progress: averageProgress,
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error(`Error updating project progress for ${projectId}:`, error);
    }
  }

  /**
   * Obtém estatísticas gerais dos projetos
   */
  async getProjectStatistics() {
    try {
      const totalProjects = await this.repository.count();
      const activeProjects = await this.repository.count({
        status: { $in: ['active', 'draft'] },
      });
      const completedProjects = await this.repository.count({
        status: 'completed',
      });
      const onHoldProjects = await this.repository.count({ status: 'on-hold' });
      const cancelledProjects = await this.repository.count({
        status: 'cancelled',
      });

      // Calcular progresso médio dos projetos ativos
      const activeProjectsData = await this.repository.findAll({
        filters: { status: { $in: ['active', 'draft'] } },
        limit: 1000, // Buscar todos os projetos ativos
      });

      const averageProgress =
        activeProjectsData.data.length > 0
          ? Math.round(
              activeProjectsData.data.reduce(
                (sum, project) => sum + (project.progress || 0),
                0
              ) / activeProjectsData.data.length
            )
          : 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        cancelledProjects,
        averageProgress,
        summary: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          averageProgress: `${averageProgress}%`,
        },
      };
    } catch (error) {
      logger.error('Error getting project statistics:', error);
      throw new Error('Failed to retrieve project statistics');
    }
  }
}

// Exporta uma instância única (singleton)
module.exports = new ProjectService();
