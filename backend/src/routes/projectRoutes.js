/**
 * Project Routes - Single Responsibility Route Handler
 *
 * Responsabilidade única: Definir rotas HTTP para projetos
 * - Mapeamento de URLs para actions do controller
 * - Aplicação de middlewares específicos
 * - Validação de parâmetros de rota
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Interface Layer
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const projectController = require('../controllers/ProjectController');
const logger = require('../utils/logger');

console.log('📂 Project routes loading...');

// Middleware de autenticação obrigatório para TODAS as rotas
router.use(authMiddleware);

// === ROTAS PRINCIPAIS ===

/**
 * GET /api/projects - Listar todos os projetos
 */
router.get('/', projectController.getAllProjects.bind(projectController));

/**
 * GET /api/projects/statistics - Project statistics (must come before /:id routes)
 */
router.get(
  '/statistics',
  projectController.getProjectStatistics.bind(projectController)
);

/**
 * GET /api/projects/:id - Buscar projeto por ID
 */
router.get('/:id', projectController.getProjectById.bind(projectController));

/**
 * POST /api/projects - Criar novo projeto
 */
router.post('/', projectController.createProject.bind(projectController));

/**
 * PUT /api/projects/:id - Atualizar projeto
 */
router.put('/:id', projectController.updateProject.bind(projectController));

/**
 * DELETE /api/projects/:id - Remover projeto
 */
router.delete('/:id', projectController.deleteProject.bind(projectController));

// === ROTAS ESPECIALIZADAS ===

/**
 * POST /api/projects/upload-csv - Upload de arquivo CSV
 */
router.post(
  '/upload-csv',
  uploadMiddleware.uploadCSVWithMetadataMiddleware,
  projectController.uploadCSV.bind(projectController)
);

/**
 * POST /api/projects/import-csv - Alias for upload-csv (frontend compatibility)
 */
router.post(
  '/import-csv',
  uploadMiddleware.uploadCSVWithMetadataMiddleware,
  projectController.uploadCSV.bind(projectController)
);

/**
 * GET /api/projects/:id/export-csv - Exportar projeto em CSV
 */
router.get(
  '/:id/export-csv',
  projectController.exportCSV.bind(projectController)
);

/**
 * GET /api/projects/:id/dashboard - Dados do dashboard
 */
router.get(
  '/:id/dashboard',
  projectController.getProjectDashboard.bind(projectController)
);

/**
 * GET /api/projects/:id/frentes - Frentes do projeto
 */
router.get(
  '/:id/frentes',
  projectController.getProjectFrentes.bind(projectController)
);

/**
 * PUT /api/projects/:id/frentes/:frenteId - Atualizar frente
 */
router.put(
  '/:id/frentes/:frenteId',
  projectController.updateProjectFrente.bind(projectController)
);

// === FRONTEND COMPATIBILITY ALIASES ===
// Create a separate CRUD router for /api/projects-crud endpoints
const crudRouter = express.Router();

// Apply auth middleware to CRUD routes as well
crudRouter.use(authMiddleware);

// CRUD aliases - map to the same controller methods
crudRouter.get('/', projectController.getAllProjects.bind(projectController));

// Statistics routes must come before /:id to avoid being caught as an ID
crudRouter.get(
  '/stats',
  projectController.getProjectStatistics.bind(projectController)
);

crudRouter.get(
  '/statistics',
  projectController.getProjectStatistics.bind(projectController)
);

crudRouter.get(
  '/:id',
  projectController.getProjectById.bind(projectController)
);
crudRouter.post('/', projectController.createProject.bind(projectController));
crudRouter.put('/:id', projectController.updateProject.bind(projectController));
crudRouter.delete(
  '/:id',
  projectController.deleteProject.bind(projectController)
);

// CSV import alias for CRUD route
crudRouter.post(
  '/import-csv',
  uploadMiddleware.uploadCSVWithMetadataMiddleware,
  projectController.uploadCSV.bind(projectController)
);

console.log('✅ Project routes loaded successfully');

// Export both routers
module.exports = router;
module.exports.crudRouter = crudRouter;
