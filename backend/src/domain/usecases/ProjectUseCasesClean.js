// Domain - Project Use Cases (Clean Architecture)
const BaseUseCase = require('../../core/usecases/BaseUseCase');
const Project = require('../entities/ProjectClean');
const Activity = require('../entities/Activity');

/**
 * Project Use Cases implementation
 * Contains all business logic for project operations
 */
class ProjectUseCasesClean extends BaseUseCase {
  constructor(projectRepository, logger = console) {
    super(projectRepository, logger);
  }

  // Get all projects
  async getAllProjects(filters = {}, options = {}) {
    try {
      this.logInfo('Getting all projects', { filters, options });

      const projects = await this.repository.findAll(filters, options);

      this.logInfo('Projects retrieved successfully', {
        count: projects.length,
      });
      return this.success(projects, `Retrieved ${projects.length} projects`);
    } catch (error) {
      this.logError('Get all projects', error, { filters, options });
      return this.error(
        'Failed to retrieve projects',
        error,
        'GET_PROJECTS_ERROR'
      );
    }
  }

  // Get project by ID
  async getProjectById(id) {
    try {
      const validation = this.validateInput({ id });
      if (!validation.isValid) {
        return this.error(
          'Invalid input parameters',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      const validatedId = this.validateId(id);
      if (!validatedId) {
        return this.error('Invalid project ID', null, 'INVALID_ID');
      }

      this.logInfo('Getting project by ID', { id: validatedId });

      const project = await this.repository.findById(validatedId);

      if (!project) {
        this.logInfo('Project not found', { id: validatedId });
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      this.logInfo('Project retrieved successfully', {
        id: validatedId,
        name: project.name,
      });
      return this.success(project, 'Project retrieved successfully');
    } catch (error) {
      this.logError('Get project by ID', error, { id });
      return this.error(
        'Failed to retrieve project',
        error,
        'GET_PROJECT_ERROR'
      );
    }
  }

  // Get project activities by type
  async getProjectActivitiesByType(projectId, type) {
    try {
      const validation = this.validateInput({ projectId, type });
      if (!validation.isValid) {
        return this.error(
          'Invalid input parameters',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      if (!['parada', 'manutencao', 'partida'].includes(type)) {
        return this.error('Invalid activity type', null, 'INVALID_TYPE');
      }

      this.logInfo('Getting project activities by type', { projectId, type });

      const project = await this.repository.findById(projectId);
      if (!project) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      const activities = project.getActivitiesByType(type);

      this.logInfo('Activities retrieved successfully', {
        projectId,
        type,
        count: activities.length,
      });

      return this.success(
        activities,
        `Retrieved ${activities.length} ${type} activities`
      );
    } catch (error) {
      this.logError('Get project activities by type', error, {
        projectId,
        type,
      });
      return this.error(
        'Failed to retrieve activities',
        error,
        'GET_ACTIVITIES_ERROR'
      );
    }
  }

  // Get project frentes (all activity types organized)
  async getProjectFrentes(projectId) {
    try {
      const validation = this.validateInput({ projectId });
      if (!validation.isValid) {
        return this.error(
          'Invalid input parameters',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      this.logInfo('Getting project frentes', { projectId });

      const project = await this.repository.findById(projectId);
      if (!project) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      const frentes = {
        procedimento_parada: project
          .getActivitiesByType('parada')
          .map((act) => act.toJSON()),
        manutencao: project
          .getActivitiesByType('manutencao')
          .map((act) => act.toJSON()),
        procedimento_partida: project
          .getActivitiesByType('partida')
          .map((act) => act.toJSON()),
      };

      const totalActivities = Object.values(frentes).reduce(
        (sum, activities) => sum + activities.length,
        0
      );

      this.logInfo('Frentes retrieved successfully', {
        projectId,
        totalActivities,
        breakdown: {
          parada: frentes.procedimento_parada.length,
          manutencao: frentes.manutencao.length,
          partida: frentes.procedimento_partida.length,
        },
      });

      return this.success(
        frentes,
        `Retrieved ${totalActivities} activities organized by type`
      );
    } catch (error) {
      this.logError('Get project frentes', error, { projectId });
      return this.error(
        'Failed to retrieve frentes',
        error,
        'GET_FRENTES_ERROR'
      );
    }
  }

  // Get project statistics
  async getProjectStatistics(projectId) {
    try {
      const validation = this.validateInput({ projectId });
      if (!validation.isValid) {
        return this.error(
          'Invalid input parameters',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      this.logInfo('Getting project statistics', { projectId });

      const project = await this.repository.findById(projectId);
      if (!project) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      const statistics = project.getStatistics();

      this.logInfo('Statistics calculated successfully', {
        projectId,
        totalActivities: statistics.overview.totalActivities,
        overallProgress: statistics.overview.overallProgress,
      });

      return this.success(
        statistics,
        'Project statistics calculated successfully'
      );
    } catch (error) {
      this.logError('Get project statistics', error, { projectId });
      return this.error(
        'Failed to calculate statistics',
        error,
        'GET_STATISTICS_ERROR'
      );
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const validation = this.validateCreateProjectInput(projectData);
      if (!validation.isValid) {
        return this.error(
          'Invalid project data',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      this.logInfo('Creating new project', { name: projectData.name });

      // Create project entity
      const project = new Project({
        ...projectData,
        id: projectData.id || this.generateId(),
      });

      // Validate business rules
      if (!project.isValid()) {
        return this.error(
          'Project entity validation failed',
          null,
          'ENTITY_VALIDATION_ERROR'
        );
      }

      // Save to repository
      const savedProject = await this.repository.save(project);

      this.logInfo('Project created successfully', {
        id: savedProject.id,
        name: savedProject.name,
      });

      return this.success(savedProject, 'Project created successfully');
    } catch (error) {
      this.logError('Create project', error, { name: projectData?.name });
      return this.error(
        'Failed to create project',
        error,
        'CREATE_PROJECT_ERROR'
      );
    }
  }

  // Update project
  async updateProject(id, updateData) {
    try {
      const validation = this.validateUpdateProjectInput({ id, ...updateData });
      if (!validation.isValid) {
        return this.error(
          'Invalid update data',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      const validatedId = this.validateId(id);
      if (!validatedId) {
        return this.error('Invalid project ID', null, 'INVALID_ID');
      }

      this.logInfo('Updating project', { id: validatedId });

      // Get existing project
      const existingProject = await this.repository.findById(validatedId);
      if (!existingProject) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      // Apply updates
      Object.assign(existingProject, updateData);
      existingProject.touch();

      // Validate updated entity
      if (!existingProject.isValid()) {
        return this.error(
          'Updated project validation failed',
          null,
          'ENTITY_VALIDATION_ERROR'
        );
      }

      // Save updated project
      const updatedProject = await this.repository.save(existingProject);

      this.logInfo('Project updated successfully', {
        id: updatedProject.id,
        name: updatedProject.name,
      });

      return this.success(updatedProject, 'Project updated successfully');
    } catch (error) {
      this.logError('Update project', error, { id });
      return this.error(
        'Failed to update project',
        error,
        'UPDATE_PROJECT_ERROR'
      );
    }
  }

  // Delete project
  async deleteProject(id) {
    try {
      const validation = this.validateInput({ id });
      if (!validation.isValid) {
        return this.error(
          'Invalid input parameters',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      const validatedId = this.validateId(id);
      if (!validatedId) {
        return this.error('Invalid project ID', null, 'INVALID_ID');
      }

      this.logInfo('Deleting project', { id: validatedId });

      // Check if project exists
      const exists = await this.repository.exists(validatedId);
      if (!exists) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      // Delete project
      const deleted = await this.repository.delete(validatedId);

      if (deleted) {
        this.logInfo('Project deleted successfully', { id: validatedId });
        return this.success(
          { id: validatedId },
          'Project deleted successfully'
        );
      } else {
        return this.error('Failed to delete project', null, 'DELETE_FAILED');
      }
    } catch (error) {
      this.logError('Delete project', error, { id });
      return this.error(
        'Failed to delete project',
        error,
        'DELETE_PROJECT_ERROR'
      );
    }
  }

  // Activity management
  async addActivityToProject(projectId, activityData) {
    try {
      const validation = this.validateAddActivityInput({
        projectId,
        ...activityData,
      });
      if (!validation.isValid) {
        return this.error(
          'Invalid activity data',
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      this.logInfo('Adding activity to project', {
        projectId,
        activityName: activityData.name,
      });

      const project = await this.repository.findById(projectId);
      if (!project) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      const activity = project.addActivity(activityData);
      const updatedProject = await this.repository.save(project);

      this.logInfo('Activity added successfully', {
        projectId,
        activityId: activity.id,
        activityName: activity.name,
      });

      return this.success(
        {
          project: updatedProject,
          activity: activity,
        },
        'Activity added successfully'
      );
    } catch (error) {
      this.logError('Add activity to project', error, { projectId });
      return this.error('Failed to add activity', error, 'ADD_ACTIVITY_ERROR');
    }
  }

  async updateProjectActivity(projectId, activityId, updateData) {
    try {
      this.logInfo('Updating project activity', { projectId, activityId });

      const project = await this.repository.findById(projectId);
      if (!project) {
        return this.error('Project not found', null, 'PROJECT_NOT_FOUND');
      }

      const updatedActivity = project.updateActivity(activityId, updateData);
      const updatedProject = await this.repository.save(project);

      this.logInfo('Activity updated successfully', {
        projectId,
        activityId,
        activityName: updatedActivity.name,
      });

      return this.success(
        {
          project: updatedProject,
          activity: updatedActivity,
        },
        'Activity updated successfully'
      );
    } catch (error) {
      this.logError('Update project activity', error, {
        projectId,
        activityId,
      });
      return this.error(
        'Failed to update activity',
        error,
        'UPDATE_ACTIVITY_ERROR'
      );
    }
  }

  // Validation helpers
  validateInput(params) {
    const errors = [];

    if (params.id && !this.validateId(params.id)) {
      errors.push('Invalid ID format');
    }

    if (params.projectId && !this.validateId(params.projectId)) {
      errors.push('Invalid project ID format');
    }

    if (
      params.type &&
      !['parada', 'manutencao', 'partida'].includes(params.type)
    ) {
      errors.push('Invalid activity type');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateCreateProjectInput(projectData) {
    const errors = [];

    if (!projectData.name || projectData.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (projectData.name && projectData.name.length > 100) {
      errors.push('Project name too long (max 100 characters)');
    }

    if (projectData.description && projectData.description.length > 500) {
      errors.push('Project description too long (max 500 characters)');
    }

    if (
      projectData.budget &&
      (isNaN(projectData.budget) || projectData.budget < 0)
    ) {
      errors.push('Budget must be a positive number');
    }

    if (
      projectData.priority &&
      !['low', 'medium', 'high', 'urgent'].includes(projectData.priority)
    ) {
      errors.push('Invalid priority level');
    }

    if (
      projectData.status &&
      ![
        'draft',
        'active',
        'completed',
        'cancelled',
        'on-hold',
        'archived',
      ].includes(projectData.status)
    ) {
      errors.push('Invalid status');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUpdateProjectInput(updateData) {
    const errors = [];

    if (
      updateData.name !== undefined &&
      (!updateData.name || updateData.name.trim().length === 0)
    ) {
      errors.push('Project name cannot be empty');
    }

    if (updateData.name && updateData.name.length > 100) {
      errors.push('Project name too long (max 100 characters)');
    }

    if (updateData.description && updateData.description.length > 500) {
      errors.push('Project description too long (max 500 characters)');
    }

    if (
      updateData.budget !== undefined &&
      (isNaN(updateData.budget) || updateData.budget < 0)
    ) {
      errors.push('Budget must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateAddActivityInput(activityData) {
    const errors = [];

    if (!activityData.name || activityData.name.trim().length === 0) {
      errors.push('Activity name is required');
    }

    if (
      !activityData.type ||
      !['parada', 'manutencao', 'partida'].includes(activityData.type)
    ) {
      errors.push('Valid activity type is required');
    }

    if (
      activityData.planned !== undefined &&
      (isNaN(activityData.planned) || activityData.planned < 0)
    ) {
      errors.push('Planned value must be a positive number');
    }

    if (
      activityData.real !== undefined &&
      (isNaN(activityData.real) || activityData.real < 0)
    ) {
      errors.push('Real value must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = ProjectUseCasesClean;
