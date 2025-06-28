const Notice = require('../models/noticeModels');
const logger = require('../utils/logger');

const createNotice = async (noticeData) => {
  try {
    logger.info('NOTICE_SERVICE: Starting notice creation', {
      noticeTitle: noticeData.title,
      author: noticeData.author,
      type: noticeData.type,
      priority: noticeData.priority,
      targetAudience: noticeData.targetAudience,
    });

    const notice = new Notice(noticeData);
    await notice.save();

    logger.info('NOTICE_SERVICE: Notice created successfully', {
      noticeId: notice._id,
      noticeTitle: notice.title,
      author: notice.author,
      type: notice.type,
      priority: notice.priority,
    });

    return notice;
  } catch (error) {
    logger.error('NOTICE_SERVICE: Failed to create notice', {
      error: error.message,
      stack: error.stack,
      noticeTitle: noticeData?.title,
      author: noticeData?.author,
      errorCode: error.code,
      validationErrors: error.errors,
    });

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const duplicateError = new Error(`Aviso com este ${field} já existe`);
      duplicateError.type = 'DUPLICATE_ERROR';
      duplicateError.field = field;
      throw duplicateError;
    }

    if (error.name === 'ValidationError') {
      const validationError = new Error('Dados de aviso inválidos');
      validationError.type = 'VALIDATION_ERROR';
      validationError.details = Object.values(error.errors).map(
        (err) => err.message
      );
      throw validationError;
    }

    throw error;
  }
};

const getAllNotices = async (filters = {}) => {
  try {
    logger.info('NOTICE_SERVICE: Starting notices retrieval', {
      filters,
      filtersCount: Object.keys(filters).length,
    });

    const query = {};

    // Aplicar filtros
    if (filters.type) query.type = filters.type;
    if (filters.priority) query.priority = filters.priority;
    if (filters.author) query.author = filters.author;
    if (filters.targetAudience) query.targetAudience = filters.targetAudience;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isPinned !== undefined) query.isPinned = filters.isPinned;

    // Filtrar por data de expiração
    if (filters.includeExpired === false) {
      query.$or = [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }];
    }

    const notices = await Notice.find(query)
      .populate('author', 'username email fullName')
      .populate('readBy.user', 'username email')
      .sort({ isPinned: -1, publishDate: -1 });

    logger.info('NOTICE_SERVICE: Notices retrieved successfully', {
      count: notices.length,
      appliedFilters: query,
      filtersCount: Object.keys(query).length,
      pinnedCount: notices.filter((n) => n.isPinned).length,
    });

    return notices;
  } catch (error) {
    logger.error('NOTICE_SERVICE: Failed to retrieve notices', {
      error: error.message,
      stack: error.stack,
      filters,
      errorCode: error.code,
    });

    throw error;
  }
};

const getNoticeById = async (id) => {
  try {
    logger.info('NOTICE_SERVICE: Starting notice retrieval by ID', {
      noticeId: id,
    });

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      logger.warn('NOTICE_SERVICE: Invalid notice ID format', {
        noticeId: id,
      });

      const invalidIdError = new Error('ID de aviso inválido');
      invalidIdError.type = 'INVALID_ID';
      throw invalidIdError;
    }

    const notice = await Notice.findById(id)
      .populate('author', 'username email fullName')
      .populate('readBy.user', 'username email fullName');

    if (notice) {
      logger.info('NOTICE_SERVICE: Notice retrieved successfully', {
        noticeId: notice._id,
        noticeTitle: notice.title,
        author: notice.author?._id,
        type: notice.type,
        views: notice.views,
        readCount: notice.readBy?.length || 0,
      });
    } else {
      logger.warn('NOTICE_SERVICE: Notice not found', {
        noticeId: id,
      });
    }

    return notice;
  } catch (error) {
    if (error.type === 'INVALID_ID') {
      throw error;
    }

    logger.error('NOTICE_SERVICE: Failed to retrieve notice by ID', {
      error: error.message,
      stack: error.stack,
      noticeId: id,
      errorCode: error.code,
    });

    throw error;
  }
};

const updateNotice = async (id, updateData) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('author', 'username email fullName')
      .populate('readBy.user', 'username email fullName');

    if (notice) {
      logger.info(`Notice "${notice.title}" updated successfully`);
    }
    return notice;
  } catch (error) {
    logger.error('Error updating notice:', error);
    throw error;
  }
};

const deleteNotice = async (id) => {
  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return null;
    }

    await Notice.findByIdAndDelete(id);
    logger.info(`Notice "${notice.title}" deleted successfully`);
    return notice;
  } catch (error) {
    logger.error('Error deleting notice:', error);
    throw error;
  }
};

const getNoticesByAuthor = async (authorId) => {
  try {
    const notices = await Notice.find({ author: authorId })
      .populate('author', 'username email fullName')
      .sort({ createdAt: -1 });

    logger.info(`Retrieved ${notices.length} notices for author ${authorId}`);
    return notices;
  } catch (error) {
    logger.error('Error getting notices by author:', error);
    throw error;
  }
};

const markNoticeAsRead = async (noticeId, userId) => {
  try {
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    await notice.markAsRead(userId);
    logger.info(`Notice "${notice.title}" marked as read by user ${userId}`);
    return notice;
  } catch (error) {
    logger.error('Error marking notice as read:', error);
    throw error;
  }
};

const incrementNoticeViews = async (noticeId) => {
  try {
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      throw new Error('Notice not found');
    }

    await notice.incrementViews();
    logger.info(`Views incremented for notice "${notice.title}"`);
    return notice;
  } catch (error) {
    logger.error('Error incrementing notice views:', error);
    throw error;
  }
};

const getActiveNotices = async (targetAudience = 'all') => {
  try {
    const query = {
      isActive: true,
      $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }],
      $or: [{ targetAudience: 'all' }, { targetAudience: targetAudience }],
    };

    const notices = await Notice.find(query)
      .populate('author', 'username email fullName')
      .sort({ isPinned: -1, priority: 1, publishDate: -1 })
      .limit(50); // Limitar a 50 avisos mais recentes

    logger.info(
      `Retrieved ${notices.length} active notices for ${targetAudience}`
    );
    return notices;
  } catch (error) {
    logger.error('Error getting active notices:', error);
    throw error;
  }
};

const getPinnedNotices = async () => {
  try {
    const notices = await Notice.find({
      isPinned: true,
      isActive: true,
      $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }],
    })
      .populate('author', 'username email fullName')
      .sort({ publishDate: -1 });

    logger.info(`Retrieved ${notices.length} pinned notices`);
    return notices;
  } catch (error) {
    logger.error('Error getting pinned notices:', error);
    throw error;
  }
};

const getNoticeStatistics = async () => {
  try {
    const stats = await Notice.aggregate([
      {
        $group: {
          _id: null,
          totalNotices: { $sum: 1 },
          activeNotices: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          pinnedNotices: {
            $sum: { $cond: [{ $eq: ['$isPinned', true] }, 1, 0] },
          },
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' },
        },
      },
    ]);

    const typeStats = await Notice.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const priorityStats = await Notice.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    logger.info('Notice statistics generated successfully');
    return {
      general: stats[0] || {},
      byType: typeStats,
      byPriority: priorityStats,
    };
  } catch (error) {
    logger.error('Error getting notice statistics:', error);
    throw error;
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getNoticesByAuthor,
  markNoticeAsRead,
  incrementNoticeViews,
  getActiveNotices,
  getPinnedNotices,
  getNoticeStatistics,
};
