const express = require('express');
const {
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
} = require('../controllers/noticeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const {
  noticeValidation,
  createValidationMiddleware,
} = require('../middlewares/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

// Rotas CRUD básicas para avisos
router.post(
  '/',
  createValidationMiddleware(noticeValidation, 'create'),
  createNotice
); // Criar aviso
router.get('/', getAllNotices); // Listar todos os avisos
router.get('/active', getActiveNotices); // Listar avisos ativos
router.get('/pinned', getPinnedNotices); // Listar avisos fixados
router.get('/statistics', getStatistics); // Obter estatísticas
router.get('/:id', getNoticeById); // Obter aviso por ID
router.put(
  '/:id',
  createValidationMiddleware(noticeValidation, 'update'),
  updateNotice
); // Atualizar aviso
router.delete('/:id', strictLimiter, deleteNotice); // Deletar aviso

// Rotas específicas para gerenciamento
router.get('/author/:authorId', getNoticesByAuthor); // Avisos de um autor específico
router.post('/:id/read', markAsRead); // Marcar aviso como lido

module.exports = router;
