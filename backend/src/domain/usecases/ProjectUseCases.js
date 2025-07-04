// Use Cases - Project Use Cases
const Project = require('../entities/Project');
const Activity = require('../entities/Activity');

class ProjectUseCases {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async getAllProjects() {
    try {
      const projects = await this.projectRepository.findAll();
      return {
        success: true,
        data: projects,
        message: 'Projects retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve projects',
      };
    }
  }

  async getProjectById(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await this.projectRepository.findById(id);
      if (!project) {
        return {
          success: false,
          message: 'Project not found',
        };
      }

      return {
        success: true,
        data: project,
        message: 'Project retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve project',
      };
    }
  }

  async getProjectActivitiesByType(projectId, type) {
    try {
      const projectResult = await this.getProjectById(projectId);
      if (!projectResult.success) {
        return projectResult;
      }

      const project = projectResult.data;
      const activities = project.getActivitiesByType(type);

      return {
        success: true,
        data: activities,
        message: `${type} activities retrieved successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to retrieve ${type} activities`,
      };
    }
  }

  async getProjectFrentes(projectId) {
    try {
      const projectResult = await this.getProjectById(projectId);
      if (!projectResult.success) {
        return projectResult;
      }

      const project = projectResult.data;
      const frentes = {
        parada: project.getActivitiesByType('parada'),
        manutencao: project.getActivitiesByType('manutencao'),
        partida: project.getActivitiesByType('partida'),
      };

      return {
        success: true,
        data: frentes,
        message: 'Project frentes retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve project frentes',
      };
    }
  }

  async getProjectStatistics(projectId) {
    try {
      const projectResult = await this.getProjectById(projectId);
      if (!projectResult.success) {
        return projectResult;
      }

      const project = projectResult.data;
      const statistics = project.getStatistics();

      return {
        success: true,
        data: statistics,
        message: 'Project statistics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve project statistics',
      };
    }
  }

  async createProject(projectData) {
    try {
      // Validate input
      if (!projectData.name || projectData.name.trim().length === 0) {
        throw new Error('Project name is required');
      }

      // Create activities with proper structure
      const activities = (projectData.activities || []).map(
        (activityData) =>
          new Activity({
            ...activityData,
            id: activityData.id || this.generateId(),
          })
      );

      // Create project entity
      const project = new Project({
        ...projectData,
        id: projectData.id || this.generateId(),
        activities,
      });

      // Validate business rules
      if (!project.isValid()) {
        throw new Error('Invalid project data');
      }

      // Update progress
      project.updateProgress();

      // Save to repository
      const savedProject = await this.projectRepository.save(project);

      return {
        success: true,
        data: savedProject,
        message: 'Project created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create project',
      };
    }
  }

  async updateProject(id, projectData) {
    try {
      const existingProject = await this.projectRepository.findById(id);
      if (!existingProject) {
        return {
          success: false,
          message: 'Project not found',
        };
      }

      const updatedProject = new Project({
        ...existingProject,
        ...projectData,
        id,
        updatedAt: new Date(),
      });

      updatedProject.updateProgress();

      const savedProject = await this.projectRepository.update(
        id,
        updatedProject
      );

      return {
        success: true,
        data: savedProject,
        message: 'Project updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update project',
      };
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = ProjectUseCases;
