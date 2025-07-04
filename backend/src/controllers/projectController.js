/**
 * Project Controller - Single Responsibility HTTP Handler
 *
 * Responsabilidade única: Gerenciar requisições HTTP para projetos
 * - Validação de entrada
 * - Transformação de dados HTTP
 * - Delegação para services
 * - Formatação de respostas
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Interface Layer
 */

const projectService = require('../services/ProjectService');
const logger = require('../utils/logger');

class ProjectController {
  constructor() {
    this.projectService = projectService;
  }

  /**
   * GET /api/projects
   * Lista todos os projetos com filtros e paginação
   */
  async getAllProjects(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...filters
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        filters,
      };

      const result = await this.projectService.getAllProjects(options);

      this.handleSuccess(res, result, 'Projects retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve projects');
    }
  }

  /**
   * GET /api/projects/:id
   * Busca um projeto específico por ID
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return this.handleError(
          res,
          new Error('Project ID is required'),
          'Invalid request',
          400
        );
      }

      const project = await this.projectService.getProjectById(id);

      if (!project) {
        return this.handleError(
          res,
          new Error('Project not found'),
          'Project not found',
          404
        );
      }

      this.handleSuccess(res, project, 'Project retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve project');
    }
  }

  /**
   * POST /api/projects
   * Cria um novo projeto
   */
  async createProject(req, res) {
    try {
      const projectData = req.body;
      const userId = req.user?.id || req.userId;

      if (!userId) {
        return this.handleError(
          res,
          new Error('User authentication required'),
          'Unauthorized',
          401
        );
      }

      // Adiciona o proprietário do projeto
      projectData.owner = userId;
      projectData.createdBy = userId;

      const newProject = await this.projectService.createProject(projectData);

      this.handleSuccess(res, newProject, 'Project created successfully', 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to create project');
    }
  }

  /**
   * PUT /api/projects/:id
   * Atualiza um projeto existente
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id || req.userId;

      if (!id) {
        return this.handleError(
          res,
          new Error('Project ID is required'),
          'Invalid request',
          400
        );
      }

      // Adiciona informações de auditoria
      updateData.updatedBy = userId;
      updateData.updatedAt = new Date();

      const updatedProject = await this.projectService.updateProject(
        id,
        updateData
      );

      if (!updatedProject) {
        return this.handleError(
          res,
          new Error('Project not found'),
          'Project not found',
          404
        );
      }

      this.handleSuccess(res, updatedProject, 'Project updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update project');
    }
  }

  /**
   * DELETE /api/projects/:id
   * Remove um projeto
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.userId;

      if (!id) {
        return this.handleError(
          res,
          new Error('Project ID is required'),
          'Invalid request',
          400
        );
      }

      const deleted = await this.projectService.deleteProject(id, userId);

      if (!deleted) {
        return this.handleError(
          res,
          new Error('Project not found'),
          'Project not found',
          404
        );
      }

      this.handleSuccess(res, { id }, 'Project deleted successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to delete project');
    }
  }

  /**
   * POST /api/projects/upload-csv
   * Upload e processamento de arquivo CSV
   */
  async uploadCSV(req, res) {
    try {
      if (!req.file) {
        return this.handleError(
          res,
          new Error('CSV file is required'),
          'No file uploaded',
          400
        );
      }

      const userId = req.user?.id || req.userId;
      const result = await this.projectService.processCSVFile(
        req.file.path,
        userId
      );

      this.handleSuccess(res, result, 'CSV processed successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to process CSV file');
    }
  }

  /**
   * GET /api/projects/:id/export-csv
   * Exporta dados do projeto em CSV
   */
  async exportCSV(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return this.handleError(
          res,
          new Error('Project ID is required'),
          'Invalid request',
          400
        );
      }

      const csvData = await this.projectService.exportProjectCSV(id);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="project-${id}.csv"`
      );
      res.send(csvData);
    } catch (error) {
      this.handleError(res, error, 'Failed to export CSV');
    }
  }

  /**
   * GET /api/projects/:id/dashboard
   * Dados do dashboard para um projeto específico
   */
  async getProjectDashboard(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return this.handleError(
          res,
          new Error('Project ID is required'),
          'Invalid request',
          400
        );
      }

      const dashboardData = await this.projectService.getProjectDashboard(id);

      this.handleSuccess(
        res,
        dashboardData,
        'Dashboard data retrieved successfully'
      );
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve dashboard data');
    }
  }

  /**
   * GET /api/projects/:id/frentes
   * Lista frentes de um projeto
   */
  async getProjectFrentes(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return this.handleError(
          res,
          new Error('Project ID is required'),
          'Invalid request',
          400
        );
      }

      const frentes = await this.projectService.getProjectFrentes(id);

      this.handleSuccess(
        res,
        frentes,
        'Project frentes retrieved successfully'
      );
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve project frentes');
    }
  }

  /**
   * PUT /api/projects/:id/frentes/:frenteId
   * Atualiza uma frente específica
   */
  async updateProjectFrente(req, res) {
    try {
      const { id, frenteId } = req.params;
      const updateData = req.body;

      if (!id || !frenteId) {
        return this.handleError(
          res,
          new Error('Project ID and Frente ID are required'),
          'Invalid request',
          400
        );
      }

      const updatedFrente = await this.projectService.updateProjectFrente(
        id,
        frenteId,
        updateData
      );

      this.handleSuccess(
        res,
        updatedFrente,
        'Project frente updated successfully'
      );
    } catch (error) {
      this.handleError(res, error, 'Failed to update project frente');
    }
  }

  /**
   * GET /api/projects/statistics
   * Obtém estatísticas gerais dos projetos
   */
  async getProjectStatistics(req, res) {
    try {
      const statistics = await this.projectService.getProjectStatistics();
      this.handleSuccess(
        res,
        statistics,
        'Project statistics retrieved successfully'
      );
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve project statistics');
    }
  }

  // Métodos auxiliares para tratamento de resposta
  handleSuccess(res, data, message = 'Success', statusCode = 200) {
    const response = {
      status: 'success',
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    logger.info('Controller Success:', {
      statusCode,
      message,
      dataLength: Array.isArray(data) ? data.length : 1,
    });

    res.status(statusCode).json(response);
  }

  handleError(
    res,
    error,
    defaultMessage = 'Internal server error',
    statusCode = 500
  ) {
    const errorMessage = error?.message || defaultMessage;

    const response = {
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    // Log do erro para debugging
    logger.error('Controller Error:', {
      statusCode,
      message: errorMessage,
      stack: error?.stack,
      originalError: error,
    });

    // Não exposar stack trace em produção
    if (process.env.NODE_ENV !== 'production' && error?.stack) {
      response.stack = error.stack;
    }

    res.status(statusCode).json(response);
  }
}

// Exporta uma instância única (singleton)
module.exports = new ProjectController();
