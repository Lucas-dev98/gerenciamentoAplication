/**
 * Frentes Service - Single Responsibility Frentes Handler
 *
 * Responsabilidade única: Gerenciamento de frentes de trabalho
 * - CRUD de frentes
 * - Cálculo de progresso
 * - Gerenciamento de atividades
 * - Métricas e relatórios
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Application Layer
 */

const logger = require('../utils/logger');

class FrentesService {
  constructor() {
    // Mock storage para frentes (em produção seria um repositório)
    this.frentes = new Map();
    this.initializeMockData();
  }

  /**
   * Busca frentes por projeto
   */
  async getFrentesByProject(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const projectFrentes = Array.from(this.frentes.values()).filter(
        (frente) => frente.projectId === projectId
      );

      return projectFrentes;
    } catch (error) {
      logger.error(`Error getting frentes for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Busca uma frente por ID
   */
  async getFrenteById(frenteId) {
    try {
      if (!frenteId) {
        throw new Error('Frente ID is required');
      }

      const frente = this.frentes.get(frenteId);
      return frente || null;
    } catch (error) {
      logger.error(`Error getting frente ${frenteId}:`, error);
      throw error;
    }
  }

  /**
   * Cria uma nova frente
   */
  async createFrente(frenteData) {
    try {
      this.validateFrenteData(frenteData);

      const frenteId = this.generateId();
      const newFrente = {
        id: frenteId,
        ...frenteData,
        progress: frenteData.progress || 0,
        status: frenteData.status || 'pending',
        activities: frenteData.activities || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.frentes.set(frenteId, newFrente);

      logger.info(`Frente created: ${frenteId}`);
      return newFrente;
    } catch (error) {
      logger.error('Error creating frente:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma frente
   */
  async updateFrente(frenteId, updateData) {
    try {
      if (!frenteId) {
        throw new Error('Frente ID is required');
      }

      const existingFrente = this.frentes.get(frenteId);
      if (!existingFrente) {
        throw new Error('Frente not found');
      }

      this.validateUpdateData(updateData);

      const updatedFrente = {
        ...existingFrente,
        ...updateData,
        updatedAt: new Date(),
      };

      this.frentes.set(frenteId, updatedFrente);

      // Recalcula progresso se atividades foram atualizadas
      if (updateData.activities) {
        await this.updateFrenteProgress(frenteId);
      }

      logger.info(`Frente updated: ${frenteId}`);
      return updatedFrente;
    } catch (error) {
      logger.error(`Error updating frente ${frenteId}:`, error);
      throw error;
    }
  }

  /**
   * Remove uma frente
   */
  async deleteFrente(frenteId) {
    try {
      if (!frenteId) {
        throw new Error('Frente ID is required');
      }

      const deleted = this.frentes.delete(frenteId);

      if (deleted) {
        logger.info(`Frente deleted: ${frenteId}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Error deleting frente ${frenteId}:`, error);
      throw error;
    }
  }

  /**
   * Adiciona uma atividade a uma frente
   */
  async addActivity(frenteId, activityData) {
    try {
      if (!frenteId) {
        throw new Error('Frente ID is required');
      }

      const frente = this.frentes.get(frenteId);
      if (!frente) {
        throw new Error('Frente not found');
      }

      this.validateActivityData(activityData);

      const activityId = this.generateId();
      const newActivity = {
        id: activityId,
        ...activityData,
        progress: activityData.progress || 0,
        status: activityData.status || 'pending',
        subActivities: activityData.subActivities || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      frente.activities.push(newActivity);
      frente.updatedAt = new Date();

      this.frentes.set(frenteId, frente);

      // Recalcula progresso da frente
      await this.updateFrenteProgress(frenteId);

      logger.info(`Activity added to frente ${frenteId}: ${activityId}`);
      return newActivity;
    } catch (error) {
      logger.error(`Error adding activity to frente ${frenteId}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza uma atividade
   */
  async updateActivity(frenteId, activityId, updateData) {
    try {
      if (!frenteId || !activityId) {
        throw new Error('Frente ID and Activity ID are required');
      }

      const frente = this.frentes.get(frenteId);
      if (!frente) {
        throw new Error('Frente not found');
      }

      const activityIndex = frente.activities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex === -1) {
        throw new Error('Activity not found');
      }

      this.validateUpdateData(updateData);

      frente.activities[activityIndex] = {
        ...frente.activities[activityIndex],
        ...updateData,
        updatedAt: new Date(),
      };

      frente.updatedAt = new Date();
      this.frentes.set(frenteId, frente);

      // Recalcula progresso da frente
      await this.updateFrenteProgress(frenteId);

      logger.info(`Activity updated in frente ${frenteId}: ${activityId}`);
      return frente.activities[activityIndex];
    } catch (error) {
      logger.error(
        `Error updating activity ${activityId} in frente ${frenteId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Calcula métricas de uma frente
   */
  async getFrenteMetrics(frenteId) {
    try {
      if (!frenteId) {
        throw new Error('Frente ID is required');
      }

      const frente = this.frentes.get(frenteId);
      if (!frente) {
        throw new Error('Frente not found');
      }

      const metrics = this.calculateFrenteMetrics(frente);
      return metrics;
    } catch (error) {
      logger.error(`Error calculating metrics for frente ${frenteId}:`, error);
      throw error;
    }
  }

  /**
   * Busca frentes por status
   */
  async getFrentesByStatus(status) {
    try {
      if (!status) {
        throw new Error('Status is required');
      }

      const frentesByStatus = Array.from(this.frentes.values()).filter(
        (frente) => frente.status === status
      );

      return frentesByStatus;
    } catch (error) {
      logger.error(`Error getting frentes by status ${status}:`, error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  /**
   * Valida dados obrigatórios da frente
   */
  validateFrenteData(data) {
    const required = ['name', 'projectId'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Field '${field}' is required`);
      }
    }

    if (data.name.length < 3) {
      throw new Error('Frente name must be at least 3 characters long');
    }
  }

  /**
   * Valida dados de atividade
   */
  validateActivityData(data) {
    if (!data.name || data.name.length < 3) {
      throw new Error('Activity name must be at least 3 characters long');
    }

    if (data.progress && (data.progress < 0 || data.progress > 100)) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  /**
   * Valida dados de atualização
   */
  validateUpdateData(data) {
    if (data.name && data.name.length < 3) {
      throw new Error('Name must be at least 3 characters long');
    }

    if (data.progress && (data.progress < 0 || data.progress > 100)) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  /**
   * Atualiza o progresso de uma frente baseado em suas atividades
   */
  async updateFrenteProgress(frenteId) {
    try {
      const frente = this.frentes.get(frenteId);
      if (!frente || !frente.activities || frente.activities.length === 0) {
        return;
      }

      const totalProgress = frente.activities.reduce((sum, activity) => {
        return sum + (activity.progress || 0);
      }, 0);

      const averageProgress = Math.round(
        totalProgress / frente.activities.length
      );

      frente.progress = averageProgress;
      frente.updatedAt = new Date();

      // Atualiza status baseado no progresso
      if (averageProgress === 0) {
        frente.status = 'pending';
      } else if (averageProgress === 100) {
        frente.status = 'completed';
      } else {
        frente.status = 'in_progress';
      }

      this.frentes.set(frenteId, frente);
    } catch (error) {
      logger.error(`Error updating frente progress ${frenteId}:`, error);
    }
  }

  /**
   * Calcula métricas de uma frente
   */
  calculateFrenteMetrics(frente) {
    const activities = frente.activities || [];

    const metrics = {
      totalActivities: activities.length,
      completedActivities: activities.filter((a) => a.status === 'completed')
        .length,
      inProgressActivities: activities.filter((a) => a.status === 'in_progress')
        .length,
      pendingActivities: activities.filter((a) => a.status === 'pending')
        .length,
      totalProgress: frente.progress || 0,
      averageActivityProgress: 0,
    };

    if (activities.length > 0) {
      const totalActivityProgress = activities.reduce(
        (sum, a) => sum + (a.progress || 0),
        0
      );
      metrics.averageActivityProgress = Math.round(
        totalActivityProgress / activities.length
      );
    }

    return metrics;
  }

  /**
   * Gera um ID único
   */
  generateId() {
    return `frente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicializa dados mock para desenvolvimento
   */
  initializeMockData() {
    const sampleFrentes = [
      {
        id: 'frente1',
        name: 'Frente de Desenvolvimento Frontend',
        projectId: 'project1',
        progress: 75,
        status: 'in_progress',
        activities: [
          {
            id: 'activity1',
            name: 'Design System',
            progress: 100,
            status: 'completed',
            subActivities: [],
          },
          {
            id: 'activity2',
            name: 'Implementação de Telas',
            progress: 50,
            status: 'in_progress',
            subActivities: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'frente2',
        name: 'Frente de Desenvolvimento Backend',
        projectId: 'project1',
        progress: 60,
        status: 'in_progress',
        activities: [
          {
            id: 'activity3',
            name: 'APIs REST',
            progress: 80,
            status: 'in_progress',
            subActivities: [],
          },
          {
            id: 'activity4',
            name: 'Banco de Dados',
            progress: 40,
            status: 'in_progress',
            subActivities: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleFrentes.forEach((frente) => {
      this.frentes.set(frente.id, frente);
    });
  }
}

// Exporta uma instância única (singleton)
module.exports = new FrentesService();
