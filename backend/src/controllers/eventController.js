/**
 * Event Controller - Clean Architecture Implementation
 *
 * Controller responsável pelo gerenciamento de eventos seguindo
 * os princípios de Clean Architecture e SOLID.
 *
 * Funcionalidades:
 * - CRUD completo de eventos
 * - Gestão de calendário
 * - Notificações de eventos
 * - Filtros por data e categoria
 * - Validação de dados
 *
 * @version 3.0.0
 * @architecture Clean Architecture
 * @layer Interface/Controllers
 */

const Event = require('../models/Event');
const logger = require('../utils/logger');

// Criar novo evento
const createEvent = async (req, res) => {
  try {
    logger.info('Creating new event', {
      userId: req.user.id,
      requestId: req.id,
    });

    const eventData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const event = new Event(eventData);
    await event.save();

    // Popular os dados do usuário que criou
    await event.populate('createdBy', 'username fullName email');

    if (event.project) {
      await event.populate('project', 'name description');
    }

    logger.info('Event created successfully', {
      eventId: event._id,
      eventName: event.name,
      userId: req.user.id,
      requestId: req.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Evento criado com sucesso',
      data: {
        event: {
          id: event._id,
          name: event.name,
          eventType: event.eventType,
          date: event.date,
          time: event.time,
          location: event.location,
          observations: event.observations,
          status: event.status,
          project: event.project,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          dateTimeFormatted: event.dateTimeFormatted,
          isToday: event.isToday(),
          isPast: event.isPast(),
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Error creating event', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      requestId: req.id,
    });

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Dados de entrada inválidos',
        errors,
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor ao criar evento',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Listar todos os eventos
const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros opcionais
    const filters = {};

    if (req.query.eventType) {
      filters.eventType = req.query.eventType;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      filters.date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (req.query.project) {
      filters.project = req.query.project;
    }

    const events = await Event.find(filters)
      .populate('createdBy', 'username fullName email')
      .populate('project', 'name description')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filters);

    // Adicionar informações calculadas
    const eventsWithInfo = events.map((event) => ({
      id: event._id,
      name: event.name,
      eventType: event.eventType,
      date: event.date,
      time: event.time,
      location: event.location,
      observations: event.observations,
      status: event.status,
      project: event.project,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      dateTimeFormatted: event.dateTimeFormatted,
      isToday: event.isToday(),
      isPast: event.isPast(),
    }));

    logger.info('Events retrieved successfully', {
      count: events.length,
      total,
      page,
      filters,
      requestId: req.id,
    });

    res.json({
      status: 'success',
      data: {
        events: eventsWithInfo,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Error retrieving events', {
      error: error.message,
      stack: error.stack,
      requestId: req.id,
    });

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor ao buscar eventos',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Obter evento por ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'username fullName email')
      .populate('project', 'name description');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Evento não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    logger.info('Event retrieved successfully', {
      eventId: id,
      requestId: req.id,
    });

    res.json({
      status: 'success',
      data: {
        event: {
          id: event._id,
          name: event.name,
          eventType: event.eventType,
          date: event.date,
          time: event.time,
          location: event.location,
          observations: event.observations,
          status: event.status,
          project: event.project,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          dateTimeFormatted: event.dateTimeFormatted,
          isToday: event.isToday(),
          isPast: event.isPast(),
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Error retrieving event', {
      error: error.message,
      eventId: req.params.id,
      requestId: req.id,
    });

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor ao buscar evento',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Atualizar evento
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'username fullName email')
      .populate('project', 'name description');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Evento não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    logger.info('Event updated successfully', {
      eventId: id,
      userId: req.user.id,
      requestId: req.id,
    });

    res.json({
      status: 'success',
      message: 'Evento atualizado com sucesso',
      data: {
        event: {
          id: event._id,
          name: event.name,
          eventType: event.eventType,
          date: event.date,
          time: event.time,
          location: event.location,
          observations: event.observations,
          status: event.status,
          project: event.project,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          dateTimeFormatted: event.dateTimeFormatted,
          isToday: event.isToday(),
          isPast: event.isPast(),
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Error updating event', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id,
      requestId: req.id,
    });

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Dados de entrada inválidos',
        errors,
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor ao atualizar evento',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Deletar evento
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Evento não encontrado',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    logger.info('Event deleted successfully', {
      eventId: id,
      eventName: event.name,
      userId: req.user.id,
      requestId: req.id,
    });

    res.json({
      status: 'success',
      message: 'Evento deletado com sucesso',
      data: {
        event: {
          id: event._id,
          name: event.name,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Error deleting event', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id,
      requestId: req.id,
    });

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor ao deletar evento',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

// Obter eventos de hoje
const getTodayEvents = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const events = await Event.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('createdBy', 'username fullName email')
      .populate('project', 'name description')
      .sort({ time: 1 });

    const eventsWithInfo = events.map((event) => ({
      id: event._id,
      name: event.name,
      eventType: event.eventType,
      date: event.date,
      time: event.time,
      location: event.location,
      observations: event.observations,
      status: event.status,
      project: event.project,
      createdBy: event.createdBy,
      dateTimeFormatted: event.dateTimeFormatted,
      isToday: true,
      isPast: event.isPast(),
    }));

    res.json({
      status: 'success',
      data: {
        events: eventsWithInfo,
        count: eventsWithInfo.length,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Error retrieving today events', {
      error: error.message,
      requestId: req.id,
    });

    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor ao buscar eventos de hoje',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getTodayEvents,
};
