const express = require('express');
const router = express.Router();

function createProjectCrudRoutes(projectCrudController) {
  // Middleware de validação para rotas que precisam de dados do projeto
  const validateProjectData = projectCrudController.validateProjectData.bind(
    projectCrudController
  );
  const uploadCsv = projectCrudController.uploadCsv();

  // GET /api/projects - Listar todos os projetos
  router.get('/', async (req, res) => {
    await projectCrudController.getAllProjects(req, res);
  });

  // GET /api/projects/stats - Estatísticas dos projetos
  router.get('/stats', async (req, res) => {
    await projectCrudController.getProjectStats(req, res);
  });

  // GET /api/projects/team/:teamId - Projetos por equipe
  router.get('/team/:teamId', async (req, res) => {
    await projectCrudController.getProjectsByTeam(req, res);
  });

  // POST /api/projects - Criar novo projeto
  router.post('/', validateProjectData, async (req, res) => {
    await projectCrudController.createProject(req, res);
  });

  // POST /api/projects-crud/import-csv - Criar projeto via CSV
  router.post('/import-csv', uploadCsv, async (req, res) => {
    await projectCrudController.importProjectFromCsv(req, res);
  });

  // GET /api/projects-crud/:id - Buscar projeto por ID
  router.get('/:id', async (req, res) => {
    await projectCrudController.getProjectById(req, res);
  });

  // GET /api/projects-crud/:id/frentes-data - Dados das frentes do projeto
  router.get('/:id/frentes-data', async (req, res) => {
    await projectCrudController.getProjectFrentesData(req, res);
  });

  // GET /api/projects-crud/:id/export-csv - Exportar projeto para CSV
  router.get('/:id/export-csv', async (req, res) => {
    await projectCrudController.exportProjectToCsv(req, res);
  });

  // PUT /api/projects-crud/:id - Atualizar projeto
  router.put('/:id', validateProjectData, async (req, res) => {
    await projectCrudController.updateProject(req, res);
  });

  // PUT /api/projects-crud/:id/update-csv - Atualizar projeto via CSV
  router.put('/:id/update-csv', uploadCsv, async (req, res) => {
    await projectCrudController.updateProjectFromCsv(req, res);
  });

  // DELETE /api/projects/:id - Excluir projeto
  router.delete('/:id', async (req, res) => {
    await projectCrudController.deleteProject(req, res);
  });

  // GET /api/projects/:id/export-csv - Exportar projeto para CSV
  router.get('/:id/export-csv', async (req, res) => {
    await projectCrudController.exportProjectToCsv(req, res);
  });

  // POST /api/projects/:id/duplicate - Duplicar projeto
  router.post('/:id/duplicate', async (req, res) => {
    await projectCrudController.duplicateProject(req, res);
  });

  return router;
}

module.exports = createProjectCrudRoutes;
