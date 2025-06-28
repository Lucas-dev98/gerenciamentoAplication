const projectService = require('../services/projectServices');
const logger = require('../utils/logger');
const csvProjectProcessor = require('../services/csvProjectProcessor');
const FrentesService = require('../services/frentesService');

// Validação de dados de entrada para criação de projeto
const validateProjectData = (name, description) => {
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Nome do projeto deve ter pelo menos 3 caracteres');
  }

  if (description && description.length > 500) {
    errors.push('Descrição deve ter no máximo 500 caracteres');
  }

  return errors;
};

const createProject = async (req, res, next) => {
  const action = 'CREATE_PROJECT';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting project creation`, {
      userId: req.user?.id || 'anonymous',
      body: { ...req.body, sensitive: 'redacted' },
    });

    const {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      deadline,
      budget,
      tags,
    } = req.body;

    // Validar dados obrigatórios
    const validationErrors = validateProjectData(name, description);
    if (validationErrors.length > 0) {
      logger.warn(`${action}: Validation failed`, {
        errors: validationErrors,
        userId: req.user?.id || 'anonymous',
      });

      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Dados de entrada inválidos',
        details: validationErrors,
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Por enquanto, usar um owner fixo (em produção viria do token JWT)
    const projectData = {
      name: name.trim(),
      description: description?.trim(),
      status: status || 'planning',
      priority: priority || 'medium',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      deadline: deadline ? new Date(deadline) : null,
      budget: budget || 0,
      tags: tags || [],
      owner: req.user?.id || '60d5ecb54b24a03d1c8b4567', // ID fictício para teste
    };

    const project = await projectService.createProject(projectData);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Project created successfully`, {
      projectId: project._id,
      projectName: project.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(201).json({
      status: 'success',
      message: 'Projeto criado com sucesso',
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          startDate: project.startDate,
          endDate: project.endDate,
          deadline: project.deadline,
          budget: project.budget,
          tags: project.tags,
          progress: project.progress,
          createdAt: project.createdAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to create project`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  const action = 'GET_ALL_PROJECTS';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting projects retrieval`, {
      query: req.query,
      userId: req.user?.id || 'anonymous',
    });

    const { status, priority, owner, isActive } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (owner) filters.owner = owner;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const projects = await projectService.getAllProjects(filters);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Projects retrieved successfully`, {
      count: projects.length,
      filters,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Projetos listados com sucesso',
      data: {
        count: projects.length,
        projects: projects.map((project) => ({
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          startDate: project.startDate,
          endDate: project.endDate,
          deadline: project.deadline,
          budget: project.budget,
          progress: project.progress,
          isOverdue: project.isOverdue,
          estimatedDuration: project.estimatedDuration,
          owner: project.owner,
          teamSize: project.team.length,
          tags: project.tags,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve projects`, {
      error: error.message,
      stack: error.stack,
      query: req.query,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  const action = 'GET_PROJECT_BY_ID';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting project retrieval`, {
      projectId: id,
      userId: req.user?.id || 'anonymous',
    });

    const project = await projectService.getProjectById(id);

    if (!project) {
      logger.warn(`${action}: Project not found`, {
        projectId: id,
        userId: req.user?.id || 'anonymous',
      });

      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Projeto não encontrado',
        details: [`Projeto com ID ${id} não foi encontrado`],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: Project retrieved successfully`, {
      projectId: project._id,
      projectName: project.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Projeto encontrado',
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          startDate: project.startDate,
          endDate: project.endDate,
          deadline: project.deadline,
          budget: project.budget,
          progress: project.progress,
          isOverdue: project.isOverdue,
          estimatedDuration: project.estimatedDuration,
          owner: project.owner,
          team: project.team,
          tags: project.tags,
          isActive: project.isActive,
          // Adicionar activities e metadata que estavam faltando
          activities: project.activities || [],
          metadata: project.metadata || {},
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve project`, {
      error: error.message,
      stack: error.stack,
      projectId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  const action = 'UPDATE_PROJECT';
  const startTime = Date.now();

  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.info(`${action}: Starting project update`, {
      projectId: id,
      updateFields: Object.keys(updateData),
      userId: req.user?.id || 'anonymous',
    });

    // Validar dados se nome estiver sendo atualizado
    if (updateData.name) {
      const validationErrors = validateProjectData(
        updateData.name,
        updateData.description
      );
      if (validationErrors.length > 0) {
        logger.warn(`${action}: Validation failed`, {
          errors: validationErrors,
          projectId: id,
          userId: req.user?.id || 'anonymous',
        });

        return res.status(400).json({
          status: 'error',
          type: 'VALIDATION_ERROR',
          message: 'Dados de entrada inválidos',
          details: validationErrors,
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }
    }

    const updatedProject = await projectService.updateProject(id, updateData);

    if (!updatedProject) {
      logger.warn(`${action}: Project not found for update`, {
        projectId: id,
        userId: req.user?.id || 'anonymous',
      });

      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Projeto não encontrado',
        details: [`Projeto com ID ${id} não foi encontrado para atualização`],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: Project updated successfully`, {
      projectId: updatedProject._id,
      projectName: updatedProject.name,
      updatedFields: Object.keys(updateData),
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Projeto atualizado com sucesso',
      data: {
        project: {
          id: updatedProject._id,
          name: updatedProject.name,
          description: updatedProject.description,
          status: updatedProject.status,
          priority: updatedProject.priority,
          startDate: updatedProject.startDate,
          endDate: updatedProject.endDate,
          deadline: updatedProject.deadline,
          budget: updatedProject.budget,
          progress: updatedProject.progress,
          isOverdue: updatedProject.isOverdue,
          estimatedDuration: updatedProject.estimatedDuration,
          owner: updatedProject.owner,
          team: updatedProject.team,
          tags: updatedProject.tags,
          isActive: updatedProject.isActive,
          updatedAt: updatedProject.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to update project`, {
      error: error.message,
      stack: error.stack,
      projectId: req.params.id,
      updateData: Object.keys(req.body),
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  const action = 'DELETE_PROJECT';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting project deletion`, {
      projectId: id,
      userId: req.user?.id || 'anonymous',
    });

    const deletedProject = await projectService.deleteProject(id);

    if (!deletedProject) {
      logger.warn(`${action}: Project not found for deletion`, {
        projectId: id,
        userId: req.user?.id || 'anonymous',
      });

      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Projeto não encontrado',
        details: [`Projeto com ID ${id} não foi encontrado para exclusão`],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: Project deleted successfully`, {
      projectId: deletedProject._id,
      projectName: deletedProject.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Projeto deletado com sucesso',
      data: {
        project: {
          id: deletedProject._id,
          name: deletedProject.name,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to delete project`, {
      error: error.message,
      stack: error.stack,
      projectId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const getProjectsByUser = async (req, res, next) => {
  const action = 'GET_PROJECTS_BY_USER';
  const startTime = Date.now();

  try {
    const { userId } = req.params;

    logger.info(`${action}: Starting user projects retrieval`, {
      targetUserId: userId,
      requestUserId: req.user?.id || 'anonymous',
    });

    const projects = await projectService.getProjectsByUser(userId);

    const duration = Date.now() - startTime;
    logger.info(`${action}: User projects retrieved successfully`, {
      targetUserId: userId,
      count: projects.length,
      requestUserId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Projetos do usuário listados com sucesso',
      data: {
        count: projects.length,
        projects: projects.map((project) => ({
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          progress: project.progress,
          isOverdue: project.isOverdue,
          role:
            project.team.find((member) => member.user._id.toString() === userId)
              ?.role || 'owner',
          createdAt: project.createdAt,
        })),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve user projects`, {
      error: error.message,
      stack: error.stack,
      targetUserId: req.params.userId,
      requestUserId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const addTeamMember = async (req, res, next) => {
  const action = 'ADD_TEAM_MEMBER';
  const startTime = Date.now();

  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    logger.info(`${action}: Starting team member addition`, {
      projectId: id,
      newMemberUserId: userId,
      role: role || 'developer',
      requestUserId: req.user?.id || 'anonymous',
    });

    if (!userId) {
      logger.warn(`${action}: Missing required userId`, {
        projectId: id,
        requestUserId: req.user?.id || 'anonymous',
      });

      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'ID do usuário é obrigatório',
        details: [
          'O campo userId é obrigatório para adicionar um membro à equipe',
        ],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const project = await projectService.addTeamMember(id, userId, role);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Team member added successfully`, {
      projectId: project._id,
      projectName: project.name,
      newMemberUserId: userId,
      role: role || 'developer',
      teamSize: project.team.length,
      requestUserId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Membro adicionado à equipe com sucesso',
      data: {
        project: {
          id: project._id,
          name: project.name,
          teamSize: project.team.length,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error.message === 'Project not found') {
      logger.warn(`${action}: Project not found`, {
        projectId: req.params.id,
        requestUserId: req.user?.id || 'anonymous',
        duration: `${duration}ms`,
      });

      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Projeto não encontrado',
        details: [`Projeto com ID ${req.params.id} não foi encontrado`],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    if (error.message === 'User is already a team member') {
      logger.warn(`${action}: User already in team`, {
        projectId: req.params.id,
        userId: req.body.userId,
        requestUserId: req.user?.id || 'anonymous',
        duration: `${duration}ms`,
      });

      return res.status(409).json({
        status: 'error',
        type: 'CONFLICT',
        message: 'Usuário já é membro da equipe',
        details: ['O usuário já está na equipe deste projeto'],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    logger.error(`${action}: Failed to add team member`, {
      error: error.message,
      stack: error.stack,
      projectId: req.params.id,
      userId: req.body.userId,
      requestUserId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    next(error);
  }
};

const removeTeamMember = async (req, res, next) => {
  const action = 'REMOVE_TEAM_MEMBER';
  const startTime = Date.now();

  try {
    const { id, userId } = req.params;

    logger.info(`${action}: Starting team member removal`, {
      projectId: id,
      memberUserId: userId,
      requestUserId: req.user?.id || 'anonymous',
    });

    const project = await projectService.removeTeamMember(id, userId);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Team member removed successfully`, {
      projectId: project._id,
      projectName: project.name,
      removedMemberUserId: userId,
      teamSize: project.team.length,
      requestUserId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Membro removido da equipe com sucesso',
      data: {
        project: {
          id: project._id,
          name: project.name,
          teamSize: project.team.length,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error.message === 'Project not found') {
      logger.warn(`${action}: Project not found`, {
        projectId: req.params.id,
        requestUserId: req.user?.id || 'anonymous',
        duration: `${duration}ms`,
      });

      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Projeto não encontrado',
        details: [`Projeto com ID ${req.params.id} não foi encontrado`],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    logger.error(`${action}: Failed to remove team member`, {
      error: error.message,
      stack: error.stack,
      projectId: req.params.id,
      userId: req.params.userId,
      requestUserId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    next(error);
  }
};

const uploadProjectFromCSV = async (req, res, next) => {
  const action = 'UPLOAD_PROJECT_CSV';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting CSV project upload`, {
      userId: req.user?.id || 'anonymous',
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
    });

    // Validar se arquivo foi enviado
    if (!req.file) {
      logger.warn(`${action}: No file uploaded`, {
        userId: req.user?.id || 'anonymous',
      });

      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Nenhum arquivo foi enviado',
        details: ['É necessário enviar um arquivo CSV para processar'],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Validar tipo de arquivo
    if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
      logger.warn(`${action}: Invalid file type`, {
        fileName: req.file.originalname,
        userId: req.user?.id || 'anonymous',
      });

      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Tipo de arquivo inválido',
        details: ['Apenas arquivos CSV são aceitos'],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const { projectName } = req.body;
    const nomeProject =
      projectName || req.file.originalname.replace('.csv', '');

    // Processar arquivo CSV
    const resultado = await csvProjectProcessor.processarArquivoCSV(
      req.file.path,
      nomeProject,
      req.user?.id || '60d5ecb54b24a03d1c8b4567'
    );

    // Limpar arquivo temporário
    try {
      require('fs').unlinkSync(req.file.path);
    } catch (cleanupError) {
      logger.warn('Erro ao limpar arquivo temporário', {
        error: cleanupError.message,
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: CSV project uploaded successfully`, {
      projectId: resultado.project._id,
      projectName: resultado.project.name,
      totalActivities: resultado.estatisticas.totalAtividades,
      progressoGeral: resultado.estatisticas.progressoGeral,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(201).json({
      status: 'success',
      message: 'Projeto criado com sucesso a partir do CSV',
      data: {
        project: {
          id: resultado.project._id,
          name: resultado.project.name,
          description: resultado.project.description,
          status: resultado.project.status,
          priority: resultado.project.priority,
          progress: resultado.project.progress,
          createdAt: resultado.project.createdAt,
        },
        estatisticas: resultado.estatisticas,
        blocos: {
          parada: resultado.blocos.parada.length,
          manutencao: resultado.blocos.manutencao.length,
          partida: resultado.blocos.partida.length,
        },
        processamento: {
          totalAtividades: resultado.estatisticas.totalAtividades,
          atividadesCompletas: resultado.estatisticas.atividadesCompletas,
          progressoGeral: `${resultado.estatisticas.progressoGeral}%`,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Limpar arquivo em caso de erro
    if (req.file) {
      try {
        require('fs').unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.warn('Erro ao limpar arquivo após falha', {
          error: cleanupError.message,
        });
      }
    }

    logger.error(`${action}: Failed to upload CSV project`, {
      error: error.message,
      stack: error.stack,
      fileName: req.file?.originalname,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// NOVAS FUNCIONALIDADES BASEADAS NO FLASK app.py

// API para carregar frentes de procedimento de parada (baseado no Flask)
const getProcedimentoParada = async (req, res, next) => {
  const action = 'GET_PROCEDIMENTO_PARADA';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Carregando frentes de procedimento de parada`);

    const frentes = await FrentesService.loadFrentesByBloco(
      'procedimento_parada'
    );
    const statistics = FrentesService.calculateStatistics(frentes);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Success`, {
      count: frentes.length,
      duration: `${duration}ms`,
      statistics,
    });

    res.status(200).json({
      status: 'success',
      message: 'Frentes de procedimento de parada carregadas com sucesso',
      data: frentes,
      statistics,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error(`${action}: Error`, {
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - startTime}ms`,
    });
    next(error);
  }
};

// API para carregar frentes de manutenção (baseado no Flask)
const getManutencao = async (req, res, next) => {
  const action = 'GET_MANUTENCAO';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Carregando frentes de manutenção`);

    const frentes = await FrentesService.loadFrentesByBloco('manutencao');
    const statistics = FrentesService.calculateStatistics(frentes);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Success`, {
      count: frentes.length,
      duration: `${duration}ms`,
      statistics,
    });

    res.status(200).json({
      status: 'success',
      message: 'Frentes de manutenção carregadas com sucesso',
      data: frentes,
      statistics,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error(`${action}: Error`, {
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - startTime}ms`,
    });
    next(error);
  }
};

// API para carregar frentes de procedimento de partida (baseado no Flask)
const getProcedimentoPartida = async (req, res, next) => {
  const action = 'GET_PROCEDIMENTO_PARTIDA';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Carregando frentes de procedimento de partida`);

    const frentes = await FrentesService.loadFrentesByBloco(
      'procedimento_partida'
    );
    const statistics = FrentesService.calculateStatistics(frentes);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Success`, {
      count: frentes.length,
      duration: `${duration}ms`,
      statistics,
    });

    res.status(200).json({
      status: 'success',
      message: 'Frentes de procedimento de partida carregadas com sucesso',
      data: frentes,
      statistics,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error(`${action}: Error`, {
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - startTime}ms`,
    });
    next(error);
  }
};

// API para carregar todas as frentes organizadas por bloco
const getAllFrentes = async (req, res, next) => {
  const action = 'GET_ALL_FRENTES';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Carregando todas as frentes de trabalho`);

    const allFrentes = await FrentesService.getAllFrentes();

    // Calcular estatísticas por bloco
    const statistics = {
      procedimento_parada: FrentesService.calculateStatistics(
        allFrentes.procedimento_parada
      ),
      manutencao: FrentesService.calculateStatistics(allFrentes.manutencao),
      procedimento_partida: FrentesService.calculateStatistics(
        allFrentes.procedimento_partida
      ),
    };

    // Estatística geral
    const totalFrentes = Object.values(allFrentes).flat();
    const generalStats = FrentesService.calculateStatistics(totalFrentes);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Success`, {
      totalCount: totalFrentes.length,
      duration: `${duration}ms`,
      generalStats,
    });

    res.status(200).json({
      status: 'success',
      message: 'Todas as frentes carregadas com sucesso',
      data: allFrentes,
      statistics,
      generalStats,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error(`${action}: Error`, {
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - startTime}ms`,
    });
    next(error);
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
  uploadProjectFromCSV,
  getProcedimentoParada,
  getManutencao,
  getProcedimentoPartida,
  getAllFrentes,
};
