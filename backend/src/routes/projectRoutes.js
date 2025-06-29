const express = require('express');
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByUser,
  addTeamMember,
  removeTeamMember,
  uploadProjectFromCSV,
  updateProjectFromCSV,
  // Novas funcionalidades baseadas no Flask
  getProcedimentoParada,
  getManutencao,
  getProcedimentoPartida,
  getAllFrentes,
} = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadCSVMiddleware } = require('../middlewares/uploadMiddleware');
const { apiLimiter, strictLimiter } = require('../middlewares/rateLimiter');
const {
  projectValidation,
  createValidationMiddleware,
} = require('../middlewares/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

// Rotas CRUD básicas para projetos
router.post(
  '/',
  uploadCSVMiddleware,
  createValidationMiddleware(projectValidation, 'create'),
  createProject
); // Criar projeto
router.get('/', getAllProjects); // Listar todos os projetos
router.get('/:id', getProjectById); // Obter projeto por ID
router.put(
  '/:id',
  createValidationMiddleware(projectValidation, 'update'),
  updateProject
); // Atualizar projeto
router.delete('/:id', strictLimiter, deleteProject); // Deletar projeto

// Rotas específicas para gerenciamento de usuários
router.get('/user/:userId', getProjectsByUser); // Projetos de um usuário específico

// Rotas para gerenciamento de equipe
router.post('/:id/team', addTeamMember); // Adicionar membro à equipe
router.delete('/:id/team/:userId', removeTeamMember); // Remover membro da equipe

// Rota para upload de projeto via CSV
router.post('/upload-csv', uploadCSVMiddleware, uploadProjectFromCSV);

// Rota para atualizar projeto existente com novo CSV
router.put('/:id/update-csv', uploadCSVMiddleware, updateProjectFromCSV);

// NOVAS ROTAS BASEADAS NO FLASK app.py
// Replicar exatamente as rotas do Flask
router.get('/api/procedimento_parada', getProcedimentoParada); // /api/procedimento_parada
router.get('/api/manutencao', getManutencao); // /api/manutencao
router.get('/api/procedimento_partida', getProcedimentoPartida); // /api/procedimento_partida
router.get('/api/frentes', getAllFrentes); // Nova rota para todas as frentes

module.exports = router;
