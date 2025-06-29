const express = require('express');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getTodayEvents,
} = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const {
  eventValidation,
  createValidationMiddleware,
} = require('../middlewares/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

// Rotas CRUD para eventos
router.post(
  '/',
  createValidationMiddleware(eventValidation, 'create'),
  createEvent
); // Criar evento

router.get('/', getAllEvents); // Listar todos os eventos

router.get('/today', getTodayEvents); // Eventos de hoje

router.get('/:id', getEventById); // Obter evento por ID

router.put(
  '/:id',
  createValidationMiddleware(eventValidation, 'update'),
  updateEvent
); // Atualizar evento

router.delete('/:id', strictLimiter, deleteEvent); // Deletar evento

module.exports = router;
