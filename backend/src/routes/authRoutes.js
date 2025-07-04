const express = require('express');
const {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyToken,
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const {
  userValidation,
  createValidationMiddleware,
} = require('../middlewares/validation');

const router = express.Router();

console.log('🔐 Auth routes loading...');

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
router.get('/verify', verifyToken);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put(
  '/users/:id',
  strictLimiter,
  createValidationMiddleware(userValidation, 'update'),
  updateUser
);
router.delete('/users/:id', strictLimiter, deleteUser);

console.log('✅ Auth routes configured successfully');

module.exports = router;
