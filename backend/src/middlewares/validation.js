const validator = require('validator');

// User validation schemas
const userValidation = {
  register: (data) => {
    const errors = [];

    // Username validation
    if (!data.username || data.username.trim().length < 3) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }
    if (data.username && data.username.length > 30) {
      errors.push('Username deve ter no máximo 30 caracteres');
    }

    // Email validation
    if (!data.email) {
      errors.push('Email é obrigatório');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Email deve ter um formato válido');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password é obrigatório');
    } else if (data.password.length < 6) {
      errors.push('Password deve ter pelo menos 6 caracteres');
    } else if (data.password.length > 128) {
      errors.push('Password deve ter no máximo 128 caracteres');
    }

    // FullName validation (opcional)
    if (data.fullName && data.fullName.length > 100) {
      errors.push('Nome completo deve ter no máximo 100 caracteres');
    }

    // Phone validation (opcional)
    if (data.phone && data.phone.length > 20) {
      errors.push('Telefone deve ter no máximo 20 caracteres');
    }

    return errors;
  },

  login: (data) => {
    const errors = [];

    if (!data.email) {
      errors.push('Email é obrigatório');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Email deve ter um formato válido');
    }

    if (!data.password) {
      errors.push('Password é obrigatório');
    }

    return errors;
  },

  update: (data) => {
    const errors = [];

    if (data.username !== undefined) {
      if (data.username.trim().length < 3) {
        errors.push('Username deve ter pelo menos 3 caracteres');
      }
      if (data.username.length > 30) {
        errors.push('Username deve ter no máximo 30 caracteres');
      }
    }

    if (data.email !== undefined) {
      if (!validator.isEmail(data.email)) {
        errors.push('Email deve ter um formato válido');
      }
    }

    if (data.password !== undefined) {
      if (data.password.length < 6) {
        errors.push('Password deve ter pelo menos 6 caracteres');
      }
      if (data.password.length > 128) {
        errors.push('Password deve ter no máximo 128 caracteres');
      }
    }

    if (data.fullName !== undefined && data.fullName.length > 100) {
      errors.push('Nome completo deve ter no máximo 100 caracteres');
    }

    if (data.phone !== undefined && data.phone.length > 20) {
      errors.push('Telefone deve ter no máximo 20 caracteres');
    }

    return errors;
  },
};

// Project validation schemas
const projectValidation = {
  create: (data) => {
    const errors = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Nome do projeto deve ter pelo menos 3 caracteres');
    }
    if (data.name && data.name.length > 200) {
      errors.push('Nome do projeto deve ter no máximo 200 caracteres');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('Descrição deve ter no máximo 2000 caracteres');
    }

    const validStatuses = [
      'draft',
      'active',
      'completed',
      'cancelled',
      'on-hold',
    ];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(
        `Status deve ser um dos seguintes: ${validStatuses.join(', ')}`
      );
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push(
        `Prioridade deve ser uma das seguintes: ${validPriorities.join(', ')}`
      );
    }

    if (data.budget && (typeof data.budget !== 'number' || data.budget < 0)) {
      errors.push('Orçamento deve ser um número positivo');
    }

    if (data.startDate && !validator.isISO8601(data.startDate)) {
      errors.push('Data de início deve ter formato válido (ISO 8601)');
    }

    if (data.endDate && !validator.isISO8601(data.endDate)) {
      errors.push('Data de fim deve ter formato válido (ISO 8601)');
    }

    return errors;
  },

  update: (data) => {
    const errors = [];

    if (data.name !== undefined) {
      if (data.name.trim().length < 3) {
        errors.push('Nome do projeto deve ter pelo menos 3 caracteres');
      }
      if (data.name.length > 200) {
        errors.push('Nome do projeto deve ter no máximo 200 caracteres');
      }
    }

    if (data.description !== undefined && data.description.length > 2000) {
      errors.push('Descrição deve ter no máximo 2000 caracteres');
    }

    const validStatuses = [
      'draft',
      'active',
      'completed',
      'cancelled',
      'on-hold',
    ];
    if (data.status !== undefined && !validStatuses.includes(data.status)) {
      errors.push(
        `Status deve ser um dos seguintes: ${validStatuses.join(', ')}`
      );
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (
      data.priority !== undefined &&
      !validPriorities.includes(data.priority)
    ) {
      errors.push(
        `Prioridade deve ser uma das seguintes: ${validPriorities.join(', ')}`
      );
    }

    if (
      data.budget !== undefined &&
      (typeof data.budget !== 'number' || data.budget < 0)
    ) {
      errors.push('Orçamento deve ser um número positivo');
    }

    return errors;
  },
};

// Notice validation schemas
const noticeValidation = {
  create: (data) => {
    const errors = [];

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres');
    }
    if (data.title && data.title.length > 200) {
      errors.push('Título deve ter no máximo 200 caracteres');
    }

    if (!data.content || data.content.trim().length < 10) {
      errors.push('Conteúdo deve ter pelo menos 10 caracteres');
    }
    if (data.content && data.content.length > 5000) {
      errors.push('Conteúdo deve ter no máximo 5000 caracteres');
    }

    const validTypes = [
      'info',
      'warning',
      'urgent',
      'announcement',
      'maintenance',
    ];
    if (data.type && !validTypes.includes(data.type)) {
      errors.push(`Tipo deve ser um dos seguintes: ${validTypes.join(', ')}`);
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push(
        `Prioridade deve ser uma das seguintes: ${validPriorities.join(', ')}`
      );
    }

    if (data.expiryDate && !validator.isISO8601(data.expiryDate)) {
      errors.push('Data de expiração deve ter formato válido (ISO 8601)');
    }

    return errors;
  },

  update: (data) => {
    const errors = [];

    if (data.title !== undefined) {
      if (data.title.trim().length < 3) {
        errors.push('Título deve ter pelo menos 3 caracteres');
      }
      if (data.title.length > 200) {
        errors.push('Título deve ter no máximo 200 caracteres');
      }
    }

    if (data.content !== undefined) {
      if (data.content.trim().length < 10) {
        errors.push('Conteúdo deve ter pelo menos 10 caracteres');
      }
      if (data.content.length > 5000) {
        errors.push('Conteúdo deve ter no máximo 5000 caracteres');
      }
    }

    const validTypes = [
      'info',
      'warning',
      'urgent',
      'announcement',
      'maintenance',
    ];
    if (data.type !== undefined && !validTypes.includes(data.type)) {
      errors.push(`Tipo deve ser um dos seguintes: ${validTypes.join(', ')}`);
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (
      data.priority !== undefined &&
      !validPriorities.includes(data.priority)
    ) {
      errors.push(
        `Prioridade deve ser uma das seguintes: ${validPriorities.join(', ')}`
      );
    }

    return errors;
  },
};

// Event validation schemas
const eventValidation = {
  create: (data) => {
    const errors = [];

    // Nome do evento
    if (!data.name || data.name.trim().length < 3) {
      errors.push('Nome do evento deve ter pelo menos 3 caracteres');
    }
    if (data.name && data.name.length > 100) {
      errors.push('Nome do evento deve ter no máximo 100 caracteres');
    }

    // Tipo do evento
    const validEventTypes = [
      'reuniao',
      'treinamento',
      'manutencao',
      'inspecao',
      'auditoria',
      'emergencia',
      'outro',
    ];
    if (!data.eventType) {
      errors.push('Tipo do evento é obrigatório');
    } else if (!validEventTypes.includes(data.eventType)) {
      errors.push(
        `Tipo do evento deve ser um dos seguintes: ${validEventTypes.join(', ')}`
      );
    }

    // Data
    if (!data.date) {
      errors.push('Data do evento é obrigatória');
    } else if (!validator.isISO8601(data.date)) {
      errors.push('Data deve ter formato válido (ISO 8601)');
    }

    // Hora
    if (!data.time) {
      errors.push('Hora do evento é obrigatória');
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
      errors.push('Hora deve ter formato válido (HH:mm)');
    }

    // Local
    if (!data.location || data.location.trim().length < 2) {
      errors.push('Local do evento deve ter pelo menos 2 caracteres');
    }
    if (data.location && data.location.length > 200) {
      errors.push('Local deve ter no máximo 200 caracteres');
    }

    // Observações (opcional)
    if (data.observations && data.observations.length > 1000) {
      errors.push('Observações devem ter no máximo 1000 caracteres');
    }

    // Status (opcional)
    const validStatuses = [
      'agendado',
      'em_andamento',
      'concluido',
      'cancelado',
    ];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(
        `Status deve ser um dos seguintes: ${validStatuses.join(', ')}`
      );
    }

    return errors;
  },

  update: (data) => {
    const errors = [];

    // Nome do evento
    if (data.name !== undefined) {
      if (data.name.trim().length < 3) {
        errors.push('Nome do evento deve ter pelo menos 3 caracteres');
      }
      if (data.name.length > 100) {
        errors.push('Nome do evento deve ter no máximo 100 caracteres');
      }
    }

    // Tipo do evento
    const validEventTypes = [
      'reuniao',
      'treinamento',
      'manutencao',
      'inspecao',
      'auditoria',
      'emergencia',
      'outro',
    ];
    if (
      data.eventType !== undefined &&
      !validEventTypes.includes(data.eventType)
    ) {
      errors.push(
        `Tipo do evento deve ser um dos seguintes: ${validEventTypes.join(', ')}`
      );
    }

    // Data
    if (data.date !== undefined && !validator.isISO8601(data.date)) {
      errors.push('Data deve ter formato válido (ISO 8601)');
    }

    // Hora
    if (
      data.time !== undefined &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)
    ) {
      errors.push('Hora deve ter formato válido (HH:mm)');
    }

    // Local
    if (data.location !== undefined) {
      if (data.location.trim().length < 2) {
        errors.push('Local do evento deve ter pelo menos 2 caracteres');
      }
      if (data.location.length > 200) {
        errors.push('Local deve ter no máximo 200 caracteres');
      }
    }

    // Observações
    if (data.observations !== undefined && data.observations.length > 1000) {
      errors.push('Observações devem ter no máximo 1000 caracteres');
    }

    // Status
    const validStatuses = [
      'agendado',
      'em_andamento',
      'concluido',
      'cancelado',
    ];
    if (data.status !== undefined && !validStatuses.includes(data.status)) {
      errors.push(
        `Status deve ser um dos seguintes: ${validStatuses.join(', ')}`
      );
    }

    return errors;
  },
};

// Validation middleware factory
const createValidationMiddleware = (schema, operation) => {
  return (req, res, next) => {
    const errors = schema[operation](req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: errors,
      });
    }

    next();
  };
};

module.exports = {
  userValidation,
  projectValidation,
  noticeValidation,
  eventValidation,
  createValidationMiddleware,
};
