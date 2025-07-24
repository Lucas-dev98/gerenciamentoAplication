const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log('🏆 Team routes loading...');

// Rota de teste temporária (sem autenticação)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API Teams funcionando!',
    data: [
      {
        _id: '1',
        name: 'Equipe de Desenvolvimento',
        description: 'Responsável pelo desenvolvimento de software',
        department: 'Tecnologia',
        status: 'Ativa',
        members: [
          { _id: '1', name: 'João Silva', email: 'joao@empresa.com' },
          { _id: '2', name: 'Maria Santos', email: 'maria@empresa.com' },
        ],
        leader: { _id: '1', name: 'João Silva' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projects: 3,
      },
      {
        _id: '2',
        name: 'Equipe de Marketing',
        description: 'Responsável pelas estratégias de marketing',
        department: 'Marketing',
        status: 'Ativa',
        members: [
          { _id: '3', name: 'Ana Costa', email: 'ana@empresa.com' },
          { _id: '4', name: 'Pedro Lima', email: 'pedro@empresa.com' },
          { _id: '5', name: 'Carla Oliveira', email: 'carla@empresa.com' },
        ],
        leader: { _id: '3', name: 'Ana Costa' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projects: 5,
      },
    ],
  });
});

// Middleware de autenticação obrigatório para TODAS as outras rotas
// router.use(authMiddleware); // Temporariamente desabilitado para teste

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
