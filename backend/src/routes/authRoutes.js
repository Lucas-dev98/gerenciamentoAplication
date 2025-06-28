const express = require('express');
const {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const {
  userValidation,
  createValidationMiddleware,
} = require('../middlewares/validation');

const router = express.Router();

// Public routes with rate limiting and validation
router.post(
  '/register',
  authLimiter,
  createValidationMiddleware(userValidation, 'register'),
  register
);
router.post(
  '/login',
  authLimiter,
  createValidationMiddleware(userValidation, 'login'),
  login
);

// Protected routes
router.use(authMiddleware);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put(
  '/users/:id',
  strictLimiter,
  createValidationMiddleware(userValidation, 'update'),
  updateUser
);

module.exports = router;
