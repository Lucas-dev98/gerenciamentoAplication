const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log('👥 Member routes loading...');

// Middleware de autenticação obrigatório para TODAS as rotas de membros
router.use(authMiddleware);

// 🔐 Rotas protegidas - requerem autenticação
router.get('/', memberController.getAllMembers); // 🔐 Protegida
router.get('/birthdays', memberController.getAllBirthdays); // 🔐 Protegida
router.get('/:id', memberController.getMemberById); // 🔐 Protegida
router.post('/', memberController.createMember); // 🔐 Protegida
router.put('/:id', memberController.updateMember); // 🔐 Protegida
router.delete('/:id', memberController.deleteMember); // 🔐 Protegida
router.delete('/batch', memberController.deleteMembersBatch); // 🔐 Exclusão em lote protegida

console.log('✅ Member routes configured successfully - ALL PROTECTED');
module.exports = router;
