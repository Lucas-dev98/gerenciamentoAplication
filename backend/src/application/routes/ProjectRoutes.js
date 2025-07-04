// Application - Routes (Clean Architecture)
const express = require('express');

class ProjectRoutes {
  constructor(projectController) {
    this.router = express.Router();
    this.projectController = projectController;
    this.setupRoutes();
  }

  setupRoutes() {
    // Project CRUD routes
    this.router.get(
      '/',
      this.projectController.getAllProjects.bind(this.projectController)
    );
    this.router.get(
      '/:id',
      this.projectController.getProjectById.bind(this.projectController)
    );
    this.router.post(
      '/',
      this.projectController.createProject.bind(this.projectController)
    );
    this.router.put(
      '/:id',
      this.projectController.updateProject.bind(this.projectController)
    );

    // Project specific data routes
    this.router.get(
      '/:id/procedimento-parada',
      this.projectController.getProcedimentoParada.bind(this.projectController)
    );
    this.router.get(
      '/:id/manutencao',
      this.projectController.getManutencao.bind(this.projectController)
    );
    this.router.get(
      '/:id/procedimento-partida',
      this.projectController.getProcedimentoPartida.bind(this.projectController)
    );
    this.router.get(
      '/:id/frentes',
      this.projectController.getProjectFrentes.bind(this.projectController)
    );
    this.router.get(
      '/:id/statistics',
      this.projectController.getProjectStatistics.bind(this.projectController)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ProjectRoutes;
