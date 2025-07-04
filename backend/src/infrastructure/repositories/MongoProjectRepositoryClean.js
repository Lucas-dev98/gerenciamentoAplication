// Infrastructure - MongoDB Project Repository (Clean Architecture)
const mongoose = require('mongoose');
const IRepository = require('../../core/interfaces/IRepository');
const Project = require('../../domain/entities/ProjectClean');
const Activity = require('../../domain/entities/Activity');

/**
 * MongoDB implementation of Project Repository
 * Follows Repository pattern and Clean Architecture principles
 */
class MongoProjectRepositoryClean extends IRepository {
  constructor() {
    super();
    this.initializeSchemas();
  }

  initializeSchemas() {
    // Activity Schema
    const activitySchema = new mongoose.Schema(
      {
        type: {
          type: String,
          required: true,
          enum: ['parada', 'manutencao', 'partida'],
        },
        name: { type: String, required: true },
        planned: { type: Number, default: 0 },
        real: { type: Number, default: 0 },
        image: String,
        order: { type: Number, default: 0 },
        description: String,
        assignedTo: String,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'medium',
        },
        estimatedHours: { type: Number, default: 0 },
        actualHours: { type: Number, default: 0 },
        tags: [String],
        dependencies: [
          {
            activityId: String,
            description: String,
            completed: { type: Boolean, default: false },
            addedAt: { type: Date, default: Date.now },
            completedAt: Date,
          },
        ],
        subActivities: [
          {
            id: String,
            name: String,
            planned: Number,
            real: Number,
            description: String,
            status: String,
            assignedTo: String,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
          },
        ],
        status: {
          type: String,
          enum: ['not_started', 'started', 'in_progress', 'completed'],
          default: 'not_started',
        },
      },
      { timestamps: true }
    );

    // Project Schema
    const projectSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        description: String,
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
          default: 'active',
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'medium',
        },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        owner: String,
        team: [
          {
            userId: String,
            name: String,
            role: String,
            joinedAt: { type: Date, default: Date.now },
            permissions: [String],
          },
        ],
        startDate: Date,
        endDate: Date,
        deadline: Date,
        budget: { type: Number, default: 0 },
        tags: [String],
        location: String,
        category: { type: String, default: 'general' },
        activities: [activitySchema],
        metadata: {
          csvImport: { type: Boolean, default: false },
          originalData: mongoose.Schema.Types.Mixed,
          processedAt: Date,
          statistics: mongoose.Schema.Types.Mixed,
          customFields: mongoose.Schema.Types.Mixed,
        },
        version: { type: Number, default: 1 },
      },
      {
        timestamps: true,
        versionKey: false,
      }
    );

    // Create indexes for better performance
    projectSchema.index({ name: 1 });
    projectSchema.index({ status: 1 });
    projectSchema.index({ priority: 1 });
    projectSchema.index({ owner: 1 });
    projectSchema.index({ 'activities.type': 1 });
    projectSchema.index({ createdAt: -1 });

    // Avoid OverwriteModelError
    try {
      this.ProjectModel = mongoose.model('ProjectClean');
    } catch (error) {
      this.ProjectModel = mongoose.model('ProjectClean', projectSchema);
    }
  }

  // Repository Interface Implementation
  async findById(id) {
    try {
      this.validateId(id);
      const projectData = await this.ProjectModel.findById(id).lean();
      return projectData ? this.toDomainEntity(projectData) : null;
    } catch (error) {
      console.error('Error finding project by ID:', error);
      throw new Error(`Failed to find project: ${error.message}`);
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const query = this.buildQuery(filters);
      const sortOptions = this.buildSortOptions(
        options.sortBy,
        options.sortOrder
      );

      let mongoQuery = this.ProjectModel.find(query);

      if (sortOptions) {
        mongoQuery = mongoQuery.sort(sortOptions);
      }

      if (options.limit) {
        mongoQuery = mongoQuery.limit(options.limit);
      }

      if (options.offset) {
        mongoQuery = mongoQuery.skip(options.offset);
      }

      const projectsData = await mongoQuery.lean();
      return projectsData.map((data) => this.toDomainEntity(data));
    } catch (error) {
      console.error('Error finding projects:', error);
      throw new Error(`Failed to retrieve projects: ${error.message}`);
    }
  }

  async save(project) {
    try {
      if (!(project instanceof Project)) {
        throw new Error('Invalid project entity');
      }

      if (!project.isValid()) {
        throw new Error('Project entity is not valid');
      }

      const projectData = this.toMongoDocument(project);

      let savedData;
      if (
        project.id &&
        mongoose.Types.ObjectId.isValid(project.id) &&
        (await this.exists(project.id))
      ) {
        // Update existing
        savedData = await this.ProjectModel.findByIdAndUpdate(
          project.id,
          { ...projectData, updatedAt: new Date() },
          { new: true, runValidators: true }
        ).lean();
      } else {
        // Create new
        const newProject = new this.ProjectModel(projectData);
        savedData = await newProject.save();
        savedData = savedData.toObject();
      }

      return this.toDomainEntity(savedData);
    } catch (error) {
      console.error('Error saving project:', error);
      throw new Error(`Failed to save project: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      this.validateId(id);
      const result = await this.ProjectModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async exists(id) {
    try {
      this.validateId(id);
      const count = await this.ProjectModel.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      console.error('Error checking project existence:', error);
      return false;
    }
  }

  async count(filters = {}) {
    try {
      const query = this.buildQuery(filters);
      return await this.ProjectModel.countDocuments(query);
    } catch (error) {
      console.error('Error counting projects:', error);
      throw new Error(`Failed to count projects: ${error.message}`);
    }
  }

  // Additional CRUD methods for compatibility with use cases
  async create(projectData) {
    try {
      // Convert plain object to Project entity
      const project = new Project(projectData);

      if (!project.isValid()) {
        throw new Error('Project data is not valid');
      }

      // Use save method to create new project
      return await this.save(project);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async update(id, projectData) {
    try {
      this.validateId(id);

      // Get existing project
      const existingProject = await this.findById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Merge with existing data
      const updatedData = {
        ...existingProject,
        ...projectData,
        id: id,
      };

      // Convert to Project entity
      const project = new Project(updatedData);

      if (!project.isValid()) {
        throw new Error('Updated project data is not valid');
      }

      // Use save method to update
      return await this.save(project);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async findByTeam(teamId) {
    try {
      if (!teamId) {
        throw new Error('Team ID is required');
      }

      const projectsData = await this.ProjectModel.find({
        'team.memberId': teamId,
      }).lean();

      return projectsData.map((data) => this.toDomainEntity(data));
    } catch (error) {
      console.error('Error finding projects by team:', error);
      throw new Error(`Failed to find projects by team: ${error.message}`);
    }
  }

  // Helper methods
  validateId(id) {
    if (!id) {
      throw new Error('Project ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid project ID format');
    }
  }

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

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  buildSortOptions(sortBy, sortOrder = 'desc') {
    const allowedFields = [
      'name',
      'createdAt',
      'updatedAt',
      'priority',
      'progress',
      'status',
    ];

    if (!sortBy || !allowedFields.includes(sortBy)) {
      return { createdAt: -1 }; // Default sort
    }

    const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    return { [sortBy]: order };
  }

  // Domain Entity conversion
  toDomainEntity(mongoData) {
    if (!mongoData) return null;

    try {
      // Convert MongoDB document to domain entity
      const projectData = {
        id: mongoData._id.toString(),
        name: mongoData.name,
        description: mongoData.description,
        status: mongoData.status,
        priority: mongoData.priority,
        progress: mongoData.progress,
        owner: mongoData.owner,
        team: mongoData.team || [],
        startDate: mongoData.startDate,
        endDate: mongoData.endDate,
        deadline: mongoData.deadline,
        budget: mongoData.budget,
        tags: mongoData.tags || [],
        location: mongoData.location,
        category: mongoData.category,
        metadata: mongoData.metadata || {},
        createdAt: mongoData.createdAt,
        updatedAt: mongoData.updatedAt,
        version: mongoData.version,
        activities: (mongoData.activities || []).map(
          (actData) =>
            new Activity({
              id: actData._id ? actData._id.toString() : actData.id,
              type: actData.type,
              name: actData.name,
              planned: actData.planned,
              real: actData.real,
              image: actData.image,
              order: actData.order,
              description: actData.description,
              assignedTo: actData.assignedTo,
              priority: actData.priority,
              estimatedHours: actData.estimatedHours,
              actualHours: actData.actualHours,
              tags: actData.tags || [],
              dependencies: actData.dependencies || [],
              subActivities: actData.subActivities || [],
              status: actData.status,
              createdAt: actData.createdAt,
              updatedAt: actData.updatedAt,
            })
        ),
      };

      return new Project(projectData);
    } catch (error) {
      console.error('Error converting to domain entity:', error);
      throw new Error(`Failed to convert project data: ${error.message}`);
    }
  }

  toMongoDocument(project) {
    if (!(project instanceof Project)) {
      throw new Error('Invalid project entity');
    }

    try {
      const document = {
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        progress: project.progress,
        owner: project.owner,
        team: project.team,
        startDate: project.startDate,
        endDate: project.endDate,
        deadline: project.deadline,
        budget: project.budget,
        tags: project.tags,
        location: project.location,
        category: project.category,
        metadata: project.metadata,
        version: project.version,
        activities: project.activities.map((activity) => ({
          type: activity.type,
          name: activity.name,
          planned: activity.planned,
          real: activity.real,
          image: activity.image,
          order: activity.order,
          description: activity.description,
          assignedTo: activity.assignedTo,
          priority: activity.priority,
          estimatedHours: activity.estimatedHours,
          actualHours: activity.actualHours,
          tags: activity.tags,
          dependencies: activity.dependencies,
          subActivities: activity.subActivities,
          status: activity.status,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
        })),
      };

      // Add ID only for updates (valid MongoDB ObjectId)
      if (project.id && mongoose.Types.ObjectId.isValid(project.id)) {
        document._id = new mongoose.Types.ObjectId(project.id);
      }

      return document;
    } catch (error) {
      console.error('Error converting to mongo document:', error);
      throw new Error(`Failed to convert project entity: ${error.message}`);
    }
  }
}

module.exports = MongoProjectRepositoryClean;
