/**
 * Project Controller - Consolidated & Clean Architecture
 *
 * Controller único consolidado para todas as operações de projeto.
 * Implementa padrões de código limpo e responsabilidade única.
 *
 * @version 4.0.0
 * @architecture Clean Architecture
 */

const projectService = require('../services/projectServices');
const csvProjectProcessor = require('../services/csvProjectProcessor');
const logger = require('../utils/logger');

class ProjectController {
  constructor() {
    this.projectService = projectService;
    this.csvProcessor = csvProjectProcessor;
    this.logger = logger;
  }

  /**
   * GET /api/projects - Listar todos os projetos
   */
  async getAllProjects(req, res, next) {
    const action = 'GET_ALL_PROJECTS';
    const startTime = Date.now();

    try {
      this.logger.info(`${action}: Starting project listing`, {
        userId: req.user?.id,
        query: req.query,
      });

      const result = await this.projectService.getAllProjects(req.query);
      const duration = Date.now() - startTime;

      this.logger.info(`${action}: Projects retrieved successfully`, {
        count: result.data?.length || 0,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: `${result.data?.length || 0} projetos encontrados`,
        data: result.data,
        count: result.data?.length || 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to retrieve projects`, {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * GET /api/projects/:id - Buscar projeto por ID
   */
  async getProjectById(req, res, next) {
    const action = 'GET_PROJECT_BY_ID';
    const startTime = Date.now();

    try {
      const { id } = req.params;

      this.logger.info(`${action}: Starting project retrieval`, {
        projectId: id,
        userId: req.user?.id,
      });

      const result = await this.projectService.getProjectById(id);
      const duration = Date.now() - startTime;

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado',
          timestamp: new Date().toISOString(),
        });
      }

      this.logger.info(`${action}: Project retrieved successfully`, {
        projectId: id,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: 'Projeto encontrado',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to retrieve project`, {
        error: error.message,
        stack: error.stack,
        projectId: req.params.id,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * POST /api/projects - Criar novo projeto
   */
  async createProject(req, res, next) {
    const action = 'CREATE_PROJECT';
    const startTime = Date.now();

    try {
      this.logger.info(`${action}: Starting project creation`, {
        projectData: { name: req.body.name },
        userId: req.user?.id,
      });

      // Validação básica
      const validation = this._validateProjectData(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors,
        });
      }

      const projectData = {
        ...req.body,
        owner: req.user?.id,
        createdBy: req.user?.id,
      };

      const result = await this.projectService.createProject(projectData);
      const duration = Date.now() - startTime;

      this.logger.info(`${action}: Project created successfully`, {
        projectId: result.data?.id,
        projectName: result.data?.name,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        message: 'Projeto criado com sucesso',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to create project`, {
        error: error.message,
        stack: error.stack,
        projectData: { name: req.body?.name },
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * PUT /api/projects/:id - Atualizar projeto
   */
  async updateProject(req, res, next) {
    const action = 'UPDATE_PROJECT';
    const startTime = Date.now();

    try {
      const { id } = req.params;

      this.logger.info(`${action}: Starting project update`, {
        projectId: id,
        userId: req.user?.id,
      });

      // Validação básica
      const validation = this._validateProjectData(req.body, false);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          errors: validation.errors,
        });
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user?.id,
        updatedAt: new Date(),
      };

      const result = await this.projectService.updateProject(id, updateData);
      const duration = Date.now() - startTime;

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado',
        });
      }

      this.logger.info(`${action}: Project updated successfully`, {
        projectId: id,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: 'Projeto atualizado com sucesso',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to update project`, {
        error: error.message,
        stack: error.stack,
        projectId: req.params.id,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * DELETE /api/projects/:id - Excluir projeto
   */
  async deleteProject(req, res, next) {
    const action = 'DELETE_PROJECT';
    const startTime = Date.now();

    try {
      const { id } = req.params;

      this.logger.info(`${action}: Starting project deletion`, {
        projectId: id,
        userId: req.user?.id,
      });

      const result = await this.projectService.deleteProject(id);
      const duration = Date.now() - startTime;

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado',
        });
      }

      this.logger.info(`${action}: Project deleted successfully`, {
        projectId: id,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: 'Projeto excluído com sucesso',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to delete project`, {
        error: error.message,
        stack: error.stack,
        projectId: req.params.id,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * GET /api/projects/:id/procedimento-parada - Procedimento de parada
   */
  async getProcedimentoParada(req, res, next) {
    const action = 'GET_PROCEDIMENTO_PARADA';
    return this._getProjectActivitiesByType(req, res, next, 'parada', action);
  }

  /**
   * GET /api/projects/:id/manutencao - Atividades de manutenção
   */
  async getManutencao(req, res, next) {
    const action = 'GET_MANUTENCAO';
    return this._getProjectActivitiesByType(
      req,
      res,
      next,
      'manutencao',
      action
    );
  }

  /**
   * GET /api/projects/:id/procedimento-partida - Procedimento de partida
   */
  async getProcedimentoPartida(req, res, next) {
    const action = 'GET_PROCEDIMENTO_PARTIDA';
    return this._getProjectActivitiesByType(req, res, next, 'partida', action);
  }

  /**
   * GET /api/projects/:id/frentes - Todas as frentes do projeto
   */
  async getAllFrentes(req, res, next) {
    const action = 'GET_ALL_FRENTES';
    const startTime = Date.now();

    try {
      const { id } = req.params;

      this.logger.info(`${action}: Starting frentes retrieval`, {
        projectId: id,
        userId: req.user?.id,
      });

      const result = await this.projectService.getProjectFrentes(id);
      const duration = Date.now() - startTime;

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado',
        });
      }

      this.logger.info(`${action}: Frentes retrieved successfully`, {
        projectId: id,
        frentesCount: Object.keys(result.data.frentes || {}).length,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: 'Frentes do projeto recuperadas',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to retrieve frentes`, {
        error: error.message,
        stack: error.stack,
        projectId: req.params.id,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * GET /api/projects/:id/statistics - Estatísticas do projeto
   */
  async getProjectStatistics(req, res, next) {
    const action = 'GET_PROJECT_STATISTICS';
    const startTime = Date.now();

    try {
      const { id } = req.params;

      this.logger.info(`${action}: Starting statistics calculation`, {
        projectId: id,
        userId: req.user?.id,
      });

      const result = await this.projectService.getProjectStatistics(id);
      const duration = Date.now() - startTime;

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado',
        });
      }

      this.logger.info(`${action}: Statistics calculated successfully`, {
        projectId: id,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: 'Estatísticas do projeto calculadas',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to calculate statistics`, {
        error: error.message,
        stack: error.stack,
        projectId: req.params.id,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * POST /api/projects/upload-csv - Upload de projeto via CSV
   */
  async uploadProjectFromCSV(req, res, next) {
    const action = 'UPLOAD_PROJECT_CSV';
    const startTime = Date.now();

    try {
      this.logger.info(`${action}: Starting CSV upload`, {
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        userId: req.user?.id,
      });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo CSV é obrigatório',
        });
      }

      const result = await this.csvProcessor.processProjectCSV(
        req.file.path,
        req.user?.id
      );
      const duration = Date.now() - startTime;

      this.logger.info(`${action}: CSV processed successfully`, {
        fileName: req.file.originalname,
        projectId: result.data?.id,
        activitiesCount: result.data?.activities?.length || 0,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        message: 'Projeto criado a partir do CSV com sucesso',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      // Limpar arquivo em caso de erro
      if (req.file) {
        try {
          require('fs').unlinkSync(req.file.path);
        } catch (cleanupError) {
          this.logger.warn('Failed to cleanup file after error', {
            error: cleanupError.message,
          });
        }
      }

      this.logger.error(`${action}: Failed to process CSV`, {
        error: error.message,
        stack: error.stack,
        fileName: req.file?.originalname,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * Método privado para buscar atividades por tipo
   */
  async _getProjectActivitiesByType(req, res, next, type, action) {
    const startTime = Date.now();

    try {
      const { id } = req.params;

      this.logger.info(`${action}: Starting ${type} activities retrieval`, {
        projectId: id,
        activityType: type,
        userId: req.user?.id,
      });

      const result = await this.projectService.getProjectActivitiesByType(
        id,
        type
      );
      const duration = Date.now() - startTime;

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Projeto não encontrado',
        });
      }

      this.logger.info(`${action}: ${type} activities retrieved successfully`, {
        projectId: id,
        activitiesCount: result.data.activities?.length || 0,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });

      res.json({
        success: true,
        message: `Atividades de ${type} recuperadas`,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${action}: Failed to retrieve ${type} activities`, {
        error: error.message,
        stack: error.stack,
        projectId: req.params.id,
        activityType: type,
        userId: req.user?.id,
        duration: `${duration}ms`,
      });
      next(error);
    }
  }

  /**
   * Validação de dados do projeto
   */
  _validateProjectData(data, requireName = true) {
    const errors = [];

    if (requireName && (!data.name || data.name.trim().length < 3)) {
      errors.push('Nome do projeto deve ter pelo menos 3 caracteres');
    }

    if (data.name && data.name.trim().length > 100) {
      errors.push('Nome do projeto deve ter no máximo 100 caracteres');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
    }

    if (
      data.status &&
      !['active', 'inactive', 'completed', 'cancelled'].includes(data.status)
    ) {
      errors.push('Status deve ser: active, inactive, completed ou cancelled');
    }

    if (
      data.priority &&
      !['low', 'medium', 'high', 'urgent'].includes(data.priority)
    ) {
      errors.push('Prioridade deve ser: low, medium, high ou urgent');
    }

    return {
      valid: errors.length === 0,
      errors,
      message: errors.length > 0 ? errors.join(', ') : null,
    };
  }
}

// Criar instância única (Singleton)
const projectController = new ProjectController();

module.exports = {
  getAllProjects: projectController.getAllProjects.bind(projectController),
  getProjectById: projectController.getProjectById.bind(projectController),
  createProject: projectController.createProject.bind(projectController),
  updateProject: projectController.updateProject.bind(projectController),
  deleteProject: projectController.deleteProject.bind(projectController),
  getProcedimentoParada:
    projectController.getProcedimentoParada.bind(projectController),
  getManutencao: projectController.getManutencao.bind(projectController),
  getProcedimentoPartida:
    projectController.getProcedimentoPartida.bind(projectController),
  getAllFrentes: projectController.getAllFrentes.bind(projectController),
  getProjectStatistics:
    projectController.getProjectStatistics.bind(projectController),
  uploadProjectFromCSV:
    projectController.uploadProjectFromCSV.bind(projectController),
};
