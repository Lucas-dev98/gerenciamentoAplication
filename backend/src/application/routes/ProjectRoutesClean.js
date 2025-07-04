// Application - Project Routes (Clean Architecture)
const express = require('express');

/**
 * Project Routes implementing Clean Architecture principles
 * Defines all endpoints and maps them to controller methods
 */
class ProjectRoutesClean {
  constructor(projectController) {
    if (!projectController) {
      throw new Error('Project controller is required');
    }

    this.router = express.Router();
    this.projectController = projectController;
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check route
    this.router.get(
      '/health',
      this.projectController.healthCheck.bind(this.projectController)
    );

    // Project CRUD routes
    this.router.get(
      '/',
      this.projectController.getAllProjects.bind(this.projectController)
    );
    this.router.get(
      '/:id',
      this.projectController.getProjectById.bind(this.projectController)
    );
    this.router.post(
      '/',
      this.projectController.createProject.bind(this.projectController)
    );
    this.router.put(
      '/:id',
      this.projectController.updateProject.bind(this.projectController)
    );
    this.router.delete(
      '/:id',
      this.projectController.deleteProject.bind(this.projectController)
    );

    // Project specific data routes
    this.router.get(
      '/:id/procedimento-parada',
      this.projectController.getProcedimentoParada.bind(this.projectController)
    );
    this.router.get(
      '/:id/manutencao',
      this.projectController.getManutencao.bind(this.projectController)
    );
    this.router.get(
      '/:id/procedimento-partida',
      this.projectController.getProcedimentoPartida.bind(this.projectController)
    );
    this.router.get(
      '/:id/frentes',
      this.projectController.getProjectFrentes.bind(this.projectController)
    );
    this.router.get(
      '/:id/statistics',
      this.projectController.getProjectStatistics.bind(this.projectController)
    );

    // Activity management routes
    this.router.post(
      '/:id/activities',
      this.projectController.addProjectActivity.bind(this.projectController)
    );
    this.router.put(
      '/:id/activities/:activityId',
      this.projectController.updateProjectActivity.bind(this.projectController)
    );

    // Middleware for logging all requests to this router
    this.router.use(this.logRequest.bind(this));
  }

  // Middleware to log all requests
  logRequest(req, res, next) {
    const startTime = Date.now();

    // Log request
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      {
        params: req.params,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        ip: req.ip || req.connection?.remoteAddress,
      }
    );

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
      );
    });

    next();
  }

  // Error handling middleware specific to project routes
  setupErrorHandling() {
    this.router.use(this.handleProjectRouteErrors.bind(this));
  }

  handleProjectRouteErrors(error, req, res, next) {
    console.error('Project Route Error:', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID format',
        timestamp: new Date().toISOString(),
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        status: 'error',
        message: 'Database error',
        timestamp: new Date().toISOString(),
      });
    }

    // Default error response
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }

  // Get configured router
  getRouter() {
    // Add error handling middleware before returning
    this.setupErrorHandling();
    return this.router;
  }

  // Get route documentation (for API documentation)
  getRouteDocumentation() {
    return {
      basePath: '/api/projects',
      routes: [
        {
          method: 'GET',
          path: '/',
          description:
            'Get all projects with optional filtering and pagination',
          parameters: {
            query: {
              page: 'Page number (default: 1)',
              limit: 'Items per page (default: 10, max: 100)',
              sortBy:
                'Sort field (name, createdAt, priority, status, progress)',
              sortOrder: 'Sort order (asc, desc)',
              status: 'Filter by status',
              priority: 'Filter by priority',
              owner: 'Filter by owner',
              category: 'Filter by category',
              tags: 'Filter by tags (can be array)',
              search: 'Search in name and description',
              dateFrom: 'Filter by creation date from',
              dateTo: 'Filter by creation date to',
            },
          },
          responses: {
            200: 'List of projects',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/:id',
          description: 'Get a specific project by ID',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'Project details',
            404: 'Project not found',
            400: 'Invalid ID format',
            500: 'Server error',
          },
        },
        {
          method: 'POST',
          path: '/',
          description: 'Create a new project',
          parameters: {
            body: {
              name: 'Project name (required)',
              description: 'Project description',
              priority: 'Project priority (low, medium, high, urgent)',
              status:
                'Project status (draft, active, completed, cancelled, on-hold, archived)',
              owner: 'Owner ID',
              budget: 'Project budget',
              deadline: 'Project deadline',
              tags: 'Array of tags',
              location: 'Project location',
              category: 'Project category',
            },
          },
          responses: {
            201: 'Project created successfully',
            400: 'Validation error',
            500: 'Server error',
          },
        },
        {
          method: 'PUT',
          path: '/:id',
          description: 'Update an existing project',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
            body: {
              name: 'Project name',
              description: 'Project description',
              priority: 'Project priority',
              status: 'Project status',
              budget: 'Project budget',
              deadline: 'Project deadline',
            },
          },
          responses: {
            200: 'Project updated successfully',
            404: 'Project not found',
            400: 'Validation error',
            500: 'Server error',
          },
        },
        {
          method: 'DELETE',
          path: '/:id',
          description: 'Delete a project',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'Project deleted successfully',
            404: 'Project not found',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/:id/procedimento-parada',
          description: 'Get procedimento parada activities for a project',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'List of parada activities',
            404: 'Project not found',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/:id/manutencao',
          description: 'Get maintenance activities for a project',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'List of maintenance activities',
            404: 'Project not found',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/:id/procedimento-partida',
          description: 'Get procedimento partida activities for a project',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'List of partida activities',
            404: 'Project not found',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/:id/frentes',
          description: 'Get all activities organized by type (frentes)',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'Activities organized by type',
            404: 'Project not found',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/:id/statistics',
          description: 'Get project statistics and metrics',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
          },
          responses: {
            200: 'Project statistics',
            404: 'Project not found',
            500: 'Server error',
          },
        },
        {
          method: 'POST',
          path: '/:id/activities',
          description: 'Add a new activity to a project',
          parameters: {
            path: {
              id: 'Project ID (required)',
            },
            body: {
              name: 'Activity name (required)',
              type: 'Activity type: parada, manutencao, partida (required)',
              planned: 'Planned value',
              real: 'Real value',
              description: 'Activity description',
              priority: 'Activity priority',
              estimatedHours: 'Estimated hours',
              assignedTo: 'Assigned person',
            },
          },
          responses: {
            201: 'Activity added successfully',
            404: 'Project not found',
            400: 'Validation error',
            500: 'Server error',
          },
        },
        {
          method: 'PUT',
          path: '/:id/activities/:activityId',
          description: 'Update a project activity',
          parameters: {
            path: {
              id: 'Project ID (required)',
              activityId: 'Activity ID (required)',
            },
            body: {
              name: 'Activity name',
              planned: 'Planned value',
              real: 'Real value',
              description: 'Activity description',
              priority: 'Activity priority',
              estimatedHours: 'Estimated hours',
              actualHours: 'Actual hours',
              assignedTo: 'Assigned person',
            },
          },
          responses: {
            200: 'Activity updated successfully',
            404: 'Project or activity not found',
            500: 'Server error',
          },
        },
        {
          method: 'GET',
          path: '/health',
          description: 'Health check endpoint',
          responses: {
            200: 'Service health information',
            500: 'Service unhealthy',
          },
        },
      ],
    };
  }
}

module.exports = ProjectRoutesClean;
