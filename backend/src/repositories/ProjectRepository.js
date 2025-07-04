/**
 * Project Repository - Data Access Layer
 *
 * Responsabilidade única: Acesso e persistência de dados de projetos
 * - Interface com banco de dados/storage
 * - Operações CRUD básicas
 * - Mapeamento de dados
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Infrastructure Layer
 */

const logger = require('../utils/logger');
const Project = require('../models/projectModels');

class ProjectRepository {
  constructor() {
    // Inicializa com modelo Mongoose
  }

  /**
   * Busca todos os projetos com filtros e paginação
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {},
      } = options;

      // Constroi query do MongoDB
      let query = Project.find({});

      // Aplica filtros se especificados
      if (Object.keys(filters).length > 0) {
        query = this.applyFilters(query, filters);
      }

      // Aplica ordenação
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      query = query.sort(sortOptions);

      // Aplica paginação
      const skip = (page - 1) * limit;
      const projects = await query.skip(skip).limit(limit).exec();

      // Conta total de documentos
      const total = await Project.countDocuments({});

      return {
        data: projects,
        total,
      };
    } catch (error) {
      logger.error('Error in ProjectRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Busca um projeto por ID
   */
  async findById(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await Project.findById(id).exec();
      return project;
    } catch (error) {
      logger.error(`Error in ProjectRepository.findById for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo projeto
   */
  async create(projectData) {
    try {
      if (!projectData) {
        throw new Error('Project data is required');
      }

      // Cria novo projeto com Mongoose
      const newProject = new Project(projectData);
      const savedProject = await newProject.save();

      logger.info(`Project created successfully: ${savedProject._id}`);
      return savedProject;
    } catch (error) {
      logger.error('Error in ProjectRepository.create:', error);
      throw error;
    }
  }

  /**
   * Atualiza um projeto existente
   */
  async update(id, updateData) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      if (!updateData) {
        throw new Error('Update data is required');
      }

      // Remove campos que não devem ser atualizados
      delete updateData.createdAt;
      updateData.updatedAt = new Date();

      const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updatedProject) {
        throw new Error('Project not found');
      }

      logger.info(`Project updated successfully: ${id}`);
      return updatedProject;
    } catch (error) {
      logger.error(`Error in ProjectRepository.update for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove um projeto
   */
  async delete(id) {
    try {
      if (!id) {
        throw new Error('Project ID is required');
      }

      const deletedProject = await Project.findByIdAndDelete(id).exec();

      if (!deletedProject) {
        throw new Error('Project not found');
      }

      logger.info(`Project deleted successfully: ${id}`);
      return { success: true, id };
    } catch (error) {
      logger.error(`Error in ProjectRepository.delete for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca projetos por filtros específicos
   */
  async findByFilters(filters) {
    try {
      let query = Project.find({});
      query = this.applyFilters(query, filters);

      const projects = await query.exec();
      return projects;
    } catch (error) {
      logger.error('Error in ProjectRepository.findByFilters:', error);
      throw error;
    }
  }

  /**
   * Conta total de projetos
   */
  async count(filters = {}) {
    try {
      let query = Project.countDocuments({});

      if (Object.keys(filters).length > 0) {
        query = Project.countDocuments(this.buildMongoFilter(filters));
      }

      return await query;
    } catch (error) {
      logger.error('Error in ProjectRepository.count:', error);
      throw error;
    }
  }

  /**
   * Busca projetos por status
   */
  async findByStatus(status) {
    try {
      const projects = await Project.find({ status }).exec();
      return projects;
    } catch (error) {
      logger.error(
        `Error in ProjectRepository.findByStatus for status ${status}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca projetos por proprietário
   */
  async findByOwner(ownerId) {
    try {
      const projects = await Project.find({ owner: ownerId }).exec();
      return projects;
    } catch (error) {
      logger.error(
        `Error in ProjectRepository.findByOwner for owner ${ownerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Duplica um projeto
   */
  async duplicate(id) {
    try {
      const originalProject = await this.findById(id);

      if (!originalProject) {
        throw new Error('Project not found');
      }

      // Remove campos únicos para duplicação
      const duplicateData = originalProject.toObject();
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      duplicateData.name = `${duplicateData.name} (Cópia)`;

      const duplicatedProject = await this.create(duplicateData);

      logger.info(
        `Project duplicated successfully: ${id} -> ${duplicatedProject._id}`
      );
      return duplicatedProject;
    } catch (error) {
      logger.error(`Error in ProjectRepository.duplicate for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Aplica filtros à query do MongoDB
   */
  applyFilters(query, filters) {
    if (filters.status) {
      query = query.where('status').equals(filters.status);
    }

    if (filters.priority) {
      query = query.where('priority').equals(filters.priority);
    }

    if (filters.owner) {
      query = query.where('owner').equals(filters.owner);
    }

    if (filters.search) {
      query = query.where({
        $or: [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ],
      });
    }

    if (filters.startDate) {
      query = query.where('startDate').gte(new Date(filters.startDate));
    }

    if (filters.endDate) {
      query = query.where('endDate').lte(new Date(filters.endDate));
    }

    if (filters.isActive !== undefined) {
      query = query.where('isActive').equals(filters.isActive);
    }

    return query;
  }

  /**
   * Constroi filtro MongoDB a partir de filtros simples
   */
  buildMongoFilter(filters) {
    const mongoFilter = {};

    if (filters.status) {
      mongoFilter.status = filters.status;
    }

    if (filters.priority) {
      mongoFilter.priority = filters.priority;
    }

    if (filters.owner) {
      mongoFilter.owner = filters.owner;
    }

    if (filters.isActive !== undefined) {
      mongoFilter.isActive = filters.isActive;
    }

    if (filters.search) {
      mongoFilter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return mongoFilter;
  }

  /**
   * Obtém estatísticas dos projetos
   */
  async getStats() {
    try {
      const totalProjects = await Project.countDocuments({});

      const statusStats = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const priorityStats = await Project.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]);

      const averageProgress = await Project.aggregate([
        { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
      ]);

      const totalBudget = await Project.aggregate([
        { $group: { _id: null, totalBudget: { $sum: '$budget' } } },
      ]);

      // Converte arrays para objetos
      const byStatus = {};
      statusStats.forEach((stat) => {
        byStatus[stat._id] = stat.count;
      });

      const byPriority = {};
      priorityStats.forEach((stat) => {
        byPriority[stat._id] = stat.count;
      });

      return {
        total: totalProjects,
        byStatus,
        byPriority,
        averageProgress: averageProgress[0]?.avgProgress || 0,
        totalBudget: totalBudget[0]?.totalBudget || 0,
        recentActivity: totalProjects, // Simplificado por enquanto
      };
    } catch (error) {
      logger.error('Error in ProjectRepository.getStats:', error);
      throw error;
    }
  }
}

module.exports = ProjectRepository;
