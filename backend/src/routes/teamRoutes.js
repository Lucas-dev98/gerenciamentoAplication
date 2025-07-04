const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log('🏆 Team routes loading...');

// Middleware de autenticação obrigatório para TODAS as rotas
router.use(authMiddleware);

// 🔐 Rotas protegidas - requerem autenticação
router.get('/', teamController.getAllTeams);
router.get('/organogram', teamController.getCompleteOrganChart);
router.get('/:id', teamController.getTeamById);
router.get('/:id/organogram', teamController.getTeamOrganChart);
router.get('/:id/birthdays', teamController.getTeamBirthdays);

// Rotas de modificação (já protegidas)
router.post('/', teamController.createTeam); // 🔐 Protegida - requer autenticação
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);
router.delete('/batch', teamController.deleteTeamsBatch); // 🔐 Exclusão em lote protegida

console.log('✅ Team routes configured successfully');
module.exports = router;
