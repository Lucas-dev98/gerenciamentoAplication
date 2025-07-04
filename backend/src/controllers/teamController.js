/**
 * Team Controller - Clean Architecture Implementation
 *
 * Controller responsável pelo gerenciamento de equipes seguindo
 * os princípios de Clean Architecture e SOLID.
 *
 * Funcionalidades:
 * - CRUD completo de equipes
 * - Gestão de membros da equipe
 * - Associação de projetos às equipes
 * - Relatórios de equipe
 * - Validação de dados
 *
 * @version 3.0.0
 * @architecture Clean Architecture
 * @layer Interface/Controllers
 */

const Team = require('../models/teamModels');
const Member = require('../models/memberModels');
const logger = require('../utils/logger');

// Criar nova equipe
const createTeam = async (req, res, next) => {
  const action = 'CREATE_TEAM';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting team creation`, {
      userId: req.user?.id || 'anonymous',
      body: req.body,
    });

    const { name, description, department, color, budget, goals } = req.body;

    // Validação básica
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Nome da equipe deve ter pelo menos 3 caracteres',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    if (!department || department.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Departamento deve ter pelo menos 3 caracteres',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se já existe equipe com o mesmo nome
    const existingTeam = await Team.findOne({
      name: name.trim(),
      isActive: true,
    });

    if (existingTeam) {
      return res.status(409).json({
        status: 'error',
        type: 'CONFLICT_ERROR',
        message: 'Já existe uma equipe com este nome',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const teamData = {
      name: name.trim(),
      description: description?.trim(),
      department: department.trim(),
      color: color || '#3498db',
      budget: budget || 0,
      goals: goals || [],
      createdBy: req.user?.id || '60d5ecb54b24a03d1c8b4567', // ID fictício para teste
    };

    const team = await Team.create(teamData);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Team created successfully`, {
      teamId: team._id,
      teamName: team.name,
      department: team.department,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(201).json({
      status: 'success',
      message: 'Equipe criada com sucesso',
      data: {
        team: {
          _id: team._id,
          id: team._id, // Manter compatibilidade
          name: team.name,
          description: team.description,
          department: team.department,
          color: team.color,
          budget: team.budget,
          goals: team.goals,
          stats: team.stats,
          createdAt: team.createdAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to create team`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Listar todas as equipes
const getAllTeams = async (req, res, next) => {
  const action = 'GET_ALL_TEAMS';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting teams retrieval`, {
      query: req.query,
      userId: req.user?.id || 'anonymous',
    });

    const { department, isActive, includeStats } = req.query;

    const filters = { isActive: true };
    if (department) filters.department = department;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    let teamsQuery = Team.find(filters)
      .populate('manager', 'name position')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    const teams = await teamsQuery;

    // Se solicitado, incluir estatísticas detalhadas
    if (includeStats === 'true') {
      for (let team of teams) {
        await team.updateStats();
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`${action}: Teams retrieved successfully`, {
      count: teams.length,
      filters,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Equipes listadas com sucesso',
      data: {
        count: teams.length,
        teams: teams.map((team) => ({
          _id: team._id,
          id: team._id, // Manter compatibilidade
          name: team.name,
          description: team.description,
          department: team.department,
          color: team.color,
          budget: team.budget,
          manager: team.manager,
          stats: team.stats,
          goals: team.goals,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        })),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve teams`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Buscar equipe por ID
const getTeamById = async (req, res, next) => {
  const action = 'GET_TEAM_BY_ID';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting team retrieval`, {
      teamId: id,
      userId: req.user?.id || 'anonymous',
    });

    const team = await Team.findById(id)
      .populate('manager', 'name position matricula')
      .populate('createdBy', 'username email');

    if (!team) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Atualizar estatísticas
    await team.updateStats();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Team retrieved successfully`, {
      teamId: team._id,
      teamName: team.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Equipe encontrada com sucesso',
      data: {
        team: {
          _id: team._id,
          id: team._id, // Manter compatibilidade
          name: team.name,
          description: team.description,
          department: team.department,
          color: team.color,
          budget: team.budget,
          manager: team.manager,
          stats: team.stats,
          goals: team.goals,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve team`, {
      error: error.message,
      stack: error.stack,
      teamId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Atualizar equipe
const updateTeam = async (req, res, next) => {
  const action = 'UPDATE_TEAM';
  const startTime = Date.now();

  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info(`${action}: Starting team update`, {
      teamId: id,
      updates,
      userId: req.user?.id || 'anonymous',
    });

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Validações
    if (updates.name && updates.name.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Nome da equipe deve ter pelo menos 3 caracteres',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar nome duplicado (se mudou)
    if (updates.name && updates.name !== team.name) {
      const existingTeam = await Team.findOne({
        name: updates.name.trim(),
        isActive: true,
        _id: { $ne: id },
      });

      if (existingTeam) {
        return res.status(409).json({
          status: 'error',
          type: 'CONFLICT_ERROR',
          message: 'Já existe uma equipe com este nome',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }
    }

    // Atualizar campos permitidos
    const allowedUpdates = [
      'name',
      'description',
      'department',
      'color',
      'budget',
      'goals',
      'manager',
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        team[field] = updates[field];
      }
    });

    await team.save();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Team updated successfully`, {
      teamId: team._id,
      teamName: team.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Equipe atualizada com sucesso',
      data: {
        team: {
          _id: team._id,
          id: team._id, // Manter compatibilidade
          name: team.name,
          description: team.description,
          department: team.department,
          color: team.color,
          budget: team.budget,
          manager: team.manager,
          goals: team.goals,
          stats: team.stats,
          updatedAt: team.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to update team`, {
      error: error.message,
      stack: error.stack,
      teamId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Excluir equipe
const deleteTeam = async (req, res, next) => {
  const action = 'DELETE_TEAM';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting team deletion`, {
      teamId: id,
      userId: req.user?.id || 'anonymous',
    });

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se há membros na equipe
    const memberCount = await Member.countDocuments({
      team: id,
      isActive: true,
    });

    if (memberCount > 0) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: `Não é possível excluir equipe com ${memberCount} membro(s) ativo(s). Remova os membros primeiro.`,
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Soft delete
    team.isActive = false;
    await team.save();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Team deleted successfully`, {
      teamId: team._id,
      teamName: team.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Equipe excluída com sucesso',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to delete team`, {
      error: error.message,
      stack: error.stack,
      teamId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

/**
 * Exclusão em lote de equipes
 * Permite excluir múltiplas equipes de uma vez
 * Requer autenticação
 */
const deleteTeamsBatch = async (req, res, next) => {
  const action = 'DELETE_TEAMS_BATCH';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting batch team deletion`, {
      userId: req.user?.id || 'anonymous',
      body: req.body,
    });

    const { teamIds } = req.body;

    // Validação básica
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'É necessário fornecer um array de IDs de equipes',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    if (teamIds.length > 50) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Máximo de 50 equipes por operação',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se as equipes existem
    const existingTeams = await Team.find({
      _id: { $in: teamIds },
      isActive: true,
    });

    if (existingTeams.length === 0) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Nenhuma equipe encontrada para exclusão',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Executar exclusão em lote (soft delete)
    const updateResult = await Team.updateMany(
      { _id: { $in: teamIds }, isActive: true },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: req.user?.id || '60d5ecb54b24a03d1c8b4567',
        },
      }
    );

    const duration = Date.now() - startTime;
    logger.info(`${action}: Batch team deletion completed`, {
      deletedCount: updateResult.modifiedCount,
      requestedCount: teamIds.length,
      foundCount: existingTeams.length,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(200).json({
      status: 'success',
      message: `${updateResult.modifiedCount} equipe(s) excluída(s) com sucesso`,
      data: {
        deletedCount: updateResult.modifiedCount,
        requestedCount: teamIds.length,
        foundCount: existingTeams.length,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Error in batch team deletion`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(500).json({
      status: 'error',
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor ao excluir equipes em lote',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Buscar organograma completo de todas as equipes
const getCompleteOrganChart = async (req, res, next) => {
  const action = 'GET_COMPLETE_ORGAN_CHART';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting complete organ chart retrieval`, {
      userId: req.user?.id || 'anonymous',
    });

    // Buscar todas as equipes com seus membros
    const teams = await Team.find().populate({
      path: 'members',
      select:
        'name position level salary hierarchyLevel parentMember birthDate email phone',
    });

    const organChart = {
      teams: [],
      totalTeams: teams.length,
      totalMembers: 0,
      hierarchyLevels: [],
    };

    for (const team of teams) {
      const teamOrganChart = await team.getOrganChart();

      organChart.teams.push({
        id: team._id,
        name: team.name,
        department: team.department,
        description: team.description,
        memberCount: team.members.length,
        organChart: teamOrganChart,
      });

      organChart.totalMembers += team.members.length;
    }

    // Construir níveis hierárquicos únicos
    const allHierarchyLevels = new Set();
    organChart.teams.forEach((team) => {
      team.organChart.forEach((member) => {
        if (member.hierarchyLevel) {
          allHierarchyLevels.add(member.hierarchyLevel);
        }
      });
    });

    organChart.hierarchyLevels = Array.from(allHierarchyLevels).sort(
      (a, b) => a - b
    );

    const duration = Date.now() - startTime;
    logger.info(`${action}: Complete organ chart retrieved successfully`, {
      teamsCount: organChart.teams.length,
      totalMembers: organChart.totalMembers,
      hierarchyLevels: organChart.hierarchyLevels.length,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Organograma completo obtido com sucesso',
      data: organChart,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve complete organ chart`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Buscar organograma da equipe
const getTeamOrganChart = async (req, res, next) => {
  const action = 'GET_TEAM_ORGAN_CHART';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting organ chart retrieval`, {
      teamId: id,
      userId: req.user?.id || 'anonymous',
    });

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const organChart = await team.getOrganChart();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Organ chart retrieved successfully`, {
      teamId: team._id,
      membersCount: organChart.length,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Organograma obtido com sucesso',
      data: {
        team: {
          id: team._id,
          name: team.name,
          department: team.department,
        },
        organChart,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve organ chart`, {
      error: error.message,
      stack: error.stack,
      teamId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Buscar aniversariantes da equipe no mês
const getTeamBirthdays = async (req, res, next) => {
  const action = 'GET_TEAM_BIRTHDAYS';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting birthdays retrieval`, {
      teamId: id,
      userId: req.user?.id || 'anonymous',
    });

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    const birthdays = await team.getBirthdaysThisMonth();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Birthdays retrieved successfully`, {
      teamId: team._id,
      birthdaysCount: birthdays.length,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Aniversariantes obtidos com sucesso',
      data: {
        team: {
          id: team._id,
          name: team.name,
          department: team.department,
        },
        month: new Date().toLocaleString('pt-BR', { month: 'long' }),
        birthdays: birthdays.map((member) => ({
          id: member._id,
          name: member.name,
          position: member.position,
          birthDate: member.birthDate,
          age: member.age,
          daysUntilBirthday: member.daysUntilBirthday,
          isBirthdayToday: member.isBirthdayToday,
        })),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve birthdays`, {
      error: error.message,
      stack: error.stack,
      teamId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  deleteTeamsBatch, // 🔐 Nova função protegida
  getCompleteOrganChart,
  getTeamOrganChart,
  getTeamBirthdays,
};
