/**
 * MongoDB Project Repository
 * Infrastructure layer implementation for project persistence
 *
 * @author EPU-Gestão Team
 * @version 3.0.0
 */

const mongoose = require('mongoose');
const { Project } = require('../../domain/entities/ProjectEntity');
const { Logger } = require('../logging/Logger');

/**
 * MongoDB Schema for Project
 */
const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'draft',
        'active',
        'completed',
        'cancelled',
        'on-hold',
        'archived',
      ],
      default: 'draft',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    budget: {
      type: Number,
      min: 0,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    activities: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ['parada', 'manutencao', 'partida'],
          required: true,
        },
        planned: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        real: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'blocked'],
          default: 'pending',
        },
        description: {
          type: String,
          default: '',
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        estimatedHours: {
          type: Number,
          min: 0,
          default: 0,
        },
        actualHours: {
          type: Number,
          min: 0,
          default: 0,
        },
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
        dependencies: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        subActivities: [
          {
            name: String,
            real: Number,
            planned: Number,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress calculation
ProjectSchema.virtual('progress').get(function () {
  if (this.activities.length === 0) return 0;
  const totalProgress = this.activities.reduce(
    (sum, activity) => sum + activity.real,
    0
  );
  return Math.round(totalProgress / this.activities.length);
});

// Indexes for better query performance
ProjectSchema.index({ name: 'text', description: 'text' });
ProjectSchema.index({ status: 1, priority: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ team: 1 });
ProjectSchema.index({ createdAt: -1 });

const ProjectModel = mongoose.model('Project', ProjectSchema);

/**
 * MongoDB Project Repository Implementation
 */
class MongoProjectRepository {
  constructor() {
    this.model = ProjectModel;
    this.logger = new Logger('MongoProjectRepository');
  }

  /**
   * Create a new project
   * @param {Project} project - Project entity
   * @returns {Promise<Project>} Created project
   */
  async create(project) {
    this.logger.info('Creating project in database:', { name: project.name });

    try {
      const projectData = this.entityToModel(project);
      const savedProject = await this.model.create(projectData);

      this.logger.info('Project created successfully:', {
        id: savedProject._id,
      });
      return this.modelToEntity(savedProject);
    } catch (error) {
      this.logger.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Find project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Project|null>} Project or null if not found
   */
  async findById(id) {
    this.logger.info('Finding project by ID:', { id });

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        this.logger.warn('Invalid project ID format:', { id });
        return null;
      }

      const project = await this.model
        .findById(id)
        .populate('owner', 'name email')
        .populate('team', 'name email')
        .lean();

      if (!project) {
        this.logger.warn('Project not found:', { id });
        return null;
      }

      this.logger.info('Project found successfully:', { id: project._id });
      return this.modelToEntity(project);
    } catch (error) {
      this.logger.error('Error finding project by ID:', error);
      throw new Error(`Failed to find project: ${error.message}`);
    }
  }

  /**
   * Find all projects with optional filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array<Project>>} List of projects
   */
  async findAll(filters = {}) {
    this.logger.info('Finding all projects:', { filters });

    try {
      const query = this.buildQuery(filters);
      const sort = this.buildSort(filters);
      const { skip, limit } = this.buildPagination(filters);

      const projects = await this.model
        .find(query)
        .populate('owner', 'name email')
        .populate('team', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      this.logger.info('Projects found successfully:', {
        count: projects.length,
      });
      return projects.map((project) => this.modelToEntity(project));
    } catch (error) {
      this.logger.error('Error finding projects:', error);
      throw new Error(`Failed to find projects: ${error.message}`);
    }
  }

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Project} project - Updated project entity
   * @returns {Promise<Project>} Updated project
   */
  async update(id, project) {
    this.logger.info('Updating project:', { id, name: project.name });

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid project ID format');
      }

      const projectData = this.entityToModel(project);
      const updatedProject = await this.model
        .findByIdAndUpdate(
          id,
          { ...projectData, updatedAt: new Date() },
          { new: true, runValidators: true }
        )
        .populate('owner', 'name email')
        .populate('team', 'name email')
        .lean();

      if (!updatedProject) {
        throw new Error('Project not found');
      }

      this.logger.info('Project updated successfully:', {
        id: updatedProject._id,
      });
      return this.modelToEntity(updatedProject);
    } catch (error) {
      this.logger.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete project
   * @param {string} id - Project ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    this.logger.info('Deleting project:', { id });

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid project ID format');
      }

      const result = await this.model.findByIdAndDelete(id);

      if (!result) {
        throw new Error('Project not found');
      }

      this.logger.info('Project deleted successfully:', { id });
      return true;
    } catch (error) {
      this.logger.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Count projects with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<number>} Count of projects
   */
  async count(filters = {}) {
    this.logger.info('Counting projects:', { filters });

    try {
      const query = this.buildQuery(filters);
      const count = await this.model.countDocuments(query);

      this.logger.info('Projects counted successfully:', { count });
      return count;
    } catch (error) {
      this.logger.error('Error counting projects:', error);
      throw new Error(`Failed to count projects: ${error.message}`);
    }
  }

  /**
   * Convert Project entity to MongoDB model data
   * @private
   * @param {Project} project - Project entity
   * @returns {Object} Model data
   */
  entityToModel(project) {
    const data = project.toJSON();

    // Remove computed fields
    delete data.progress;
    delete data.statistics;

    // Convert ID
    if (data.id && data.id !== null) {
      data._id = data.id;
    }
    delete data.id;

    return data;
  }

  /**
   * Convert MongoDB model data to Project entity
   * @private
   * @param {Object} modelData - Model data
   * @returns {Project} Project entity
   */
  modelToEntity(modelData) {
    const data = { ...modelData };

    // Convert ID
    data.id = data._id ? data._id.toString() : null;
    delete data._id;
    delete data.__v;

    return new Project(data);
  }

  /**
   * Build MongoDB query from filters
   * @private
   * @param {Object} filters - Query filters
   * @returns {Object} MongoDB query
   */
  buildQuery(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.owner) {
      query.owner = filters.owner;
    }

    if (filters.team) {
      query.team = { $in: [filters.team] };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return query;
  }

  /**
   * Build sort options from filters
   * @private
   * @param {Object} filters - Query filters
   * @returns {Object} Sort options
   */
  buildSort(filters) {
    const sort = {};

    if (filters.sortBy) {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      sort[filters.sortBy] = order;
    } else {
      sort.createdAt = -1; // Default sort by creation date
    }

    return sort;
  }

  /**
   * Build pagination options from filters
   * @private
   * @param {Object} filters - Query filters
   * @returns {Object} Pagination options
   */
  buildPagination(filters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    return { skip, limit };
  }
}

module.exports = { MongoProjectRepository, ProjectModel };
