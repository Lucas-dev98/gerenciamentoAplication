const Project = require('../models/projectModels');
const logger = require('../utils/logger');

const createProject = async (projectData) => {
  try {
    logger.info('PROJECT_SERVICE: Starting project creation', {
      projectName: projectData.name,
      owner: projectData.owner,
      status: projectData.status,
      priority: projectData.priority,
    });

    const project = new Project(projectData);
    await project.save();

    logger.info('PROJECT_SERVICE: Project created successfully', {
      projectId: project._id,
      projectName: project.name,
      owner: project.owner,
      status: project.status,
    });

    return project;
  } catch (error) {
    logger.error('PROJECT_SERVICE: Failed to create project', {
      error: error.message,
      stack: error.stack,
      projectName: projectData?.name,
      owner: projectData?.owner,
      errorCode: error.code,
      validationErrors: error.errors,
    });

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const duplicateError = new Error(`Projeto com este ${field} já existe`);
      duplicateError.type = 'DUPLICATE_ERROR';
      duplicateError.field = field;
      throw duplicateError;
    }

    if (error.name === 'ValidationError') {
      const validationError = new Error('Dados de projeto inválidos');
      validationError.type = 'VALIDATION_ERROR';
      validationError.details = Object.values(error.errors).map(
        (err) => err.message
      );
      throw validationError;
    }

    throw error;
  }
};

const getAllProjects = async (filters = {}) => {
  try {
    logger.info('PROJECT_SERVICE: Starting projects retrieval', {
      filters,
      filtersCount: Object.keys(filters).length,
    });

    const query = {};

    // Aplicar filtros
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.owner) query.owner = filters.owner;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const projects = await Project.find(query)
      .populate('owner', 'username email fullName')
      .populate('team.user', 'username email fullName')
      .sort({ createdAt: -1 });

    logger.info('PROJECT_SERVICE: Projects retrieved successfully', {
      count: projects.length,
      appliedFilters: query,
      filtersCount: Object.keys(query).length,
    });

    return projects;
  } catch (error) {
    logger.error('PROJECT_SERVICE: Failed to retrieve projects', {
      error: error.message,
      stack: error.stack,
      filters,
      errorCode: error.code,
    });

    throw error;
  }
};

const getProjectById = async (id) => {
  try {
    logger.info('PROJECT_SERVICE: Starting project retrieval by ID', {
      projectId: id,
    });

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('PROJECT_SERVICE: Invalid project ID format', {
        projectId: id,
      });

      const invalidIdError = new Error('ID de projeto inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const project = await Project.findById(id)
      .populate('owner', 'username email fullName')
      .populate('team.user', 'username email fullName')
      .lean(); // Adicionar .lean() para garantir que todos os campos sejam retornados

    if (project) {
      logger.info('PROJECT_SERVICE: Project retrieved successfully', {
        projectId: project._id,
        projectName: project.name,
        owner: project.owner?._id,
        teamSize: project.team?.length || 0,
        activitiesCount: project.activities?.length || 0, // Log adicional
        hasMetadata: Boolean(project.metadata), // Log adicional
      });
    } else {
      logger.warn('PROJECT_SERVICE: Project not found', {
        projectId: id,
      });
    }

    return project;
  } catch (error) {
    if (error.type === 'INVALID_ID') {
      throw error;
    }

    logger.error('PROJECT_SERVICE: Failed to retrieve project by ID', {
      error: error.message,
      stack: error.stack,
      projectId: id,
      errorCode: error.code,
    });

    throw error;
  }
};

const updateProject = async (id, updateData) => {
  try {
    logger.info('PROJECT_SERVICE: Starting project update', {
      projectId: id,
      updateFields: Object.keys(updateData),
      fieldsCount: Object.keys(updateData).length,
    });

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('PROJECT_SERVICE: Invalid project ID format for update', {
        projectId: id,
      });

      const invalidIdError = new Error('ID de projeto inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('owner', 'username email fullName')
      .populate('team.user', 'username email fullName');

    if (project) {
      logger.info('PROJECT_SERVICE: Project updated successfully', {
        projectId: project._id,
        projectName: project.name,
        updatedFields: Object.keys(updateData),
        fieldsCount: Object.keys(updateData).length,
      });
    } else {
      logger.warn('PROJECT_SERVICE: Project not found for update', {
        projectId: id,
      });
    }

    return project;
  } catch (error) {
    if (error.type === 'INVALID_ID') {
      throw error;
    }

    logger.error('PROJECT_SERVICE: Failed to update project', {
      error: error.message,
      stack: error.stack,
      projectId: id,
      updateFields: Object.keys(updateData || {}),
      errorCode: error.code,
      validationErrors: error.errors,
    });

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationError = new Error('Dados de atualização inválidos');
      validationError.type = 'VALIDATION_ERROR';
      validationError.details = Object.values(error.errors).map(
        (err) => err.message
      );
      throw validationError;
    }

    throw error;
  }
};

const deleteProject = async (id) => {
  try {
    logger.info('PROJECT_SERVICE: Starting project deletion', {
      projectId: id,
    });

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('PROJECT_SERVICE: Invalid project ID format for deletion', {
        projectId: id,
      });

      const invalidIdError = new Error('ID de projeto inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const project = await Project.findById(id);
    if (!project) {
      logger.warn('PROJECT_SERVICE: Project not found for deletion', {
        projectId: id,
      });
      return null;
    }

    await Project.findByIdAndDelete(id);

    logger.info('PROJECT_SERVICE: Project deleted successfully', {
      projectId: project._id,
      projectName: project.name,
      owner: project.owner,
    });

    return project;
  } catch (error) {
    if (error.type === 'INVALID_ID') {
      throw error;
    }

    logger.error('PROJECT_SERVICE: Failed to delete project', {
      error: error.message,
      stack: error.stack,
      projectId: id,
      errorCode: error.code,
    });

    throw error;
  }
};

const getProjectsByUser = async (userId) => {
  try {
    logger.info('PROJECT_SERVICE: Starting user projects retrieval', {
      userId,
    });

    // Validate ObjectId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('PROJECT_SERVICE: Invalid user ID format', {
        userId,
      });

      const invalidIdError = new Error('ID de usuário inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const projects = await Project.find({
      $or: [{ owner: userId }, { 'team.user': userId }],
    })
      .populate('owner', 'username email fullName')
      .populate('team.user', 'username email fullName')
      .sort({ createdAt: -1 });

    logger.info('PROJECT_SERVICE: User projects retrieved successfully', {
      userId,
      count: projects.length,
      projectIds: projects.map((p) => p._id),
    });

    return projects;
  } catch (error) {
    if (error.type === 'INVALID_ID') {
      throw error;
    }

    logger.error('PROJECT_SERVICE: Failed to retrieve user projects', {
      error: error.message,
      stack: error.stack,
      userId,
      errorCode: error.code,
    });

    throw error;
  }
};

const addTeamMember = async (projectId, userId, role = 'developer') => {
  try {
    logger.info('PROJECT_SERVICE: Starting team member addition', {
      projectId,
      userId,
      role,
    });

    // Validate ObjectId formats
    if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn(
        'PROJECT_SERVICE: Invalid project ID format for team member addition',
        {
          projectId,
        }
      );

      const invalidIdError = new Error('ID de projeto inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn(
        'PROJECT_SERVICE: Invalid user ID format for team member addition',
        {
          userId,
        }
      );

      const invalidIdError = new Error('ID de usuário inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn(
        'PROJECT_SERVICE: Project not found for team member addition',
        {
          projectId,
        }
      );
      throw new Error('Project not found');
    }

    // Verificar se o usuário já está na equipe
    const existingMember = project.team.find(
      (member) => member.user.toString() === userId
    );
    if (existingMember) {
      logger.warn('PROJECT_SERVICE: User already in team', {
        projectId,
        userId,
        existingRole: existingMember.role,
      });
      throw new Error('User is already a team member');
    }

    project.team.push({ user: userId, role });
    await project.save();

    logger.info('PROJECT_SERVICE: Team member added successfully', {
      projectId: project._id,
      projectName: project.name,
      userId,
      role,
      teamSize: project.team.length,
    });

    return project;
  } catch (error) {
    if (
      error.type === 'INVALID_ID' ||
      error.message === 'Project not found' ||
      error.message === 'User is already a team member'
    ) {
      throw error;
    }

    logger.error('PROJECT_SERVICE: Failed to add team member', {
      error: error.message,
      stack: error.stack,
      projectId,
      userId,
      role,
      errorCode: error.code,
    });

    throw error;
  }
};

const removeTeamMember = async (projectId, userId) => {
  try {
    logger.info('PROJECT_SERVICE: Starting team member removal', {
      projectId,
      userId,
    });

    // Validate ObjectId formats
    if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn(
        'PROJECT_SERVICE: Invalid project ID format for team member removal',
        {
          projectId,
        }
      );

      const invalidIdError = new Error('ID de projeto inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn(
        'PROJECT_SERVICE: Invalid user ID format for team member removal',
        {
          userId,
        }
      );

      const invalidIdError = new Error('ID de usuário inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      logger.warn(
        'PROJECT_SERVICE: Project not found for team member removal',
        {
          projectId,
        }
      );
      throw new Error('Project not found');
    }

    const originalTeamSize = project.team.length;
    const memberExists = project.team.some(
      (member) => member.user.toString() === userId
    );

    project.team = project.team.filter(
      (member) => member.user.toString() !== userId
    );

    const newTeamSize = project.team.length;

    if (originalTeamSize === newTeamSize && !memberExists) {
      logger.warn('PROJECT_SERVICE: User was not in team', {
        projectId,
        userId,
      });
    }

    await project.save();

    logger.info('PROJECT_SERVICE: Team member removal completed', {
      projectId: project._id,
      projectName: project.name,
      userId,
      originalTeamSize,
      newTeamSize,
      memberWasRemoved: originalTeamSize > newTeamSize,
    });

    return project;
  } catch (error) {
    if (error.type === 'INVALID_ID' || error.message === 'Project not found') {
      throw error;
    }

    logger.error('PROJECT_SERVICE: Failed to remove team member', {
      error: error.message,
      stack: error.stack,
      projectId,
      userId,
      errorCode: error.code,
    });

    throw error;
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByUser,
  addTeamMember,
  removeTeamMember,
};
