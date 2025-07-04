/**
 * Notice Controller - Clean Architecture Implementation
 *
 * Controller responsável pelo gerenciamento de avisos seguindo
 * os princípios de Clean Architecture e SOLID.
 *
 * Funcionalidades:
 * - CRUD completo de avisos
 * - Sistema de notificações
 * - Filtros por urgência e categoria
 * - Gestão de leitura/não leitura
 * - Validação de dados
 *
 * @version 3.0.0
 * @architecture Clean Architecture
 * @layer Interface/Controllers
 */

const noticeService = require('../services/noticeServices');
const logger = require('../utils/logger');

// Validação de dados de entrada para criação de aviso
const validateNoticeData = (title, content) => {
  const errors = [];

  if (!title || title.trim().length < 5) {
    errors.push('Título do aviso deve ter pelo menos 5 caracteres');
  }

  if (!content || content.trim().length < 10) {
    errors.push('Conteúdo do aviso deve ter pelo menos 10 caracteres');
  }

  if (title && title.length > 200) {
    errors.push('Título deve ter no máximo 200 caracteres');
  }

  if (content && content.length > 2000) {
    errors.push('Conteúdo deve ter no máximo 2000 caracteres');
  }

  return errors;
};

const createNotice = async (req, res, next) => {
  const action = 'CREATE_NOTICE';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting notice creation`, {
      userId: req.user?.id || 'anonymous',
      body: {
        ...req.body,
        content: req.body.content?.substring(0, 100) + '...',
      },
    });

    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      isPinned,
      expiryDate,
      tags,
      attachments,
    } = req.body;

    // Validar dados obrigatórios
    const validationErrors = validateNoticeData(title, content);
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

    // Por enquanto, usar um author fixo (em produção viria do token JWT)
    const noticeData = {
      title: title.trim(),
      content: content.trim(),
      type: type || 'info',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      isPinned: isPinned || false,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      tags: tags || [],
      attachments: attachments || [],
      author: req.user?.id || '60d5ecb54b24a03d1c8b4567', // ID fictício para teste
    };

    const notice = await noticeService.createNotice(noticeData);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Notice created successfully`, {
      noticeId: notice._id,
      noticeTitle: notice.title,
      type: notice.type,
      priority: notice.priority,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.status(201).json({
      status: 'success',
      message: 'Aviso criado com sucesso',
      data: {
        notice: {
          id: notice._id,
          title: notice.title,
          content: notice.content,
          type: notice.type,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
          isPinned: notice.isPinned,
          publishDate: notice.publishDate,
          expiryDate: notice.expiryDate,
          tags: notice.tags,
          views: notice.views,
          createdAt: notice.createdAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to create notice`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const getAllNotices = async (req, res, next) => {
  const action = 'GET_ALL_NOTICES';
  const startTime = Date.now();

  try {
    logger.info(`${action}: Starting notices retrieval`, {
      query: req.query,
      userId: req.user?.id || 'anonymous',
    });

    const {
      type,
      priority,
      author,
      targetAudience,
      isActive,
      isPinned,
      includeExpired,
    } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (author) filters.author = author;
    if (targetAudience) filters.targetAudience = targetAudience;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isPinned !== undefined) filters.isPinned = isPinned === 'true';
    if (includeExpired !== undefined)
      filters.includeExpired = includeExpired === 'true';

    const notices = await noticeService.getAllNotices(filters);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Notices retrieved successfully`, {
      count: notices.length,
      filters,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Avisos listados com sucesso',
      data: {
        count: notices.length,
        notices: notices.map((notice) => ({
          id: notice._id,
          title: notice.title,
          content: notice.content,
          type: notice.type,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
          isPinned: notice.isPinned,
          isExpired: notice.isExpired,
          daysUntilExpiry: notice.daysUntilExpiry,
          publishDate: notice.publishDate,
          expiryDate: notice.expiryDate,
          views: notice.views,
          readCount: notice.readBy.length,
          readPercentage: notice.readPercentage,
          author: notice.author,
          tags: notice.tags,
          createdAt: notice.createdAt,
          updatedAt: notice.updatedAt,
        })),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve notices`, {
      error: error.message,
      stack: error.stack,
      query: req.query,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const getNoticeById = async (req, res, next) => {
  const action = 'GET_NOTICE_BY_ID';
  const startTime = Date.now();

  try {
    const { id } = req.params;

    logger.info(`${action}: Starting notice retrieval`, {
      noticeId: id,
      userId: req.user?.id || 'anonymous',
    });

    const notice = await noticeService.getNoticeById(id);

    if (!notice) {
      logger.warn(`${action}: Notice not found`, {
        noticeId: id,
        userId: req.user?.id || 'anonymous',
      });

      return res.status(404).json({
        status: 'error',
        type: 'NOT_FOUND',
        message: 'Aviso não encontrado',
        details: [`Aviso com ID ${id} não foi encontrado`],
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }

    // Incrementar views
    await noticeService.incrementNoticeViews(id);

    const duration = Date.now() - startTime;
    logger.info(`${action}: Notice retrieved successfully`, {
      noticeId: notice._id,
      noticeTitle: notice.title,
      type: notice.type,
      views: notice.views + 1,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });

    res.json({
      status: 'success',
      message: 'Aviso encontrado',
      data: {
        notice: {
          id: notice._id,
          title: notice.title,
          content: notice.content,
          type: notice.type,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
          isPinned: notice.isPinned,
          isExpired: notice.isExpired,
          daysUntilExpiry: notice.daysUntilExpiry,
          publishDate: notice.publishDate,
          expiryDate: notice.expiryDate,
          views: notice.views + 1, // Incluir o incremento
          readCount: notice.readBy.length,
          readPercentage: notice.readPercentage,
          author: notice.author,
          readBy: notice.readBy,
          attachments: notice.attachments,
          tags: notice.tags,
          isActive: notice.isActive,
          createdAt: notice.createdAt,
          updatedAt: notice.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${action}: Failed to retrieve notice`, {
      error: error.message,
      stack: error.stack,
      noticeId: req.params.id,
      userId: req.user?.id || 'anonymous',
      duration: `${duration}ms`,
    });
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validar dados se título/conteúdo estiverem sendo atualizados
    if (updateData.title || updateData.content) {
      const validationErrors = validateNoticeData(
        updateData.title || '',
        updateData.content || ''
      );
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: validationErrors,
        });
      }
    }

    const updatedNotice = await noticeService.updateNotice(id, updateData);

    if (!updatedNotice) {
      return res.status(404).json({ error: 'Aviso não encontrado' });
    }

    res.json({
      message: 'Aviso atualizado com sucesso',
      notice: {
        id: updatedNotice._id,
        title: updatedNotice.title,
        content: updatedNotice.content,
        type: updatedNotice.type,
        priority: updatedNotice.priority,
        targetAudience: updatedNotice.targetAudience,
        isPinned: updatedNotice.isPinned,
        isExpired: updatedNotice.isExpired,
        publishDate: updatedNotice.publishDate,
        expiryDate: updatedNotice.expiryDate,
        views: updatedNotice.views,
        readCount: updatedNotice.readBy.length,
        author: updatedNotice.author,
        tags: updatedNotice.tags,
        isActive: updatedNotice.isActive,
        updatedAt: updatedNotice.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedNotice = await noticeService.deleteNotice(id);

    if (!deletedNotice) {
      return res.status(404).json({ error: 'Aviso não encontrado' });
    }

    res.json({
      message: 'Aviso deletado com sucesso',
      notice: {
        id: deletedNotice._id,
        title: deletedNotice.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getNoticesByAuthor = async (req, res, next) => {
  try {
    const { authorId } = req.params;
    const notices = await noticeService.getNoticesByAuthor(authorId);

    res.json({
      message: 'Avisos do autor listados com sucesso',
      count: notices.length,
      notices: notices.map((notice) => ({
        id: notice._id,
        title: notice.title,
        type: notice.type,
        priority: notice.priority,
        views: notice.views,
        readCount: notice.readBy.length,
        isActive: notice.isActive,
        isPinned: notice.isPinned,
        createdAt: notice.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    const notice = await noticeService.markNoticeAsRead(id, userId);

    res.json({
      message: 'Aviso marcado como lido',
      notice: {
        id: notice._id,
        title: notice.title,
        readCount: notice.readBy.length,
      },
    });
  } catch (error) {
    if (error.message === 'Notice not found') {
      return res.status(404).json({ error: 'Aviso não encontrado' });
    }
    next(error);
  }
};

const getActiveNotices = async (req, res, next) => {
  try {
    const { targetAudience } = req.query;
    const notices = await noticeService.getActiveNotices(targetAudience);

    res.json({
      message: 'Avisos ativos listados com sucesso',
      count: notices.length,
      notices: notices.map((notice) => ({
        id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        isPinned: notice.isPinned,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        daysUntilExpiry: notice.daysUntilExpiry,
        author: notice.author,
        tags: notice.tags,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getPinnedNotices = async (req, res, next) => {
  try {
    const notices = await noticeService.getPinnedNotices();

    res.json({
      message: 'Avisos fixados listados com sucesso',
      count: notices.length,
      notices: notices.map((notice) => ({
        id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        publishDate: notice.publishDate,
        author: notice.author,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const stats = await noticeService.getNoticeStatistics();

    res.json({
      message: 'Estatísticas dos avisos obtidas com sucesso',
      statistics: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getNoticesByAuthor,
  markAsRead,
  getActiveNotices,
  getPinnedNotices,
  getStatistics,
};
