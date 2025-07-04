// Infrastructure - MongoDB Project Repository
const mongoose = require('mongoose');
const Project = require('../../domain/entities/Project');
const Activity = require('../../domain/entities/Activity');
const IProjectRepository = require('../../domain/repositories/IProjectRepository');

// MongoDB Schema
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
    subActivities: [
      {
        name: String,
        planned: Number,
        real: Number,
      },
    ],
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: 'active' },
    priority: { type: String, default: 'medium' },
    progress: { type: Number, default: 0 },
    activities: [activitySchema],
    metadata: {
      csvFile: String,
      processedAt: Date,
      totalRows: Number,
      statistics: {
        totalProgress: Number,
        completedActivities: Number,
        pendingActivities: Number,
      },
    },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model('Project', projectSchema);

class MongoProjectRepository extends IProjectRepository {
  async findById(id) {
    try {
      const projectDoc = await ProjectModel.findById(id);
      if (!projectDoc) return null;

      return this.mapToEntity(projectDoc);
    } catch (error) {
      throw new Error(`Failed to find project by id: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const projectDocs = await ProjectModel.find({});
      return projectDocs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to find all projects: ${error.message}`);
    }
  }

  async save(project) {
    try {
      const projectDoc = new ProjectModel(this.mapToDocument(project));
      const savedDoc = await projectDoc.save();
      return this.mapToEntity(savedDoc);
    } catch (error) {
      throw new Error(`Failed to save project: ${error.message}`);
    }
  }

  async update(id, project) {
    try {
      const updatedDoc = await ProjectModel.findByIdAndUpdate(
        id,
        this.mapToDocument(project),
        { new: true }
      );
      if (!updatedDoc) {
        throw new Error('Project not found');
      }
      return this.mapToEntity(updatedDoc);
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedDoc = await ProjectModel.findByIdAndDelete(id);
      return deletedDoc ? this.mapToEntity(deletedDoc) : null;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async findByStatus(status) {
    try {
      const projectDocs = await ProjectModel.find({ status });
      return projectDocs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to find projects by status: ${error.message}`);
    }
  }

  async findByPriority(priority) {
    try {
      const projectDocs = await ProjectModel.find({ priority });
      return projectDocs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to find projects by priority: ${error.message}`);
    }
  }

  // Mapping methods
  mapToEntity(doc) {
    const activities = doc.activities.map(
      (activityDoc) =>
        new Activity({
          id: activityDoc._id.toString(),
          type: activityDoc.type,
          name: activityDoc.name,
          planned: activityDoc.planned,
          real: activityDoc.real,
          image: activityDoc.image,
          subActivities: activityDoc.subActivities || [],
          createdAt: activityDoc.createdAt,
          updatedAt: activityDoc.updatedAt,
        })
    );

    return new Project({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      status: doc.status,
      priority: doc.priority,
      progress: doc.progress,
      activities,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  mapToDocument(project) {
    return {
      _id: project.id ? new mongoose.Types.ObjectId(project.id) : undefined,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      activities: project.activities.map((activity) => ({
        type: activity.type,
        name: activity.name,
        planned: activity.planned,
        real: activity.real,
        image: activity.image,
        subActivities: activity.subActivities,
      })),
      metadata: project.metadata,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

module.exports = MongoProjectRepository;
