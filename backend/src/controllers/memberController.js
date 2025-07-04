/**
 * Member Controller - Clean Architecture Implementation
 *
 * Controller responsável pelo gerenciamento de membros seguindo
 * os princípios de Clean Architecture e SOLID.
 *
 * Funcionalidades:
 * - CRUD completo de membros
 * - Associação de membros a equipes
 * - Gestão de cargos e responsabilidades
 * - Relatórios de membros
 * - Validação de dados
 *
 * @version 3.0.0
 * @architecture Clean Architecture
 * @layer Interface/Controllers
 */

const Member = require('../models/memberModels');
const Team = require('../models/teamModels');
const logger = require('../utils/logger');

// Validação de dados de entrada para criação de membro
const validateMemberData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }

  if (!data.matricula || data.matricula.trim().length < 3) {
    errors.push('Matrícula deve ter pelo menos 3 caracteres');
  }

  if (!data.company || data.company.trim().length < 3) {
    errors.push('Empresa deve ter pelo menos 3 caracteres');
  }

  if (!data.position || data.position.trim().length < 3) {
    errors.push('Função deve ter pelo menos 3 caracteres');
  }

  if (!data.workArea || data.workArea.trim().length < 3) {
    errors.push('Área de atuação deve ter pelo menos 3 caracteres');
  }

  if (!data.birthDate) {
    errors.push('Data de nascimento é obrigatória');
  } else {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (birthDate > today) {
      errors.push('Data de nascimento não pode ser no futuro');
    }

    if (age > 100 || age < 16) {
      errors.push('Idade deve estar entre 16 e 100 anos');
    }
  }

  if (!data.team) {
    errors.push('Equipe é obrigatória');
  }

  return errors;
};

// Criar novo membro
const createMember = async (req, res, next) => {
  const action = 'CREATE_MEMBER';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting member creation`, {
      userId: req.user?.id || 'anonymous',
      body: {
        ...req.body,
        birthDate: req.body.birthDate ? 'provided' : 'not provided',
      },
    });

    const memberData = req.body;

    // Validar dados obrigatórios
    const validationErrors = validateMemberData(memberData);
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

    // Verificar se a equipe existe
    const team = await Team.findById(memberData.team);
    if (!team) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Equipe não encontrada',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se matrícula já existe
    const existingMember = await Member.findOne({
      matricula: memberData.matricula.trim(),
    });

    if (existingMember) {
      return res.status(409).json({
        status: 'error',
        type: 'CONFLICT_ERROR',
        message: 'Já existe um membro com esta matrícula',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se o supervisor existe (se fornecido)
    if (memberData.supervisor) {
      const supervisor = await Member.findById(memberData.supervisor);
      if (!supervisor) {
        return res.status(404).json({
          status: 'error',
          type: 'NOT_FOUND_ERROR',
          message: 'Superior de referência não encontrado',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }

      // Verificar se o supervisor está na mesma equipe
      if (supervisor.team.toString() !== memberData.team) {
        return res.status(400).json({
          status: 'error',
          type: 'VALIDATION_ERROR',
          message: 'Superior de referência deve estar na mesma equipe',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }
    }

    const member = await Member.create({
      name: memberData.name.trim(),
      matricula: memberData.matricula.trim(),
      company: memberData.company.trim(),
      birthDate: new Date(memberData.birthDate),
      position: memberData.position.trim(),
      supervisor: memberData.supervisor || null,
      workArea: memberData.workArea.trim(),
      team: memberData.team,
      phone: memberData.phone?.trim(),
      email: memberData.email?.trim(),
      hireDate: memberData.hireDate
        ? new Date(memberData.hireDate)
        : new Date(),
    });

    const duration = Date.now() - startTime;
    logger.info(`${action}: Member created successfully`, {
      memberId: member._id,
      memberName: member.name,
      matricula: member.matricula,
      teamId: member.team,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(201).json({
      status: 'success',
      message: 'Membro criado com sucesso',
      data: {
        member: {
          id: member._id,
          name: member.name,
          matricula: member.matricula,
          company: member.company,
          birthDate: member.birthDate,
          position: member.position,
          supervisor: member.supervisor,
          workArea: member.workArea,
          team: member.team,
          phone: member.phone,
          email: member.email,
          hireDate: member.hireDate,
          level: member.level,
          age: member.age,
          createdAt: member.createdAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to create member`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Listar membros
const getAllMembers = async (req, res, next) => {
  const action = 'GET_ALL_MEMBERS';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting members retrieval`, {
      query: req.query,
      userId: req.user?.id || 'anonymous',
    });

    const { team, company, workArea, isActive, supervisor, birthdayMonth } =
      req.query;

    const filters = {};
    if (team) filters.team = team;
    if (company) filters.company = company;
    if (workArea) filters.workArea = workArea;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (supervisor) filters.supervisor = supervisor;

    // Filtro para aniversariantes do mês
    if (birthdayMonth) {
      const month = parseInt(birthdayMonth);
      filters.$expr = {
        $eq: [{ $month: '$birthDate' }, month],
      };
    }

    const members = await Member.find(filters)
      .populate('team', 'name department')
      .populate('supervisor', 'name position')
      .sort({ name: 1 });

    const duration = Date.now() - startTime;
    logger.info(`${action}: Members retrieved successfully`, {
      count: members.length,
      filters,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Membros listados com sucesso',
      data: {
        count: members.length,
        members: members.map((member) => ({
          id: member._id,
          name: member.name,
          matricula: member.matricula,
          company: member.company,
          birthDate: member.birthDate,
          position: member.position,
          supervisor: member.supervisor,
          workArea: member.workArea,
          team: member.team,
          phone: member.phone,
          email: member.email,
          hireDate: member.hireDate,
          level: member.level,
          age: member.age,
          isBirthdayToday: member.isBirthdayToday,
          isBirthdayThisMonth: member.isBirthdayThisMonth,
          daysUntilBirthday: member.daysUntilBirthday,
          isActive: member.isActive,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        })),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve members`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Buscar membro por ID
const getMemberById = async (req, res, next) => {
  const action = 'GET_MEMBER_BY_ID';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting member retrieval`, {
      memberId: id,
      userId: req.user?.id || 'anonymous',
    });

    const member = await Member.findById(id)
      .populate('team', 'name department color')
      .populate('supervisor', 'name position matricula');

    if (!member) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Membro não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Buscar subordinados
    const subordinates = await member.getSubordinates();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Member retrieved successfully`, {
      memberId: member._id,
      memberName: member.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Membro encontrado com sucesso',
      data: {
        member: {
          id: member._id,
          name: member.name,
          matricula: member.matricula,
          company: member.company,
          birthDate: member.birthDate,
          position: member.position,
          supervisor: member.supervisor,
          workArea: member.workArea,
          team: member.team,
          phone: member.phone,
          email: member.email,
          hireDate: member.hireDate,
          level: member.level,
          age: member.age,
          isBirthdayToday: member.isBirthdayToday,
          isBirthdayThisMonth: member.isBirthdayThisMonth,
          daysUntilBirthday: member.daysUntilBirthday,
          isActive: member.isActive,
          subordinates: subordinates.map((sub) => ({
            id: sub._id,
            name: sub.name,
            position: sub.position,
            matricula: sub.matricula,
          })),
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve member`, {
      error: error.message,
      stack: error.stack,
      memberId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Atualizar membro
const updateMember = async (req, res, next) => {
  const action = 'UPDATE_MEMBER';
  const startTime = Date.now();

  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info(`${action}: Starting member update`, {
      memberId: id,
      updates: {
        ...updates,
        birthDate: updates.birthDate ? 'provided' : 'unchanged',
      },
      userId: req.user?.id || 'anonymous',
    });

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Membro não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Validações se estiver mudando dados críticos
    if (updates.matricula && updates.matricula !== member.matricula) {
      const existingMember = await Member.findOne({
        matricula: updates.matricula.trim(),
        _id: { $ne: id },
      });

      if (existingMember) {
        return res.status(409).json({
          status: 'error',
          type: 'CONFLICT_ERROR',
          message: 'Já existe um membro com esta matrícula',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }
    }

    // Verificar supervisor (se mudando)
    if (
      updates.supervisor &&
      updates.supervisor !== member.supervisor?.toString()
    ) {
      const supervisor = await Member.findById(updates.supervisor);
      if (!supervisor) {
        return res.status(404).json({
          status: 'error',
          type: 'NOT_FOUND_ERROR',
          message: 'Superior de referência não encontrado',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }

      // Verificar se não está criando ciclo hierárquico
      if (updates.supervisor === id) {
        return res.status(400).json({
          status: 'error',
          type: 'VALIDATION_ERROR',
          message: 'Um membro não pode ser supervisor dele mesmo',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
      }
    }

    // Atualizar campos permitidos
    const allowedUpdates = [
      'name',
      'matricula',
      'company',
      'birthDate',
      'position',
      'supervisor',
      'workArea',
      'team',
      'phone',
      'email',
      'isActive',
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === 'birthDate' && updates[field]) {
          member[field] = new Date(updates[field]);
        } else {
          member[field] = updates[field];
        }
      }
    });

    await member.save();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Member updated successfully`, {
      memberId: member._id,
      memberName: member.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Membro atualizado com sucesso',
      data: {
        member: {
          id: member._id,
          name: member.name,
          matricula: member.matricula,
          company: member.company,
          birthDate: member.birthDate,
          position: member.position,
          supervisor: member.supervisor,
          workArea: member.workArea,
          team: member.team,
          phone: member.phone,
          email: member.email,
          level: member.level,
          age: member.age,
          isActive: member.isActive,
          updatedAt: member.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to update member`, {
      error: error.message,
      stack: error.stack,
      memberId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

// Excluir membro
const deleteMember = async (req, res, next) => {
  const action = 'DELETE_MEMBER';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting member deletion`, {
      memberId: id,
      userId: req.user?.id || 'anonymous',
    });

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND_ERROR',
        message: 'Membro não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se tem subordinados
    const subordinates = await Member.find({
      supervisor: id,
      isActive: true,
    });

    if (subordinates.length > 0) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: `Não é possível excluir membro com ${subordinates.length} subordinado(s). Reatribua os subordinados primeiro.`,
        details: subordinates.map((sub) => ({
          id: sub._id,
          name: sub.name,
          position: sub.position,
        })),
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Soft delete
    member.isActive = false;
    await member.save();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Member deleted successfully`, {
      memberId: member._id,
      memberName: member.name,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Membro excluído com sucesso',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to delete member`, {
      error: error.message,
      stack: error.stack,
      memberId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

/**
 * Exclusão em lote de membros
 * Permite excluir múltiplos membros de uma vez
 * Requer autenticação
 */
const deleteMembersBatch = async (req, res, next) => {
  const action = 'DELETE_MEMBERS_BATCH';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting batch member deletion`, {
      userId: req.user?.id || 'anonymous',
      body: req.body,
    });

    const { memberIds } = req.body;

    // Validação básica
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'É necessário fornecer um array de IDs de membros',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    if (memberIds.length > 50) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Máximo de 50 membros por operação',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Verificar se os membros existem
    const existingMembers = await Member.find({
      _id: { $in: memberIds },
      isActive: true,
    });

    if (existingMembers.length === 0) {
      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Nenhum membro encontrado para exclusão',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Executar exclusão em lote (soft delete)
    const updateResult = await Member.updateMany(
      { _id: { $in: memberIds }, isActive: true },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: req.user?.id || '60d5ecb54b24a03d1c8b4567',
        },
      }
    );

    const duration = Date.now() - startTime;
    logger.info(`${action}: Batch member deletion completed`, {
      deletedCount: updateResult.modifiedCount,
      requestedCount: memberIds.length,
      foundCount: existingMembers.length,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(200).json({
      status: 'success',
      message: `${updateResult.modifiedCount} membro(s) excluído(s) com sucesso`,
      data: {
        deletedCount: updateResult.modifiedCount,
        requestedCount: memberIds.length,
        foundCount: existingMembers.length,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Error in batch member deletion`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(500).json({
      status: 'error',
      type: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor ao excluir membros em lote',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Buscar aniversariantes gerais do mês
const getAllBirthdays = async (req, res, next) => {
  const action = 'GET_ALL_BIRTHDAYS';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting birthdays retrieval`, {
      userId: req.user?.id || 'anonymous',
    });

    const birthdays = await Member.getBirthdaysThisMonth();

    const duration = Date.now() - startTime;
    logger.info(`${action}: Birthdays retrieved successfully`, {
      count: birthdays.length,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Aniversariantes do mês obtidos com sucesso',
      data: {
        month: new Date().toLocaleString('pt-BR', { month: 'long' }),
        year: new Date().getFullYear(),
        birthdays: birthdays.map((member) => ({
          id: member._id,
          name: member.name,
          position: member.position,
          company: member.company,
          workArea: member.workArea,
          birthDate: member.birthDate,
          dayOfBirth: member.dayOfBirth,
          age: member.age,
          team: member.teamInfo
            ? {
                id: member.teamInfo._id,
                name: member.teamInfo.name,
                department: member.teamInfo.department,
              }
            : null,
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
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  deleteMembersBatch, // 🔐 Nova função protegida
  getAllBirthdays,
};
