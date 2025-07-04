const express = require('express');
const router = express.Router();
const Team = require('../models/teamModels');
const Member = require('../models/memberModels');
const Project = require('../models/projectModels');
const User = require('../models/userModels');
const authMiddleware = require('../middlewares/authMiddleware');
const logger = require('../utils/logger');

console.log('📊 Organogram routes loading...');

// Middleware de autenticação obrigatório para TODAS as rotas de organograma
router.use(authMiddleware);

/**
 * 📊 ORGANOGRAMA GERAL - Visualizar organograma completo
 * GET /api/organogram
 */
router.get('/', async (req, res) => {
  const action = 'GET_COMPLETE_ORGANOGRAM';
  const startTime = Date.now();

  try {
    logger.info(`[${action}] Iniciando busca do organograma completo`, {
      userId: req.user?.id,
    });

    const { projectId, includeStats } = req.query;

    // Buscar projetos com suas equipes e membros
    let projectsQuery = {};
    if (projectId) {
      projectsQuery._id = projectId;
    }

    // Buscar projetos
    const projects = await Project.find(projectsQuery)
      .populate({
        path: 'teams',
        model: 'Team',
        match: { isActive: true },
        populate: {
          path: 'members.user',
          model: 'User',
          select: 'username email fullName',
        },
      })
      .populate('owner', 'username email fullName')
      .populate('mainTeam', 'name department')
      .sort({ createdAt: -1 });

    // Buscar todas as equipes (incluindo as não associadas a projetos)
    const allTeams = await Team.find({ isActive: true })
      .populate({
        path: 'members.user',
        model: 'User',
        select: 'username email fullName',
      })
      .sort({ department: 1, name: 1 });

    // Buscar todos os membros
    const allMembers = await Member.find({ isActive: true })
      .populate('team', 'name department color')
      .sort({ name: 1 });

    // Construir estrutura do organograma
    const organogram = {
      projects: projects.map((project) => ({
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        owner: project.owner,
        mainTeam: project.mainTeam,
        teams: project.teams || [],
        createdAt: project.createdAt,
        stats: {
          teamsCount: project.teams?.length || 0,
          membersCount:
            project.teams?.reduce(
              (total, team) => total + (team.members?.length || 0),
              0
            ) || 0,
        },
      })),
      teams: allTeams.map((team) => ({
        _id: team._id,
        name: team.name,
        description: team.description,
        department: team.department,
        color: team.color,
        budget: team.budget,
        manager: team.manager,
        members: team.members || [],
        projects: team.projects || [],
        isActive: team.isActive,
        createdAt: team.createdAt,
        stats: {
          membersCount: team.members?.length || 0,
          activeMembers: team.members?.filter((m) => m.isActive)?.length || 0,
          projectsCount: team.projects?.length || 0,
        },
      })),
      members: allMembers.map((member) => ({
        _id: member._id,
        name: member.name,
        matricula: member.matricula,
        company: member.company,
        position: member.position,
        birthDate: member.birthDate,
        workArea: member.workArea,
        team: member.team,
        supervisor: member.supervisor,
        isActive: member.isActive,
        createdAt: member.createdAt,
      })),
      statistics: {
        totalProjects: projects.length,
        totalTeams: allTeams.length,
        totalMembers: allMembers.length,
        activeProjects: projects.filter((p) => p.status === 'active').length,
        departments: [...new Set(allTeams.map((t) => t.department))],
        companiesRepresented: [...new Set(allMembers.map((m) => m.company))],
      },
    };

    const duration = Date.now() - startTime;
    logger.info(`[${action}] Organograma completo recuperado`, {
      projectsCount: organogram.projects.length,
      teamsCount: organogram.teams.length,
      membersCount: organogram.members.length,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      message: 'Organograma completo recuperado com sucesso',
      data: organogram,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[${action}] Erro ao buscar organograma`, {
      error: error.message,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao buscar organograma completo',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 📊 ORGANOGRAMA DE PROJETO - Visualizar organograma de um projeto específico
 * GET /api/organogram/project/:projectId
 */
router.get('/project/:projectId', async (req, res) => {
  const action = 'GET_PROJECT_ORGANOGRAM';
  const startTime = Date.now();

  try {
    const { projectId } = req.params;

    logger.info(`[${action}] Buscando organograma do projeto`, {
      projectId,
      userId: req.user?.id,
    });

    const project = await Project.findById(projectId)
      .populate({
        path: 'teams',
        model: 'Team',
        match: { isActive: true },
        populate: {
          path: 'members.user',
          model: 'User',
          select: 'username email fullName',
        },
      })
      .populate('owner', 'username email fullName')
      .populate('mainTeam', 'name department color');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
        timestamp: new Date().toISOString(),
      });
    }

    // Buscar membros das equipes do projeto
    const teamIds = project.teams.map((team) => team._id);
    const members = await Member.find({
      team: { $in: teamIds },
      isActive: true,
    }).populate('team', 'name department color');

    const projectOrganogram = {
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        owner: project.owner,
        mainTeam: project.mainTeam,
        createdAt: project.createdAt,
      },
      teams: project.teams.map((team) => ({
        _id: team._id,
        name: team.name,
        description: team.description,
        department: team.department,
        color: team.color,
        manager: team.manager,
        members: team.members || [],
        isMainTeam: project.mainTeam?._id?.toString() === team._id.toString(),
        stats: {
          membersCount: team.members?.length || 0,
          activeMembers: team.members?.filter((m) => m.isActive)?.length || 0,
        },
      })),
      members: members,
      hierarchy: {
        owner: project.owner,
        mainTeam: project.mainTeam,
        secondaryTeams: project.teams.filter(
          (team) => team._id.toString() !== project.mainTeam?._id?.toString()
        ),
      },
      statistics: {
        teamsCount: project.teams.length,
        membersCount: members.length,
        departments: [...new Set(project.teams.map((t) => t.department))],
        positions: [...new Set(members.map((m) => m.position))],
      },
    };

    const duration = Date.now() - startTime;
    logger.info(`[${action}] Organograma do projeto recuperado`, {
      projectId,
      teamsCount: projectOrganogram.teams.length,
      membersCount: projectOrganogram.members.length,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      message: 'Organograma do projeto recuperado com sucesso',
      data: projectOrganogram,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[${action}] Erro ao buscar organograma do projeto`, {
      error: error.message,
      projectId: req.params.projectId,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao buscar organograma do projeto',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 🏢 GERENCIAR EQUIPE NO ORGANOGRAMA - Adicionar equipe a um projeto
 * POST /api/organogram/project/:projectId/teams
 */
router.post('/project/:projectId/teams', async (req, res) => {
  const action = 'ADD_TEAM_TO_PROJECT';
  const startTime = Date.now();

  try {
    const { projectId } = req.params;
    const { teamId, isMainTeam } = req.body;

    logger.info(`[${action}] Adicionando equipe ao projeto`, {
      projectId,
      teamId,
      isMainTeam,
      userId: req.user?.id,
    });

    const project = await Project.findById(projectId);
    const team = await Team.findById(teamId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
        timestamp: new Date().toISOString(),
      });
    }

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar se a equipe já está no projeto
    if (project.teams.includes(teamId)) {
      return res.status(400).json({
        success: false,
        message: 'Equipe já está associada ao projeto',
        timestamp: new Date().toISOString(),
      });
    }

    // Adicionar equipe ao projeto
    project.teams.push(teamId);

    // Se for equipe principal
    if (isMainTeam) {
      project.mainTeam = teamId;
    }

    await project.save();

    // Adicionar projeto à equipe
    if (!team.projects.includes(projectId)) {
      team.projects.push(projectId);
      await team.save();
    }

    const duration = Date.now() - startTime;
    logger.info(`[${action}] Equipe adicionada ao projeto`, {
      projectId,
      teamId,
      teamName: team.name,
      isMainTeam,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(201).json({
      success: true,
      message: `Equipe ${team.name} adicionada ao projeto ${isMainTeam ? 'como equipe principal' : ''}`,
      data: {
        project: {
          _id: project._id,
          name: project.name,
          teamsCount: project.teams.length,
          mainTeam: project.mainTeam,
        },
        team: {
          _id: team._id,
          name: team.name,
          department: team.department,
          isMainTeam: isMainTeam || false,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[${action}] Erro ao adicionar equipe ao projeto`, {
      error: error.message,
      projectId: req.params.projectId,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar equipe ao projeto',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 🏢 GERENCIAR EQUIPE NO ORGANOGRAMA - Remover equipe de um projeto
 * DELETE /api/organogram/project/:projectId/teams/:teamId
 */
router.delete('/project/:projectId/teams/:teamId', async (req, res) => {
  const action = 'REMOVE_TEAM_FROM_PROJECT';
  const startTime = Date.now();

  try {
    const { projectId, teamId } = req.params;

    logger.info(`[${action}] Removendo equipe do projeto`, {
      projectId,
      teamId,
      userId: req.user?.id,
    });

    const project = await Project.findById(projectId);
    const team = await Team.findById(teamId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
        timestamp: new Date().toISOString(),
      });
    }

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
      });
    }

    // Remover equipe do projeto
    project.teams = project.teams.filter((id) => id.toString() !== teamId);

    // Se era a equipe principal, resetar
    if (project.mainTeam?.toString() === teamId) {
      project.mainTeam = null;
    }

    await project.save();

    // Remover projeto da equipe
    team.projects = team.projects.filter((id) => id.toString() !== projectId);
    await team.save();

    const duration = Date.now() - startTime;
    logger.info(`[${action}] Equipe removida do projeto`, {
      projectId,
      teamId,
      teamName: team.name,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      message: `Equipe ${team.name} removida do projeto`,
      data: {
        project: {
          _id: project._id,
          name: project.name,
          teamsCount: project.teams.length,
          mainTeam: project.mainTeam,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[${action}] Erro ao remover equipe do projeto`, {
      error: error.message,
      projectId: req.params.projectId,
      teamId: req.params.teamId,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao remover equipe do projeto',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 👤 GERENCIAR MEMBRO NO ORGANOGRAMA - Adicionar membro a uma equipe
 * POST /api/organogram/teams/:teamId/members
 */
router.post('/teams/:teamId/members', async (req, res) => {
  const action = 'ADD_MEMBER_TO_TEAM_ORGANOGRAM';
  const startTime = Date.now();

  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    logger.info(`[${action}] Adicionando membro à equipe via organograma`, {
      teamId,
      userId,
      role,
      requestUserId: req.user?.id,
    });

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar se o usuário já é membro da equipe
    const existingMember = team.members.find(
      (member) => member.user.toString() === userId && member.isActive
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já é membro desta equipe',
        timestamp: new Date().toISOString(),
      });
    }

    // Adicionar membro à equipe
    team.members.push({
      user: userId,
      role: role || 'member',
      joinDate: new Date(),
      isActive: true,
    });

    await team.save();

    // Popular dados do novo membro para retorno
    const updatedTeam = await Team.findById(teamId).populate(
      'members.user',
      'username email fullName'
    );

    const newMember = updatedTeam.members[updatedTeam.members.length - 1];

    const duration = Date.now() - startTime;
    logger.info(`[${action}] Membro adicionado à equipe`, {
      teamId,
      teamName: team.name,
      userId,
      role: role || 'member',
      requestUserId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(201).json({
      success: true,
      message: `Membro adicionado à equipe ${team.name}`,
      data: {
        team: {
          _id: team._id,
          name: team.name,
          department: team.department,
          membersCount: updatedTeam.members.length,
        },
        member: newMember,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[${action}] Erro ao adicionar membro à equipe`, {
      error: error.message,
      teamId: req.params.teamId,
      requestUserId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar membro à equipe',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 👤 GERENCIAR MEMBRO NO ORGANOGRAMA - Remover membro de uma equipe
 * DELETE /api/organogram/teams/:teamId/members/:userId
 */
router.delete('/teams/:teamId/members/:userId', async (req, res) => {
  const action = 'REMOVE_MEMBER_FROM_TEAM_ORGANOGRAM';
  const startTime = Date.now();

  try {
    const { teamId, userId } = req.params;

    logger.info(`[${action}] Removendo membro da equipe via organograma`, {
      teamId,
      userId,
      requestUserId: req.user?.id,
    });

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
      });
    }

    // Encontrar e desativar o membro
    const memberIndex = team.members.findIndex(
      (member) => member.user.toString() === userId && member.isActive
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Membro não encontrado na equipe',
        timestamp: new Date().toISOString(),
      });
    }

    // Soft delete - desativar membro
    team.members[memberIndex].isActive = false;
    team.members[memberIndex].leftDate = new Date();

    await team.save();

    const duration = Date.now() - startTime;
    logger.info(`[${action}] Membro removido da equipe`, {
      teamId,
      teamName: team.name,
      userId,
      requestUserId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      message: `Membro removido da equipe ${team.name}`,
      data: {
        team: {
          _id: team._id,
          name: team.name,
          department: team.department,
          activeMembersCount: team.members.filter((m) => m.isActive).length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[${action}] Erro ao remover membro da equipe`, {
      error: error.message,
      teamId: req.params.teamId,
      userId: req.params.userId,
      requestUserId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao remover membro da equipe',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

console.log('✅ Organogram routes configured successfully - ALL PROTECTED');
module.exports = router;
