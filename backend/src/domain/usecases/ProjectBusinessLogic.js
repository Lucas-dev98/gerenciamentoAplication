/**
 * Project Use Cases
 * Contains all business logic for project management
 *
 * @author EPU-Gestão Team
 * @version 3.0.0
 */

const {
  Project,
  ProjectStatus,
  ProjectPriority,
} = require('../entities/ProjectEntity');
// const { Logger } = require('../../infrastructure/logging/Logger'); // Commented out - Logger not implemented yet

/**
 * Project Use Cases Implementation
 * Implements business rules and orchestrates domain operations
 */
class ProjectUseCases {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
    console = {};
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Project>} Created project
   */
  async createProject(projectData) {
    console.info('Creating new project:', { name: projectData.name });

    // Create project entity
    const project = new Project({
      id: null, // Will be set by repository
      ...projectData,
    });

    // Validate project
    const validation = project.validate();
    if (!validation.isValid) {
      console.error('Project validation failed:', validation.errors);
      throw new Error(`Invalid project data: ${validation.errors.join(', ')}`);
    }

    // Save project
    const savedProject = await this.projectRepository.create(project);

    console.info('Project created successfully:', {
      id: savedProject.id,
      name: savedProject.name,
    });
    return savedProject;
  }

  /**
   * Get project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Project|null>} Project or null if not found
   */
  async getProjectById(projectId) {
    console.info('Getting project by ID:', { projectId });

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      console.warn('Project not found:', { projectId });
      return null;
    }

    console.info('Project retrieved successfully:', {
      id: project.id,
      name: project.name,
    });
    return project;
  }

  /**
   * Get all projects with optional filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array<Project>>} List of projects
   */
  async getAllProjects(filters = {}) {
    console.info('Getting all projects:', { filters });

    const projects = await this.projectRepository.findAll(filters);

    console.info('Projects retrieved successfully:', {
      count: projects.length,
    });
    return projects;
  }

  /**
   * Update project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Project>} Updated project
   */
  async updateProject(projectId, updateData) {
    console.info('Updating project:', { projectId, updateData });

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get existing project
    const existingProject = await this.projectRepository.findById(projectId);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Create updated project entity
    const updatedProject = new Project({
      ...existingProject.toJSON(),
      ...updateData,
      id: projectId,
      updatedAt: new Date(),
    });

    // Validate updated project
    const validation = updatedProject.validate();
    if (!validation.isValid) {
      console.error('Project validation failed:', validation.errors);
      throw new Error(`Invalid project data: ${validation.errors.join(', ')}`);
    }

    // Save updated project
    const savedProject = await this.projectRepository.update(
      projectId,
      updatedProject
    );

    console.info('Project updated successfully:', {
      id: savedProject.id,
      name: savedProject.name,
    });
    return savedProject;
  }

  /**
   * Delete project
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProject(projectId) {
    console.info('Deleting project:', { projectId });

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Check if project exists
    const existingProject = await this.projectRepository.findById(projectId);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Delete project
    const deleted = await this.projectRepository.delete(projectId);

    console.info('Project deleted successfully:', { projectId });
    return deleted;
  }

  /**
   * Add activity to project
   * @param {string} projectId - Project ID
   * @param {Object} activityData - Activity data
   * @returns {Promise<Project>} Updated project
   */
  async addProjectActivity(projectId, activityData) {
    console.info('Adding activity to project:', {
      projectId,
      activityData,
    });

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get existing project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Add activity to project
    project.addActivity({
      id: null, // Will be generated
      ...activityData,
    });

    // Save updated project
    const savedProject = await this.projectRepository.update(
      projectId,
      project
    );

    console.info('Activity added successfully:', {
      projectId,
      activityName: activityData.name,
    });
    return savedProject;
  }

  /**
   * Update project activity
   * @param {string} projectId - Project ID
   * @param {string} activityId - Activity ID
   * @param {Object} updateData - Activity update data
   * @returns {Promise<Project>} Updated project
   */
  async updateProjectActivity(projectId, activityId, updateData) {
    console.info('Updating project activity:', {
      projectId,
      activityId,
      updateData,
    });

    if (!projectId || !activityId) {
      throw new Error('Project ID and Activity ID are required');
    }

    // Get existing project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Update activity
    project.updateActivity(activityId, updateData);

    // Save updated project
    const savedProject = await this.projectRepository.update(
      projectId,
      project
    );

    console.info('Activity updated successfully:', {
      projectId,
      activityId,
    });
    return savedProject;
  }

  /**
   * Import project from CSV
   * @param {Buffer} csvBuffer - CSV file buffer
   * @param {Object} metadata - Project metadata
   * @returns {Promise<Project>} Created project
   */
  async importProjectFromCSV(csvBuffer, metadata) {
    console.info('Importing project from CSV:', { metadata });

    // Process CSV and create project data
    const projectData = await this.processCSVFile(csvBuffer, metadata);

    // Create project
    const project = await this.createProject(projectData);

    console.info('Project imported from CSV successfully:', {
      id: project.id,
      name: project.name,
    });
    return project;
  }

  /**
   * Export project to CSV
   * @param {string} projectId - Project ID
   * @returns {Promise<Buffer>} CSV file buffer
   */
  async exportProjectToCSV(projectId) {
    console.info('Exporting project to CSV:', { projectId });

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Generate CSV
    const csvBuffer = await this.generateCSVFromProject(project);

    console.info('Project exported to CSV successfully:', { projectId });
    return csvBuffer;
  }

  /**
   * Get project statistics
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStatistics(projectId) {
    console.info('Getting project statistics:', { projectId });

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get project
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const statistics = project.getStatistics();

    console.info('Project statistics retrieved successfully:', {
      projectId,
      statistics,
    });
    return statistics;
  }

  /**
   * Get projects statistics overview
   * @returns {Promise<Object>} Overall statistics
   */
  async getProjectsOverview() {
    console.info('Getting projects overview');

    const projects = await this.projectRepository.findAll();

    const overview = {
      total: projects.length,
      byStatus: {},
      byPriority: {},
      totalBudget: 0,
      averageProgress: 0,
      overdue: 0,
    };

    // Calculate statistics
    Object.values(ProjectStatus).forEach((status) => {
      overview.byStatus[status] = projects.filter(
        (p) => p.status === status
      ).length;
    });

    Object.values(ProjectPriority).forEach((priority) => {
      overview.byPriority[priority] = projects.filter(
        (p) => p.priority === priority
      ).length;
    });

    overview.totalBudget = projects.reduce(
      (sum, p) => sum + (p.budget || 0),
      0
    );
    overview.averageProgress =
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + p.getProgress(), 0) /
              projects.length
          )
        : 0;
    overview.overdue = projects.filter((p) => p.isOverdue()).length;

    console.info('Projects overview retrieved successfully:', { overview });
    return overview;
  }

  /**
   * Process CSV file and extract project data
   * @private
   * @param {Buffer} csvBuffer - CSV file buffer
   * @param {Object} metadata - Project metadata
   * @returns {Promise<Object>} Project data
   */
  async processCSVFile(csvBuffer, metadata) {
    // Implementation for CSV processing
    // This would parse the CSV and create activities based on the format
    // For now, returning a basic structure

    return {
      name: metadata.name || 'Imported Project',
      description: metadata.description || 'Project imported from CSV',
      status: ProjectStatus.DRAFT,
      priority: metadata.priority || ProjectPriority.MEDIUM,
      activities: [], // Would be populated from CSV data
      metadata: {
        importedAt: new Date(),
        source: 'csv',
        ...metadata,
      },
    };
  }

  /**
   * Generate CSV from project data
   * @private
   * @param {Project} project - Project entity
   * @returns {Promise<Buffer>} CSV buffer
   */
  async generateCSVFromProject(project) {
    // Implementation for CSV generation
    // This would convert project activities to CSV format

    const csvData = [
      'Nome,Tipo,Planejado,Real,Status,Descrição',
      ...project.activities.map(
        (activity) =>
          `"${activity.name}","${activity.type}",${activity.planned},${activity.real},"${activity.status}","${activity.description}"`
      ),
    ].join('\n');

    return Buffer.from(csvData, 'utf8');
  }
}

module.exports = { ProjectUseCases };
