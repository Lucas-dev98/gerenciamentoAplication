/**
 * Project Entity
 * Core business entity for project management
 *
 * @author EPU-Gestão Team
 * @version 3.0.0
 */

/**
 * Project status enumeration
 */
const ProjectStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on-hold',
  ARCHIVED: 'archived',
  IN_PROGRESS: 'active', // Alias for ACTIVE
  PAUSED: 'on-hold', // Alias for ON_HOLD
  NOT_STARTED: 'draft', // Alias for DRAFT
};

/**
 * Project priority enumeration
 */
const ProjectPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

/**
 * Activity type enumeration
 */
const ActivityType = {
  PARADA: 'parada',
  MANUTENCAO: 'manutencao',
  PARTIDA: 'partida',
};

/**
 * Activity status enumeration
 */
const ActivityStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

/**
 * Project Activity Entity
 */
class ProjectActivity {
  constructor({
    id,
    name,
    type,
    planned = 0,
    real = 0,
    status = ActivityStatus.PENDING,
    description = '',
    assignedTo = null,
    estimatedHours = 0,
    actualHours = 0,
    startDate = null,
    endDate = null,
    dependencies = [],
    subActivities = [],
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.planned = Math.max(0, Math.min(100, planned));
    this.real = Math.max(0, Math.min(100, real));
    this.status = status;
    this.description = description;
    this.assignedTo = assignedTo;
    this.estimatedHours = Math.max(0, estimatedHours);
    this.actualHours = Math.max(0, actualHours);
    this.startDate = startDate;
    this.endDate = endDate;
    this.dependencies = dependencies;
    this.subActivities = subActivities;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Calculate activity progress percentage
   */
  getProgress() {
    return this.real;
  }

  /**
   * Check if activity is completed
   */
  isCompleted() {
    return this.status === ActivityStatus.COMPLETED || this.real >= 100;
  }

  /**
   * Check if activity is overdue
   */
  isOverdue() {
    if (!this.endDate) return false;
    return new Date() > new Date(this.endDate) && !this.isCompleted();
  }

  /**
   * Update activity progress
   */
  updateProgress(real, status = null) {
    this.real = Math.max(0, Math.min(100, real));
    if (status) {
      this.status = status;
    }
    if (this.real >= 100 && this.status !== ActivityStatus.COMPLETED) {
      this.status = ActivityStatus.COMPLETED;
    }
    this.updatedAt = new Date();
  }

  /**
   * Validate activity data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 3) {
      errors.push('Activity name must have at least 3 characters');
    }

    if (!Object.values(ActivityType).includes(this.type)) {
      errors.push('Invalid activity type');
    }

    if (!Object.values(ActivityStatus).includes(this.status)) {
      errors.push('Invalid activity status');
    }

    if (this.planned < 0 || this.planned > 100) {
      errors.push('Planned progress must be between 0 and 100');
    }

    if (this.real < 0 || this.real > 100) {
      errors.push('Real progress must be between 0 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Project Entity
 * Main business entity for project management
 */
class Project {
  constructor({
    id,
    name,
    description = '',
    status = ProjectStatus.DRAFT,
    priority = ProjectPriority.MEDIUM,
    budget = 0,
    startDate = null,
    endDate = null,
    owner = null,
    team = [],
    tags = [],
    activities = [],
    metadata = {},
  }) {
    // Validations
    this._validateName(name);
    this._validateOwner(owner);
    this._validateDates(startDate, endDate);

    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.budget = Math.max(0, budget);
    this.startDate = startDate;
    this.endDate = endDate;
    this.owner = owner;
    this.team = team;
    this.tags = tags;
    this.activities = activities.map((activity) =>
      activity instanceof ProjectActivity
        ? activity
        : new ProjectActivity(activity)
    );
    this.metadata = metadata;
    this.progress = 0; // Initialize progress
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Validate project name
   */
  _validateName(name) {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome do projeto é obrigatório');
    }
    if (name.trim().length < 3) {
      throw new Error('Nome do projeto deve ter pelo menos 3 caracteres');
    }
  }

  /**
   * Validate project owner
   */
  _validateOwner(owner) {
    if (!owner || owner.trim().length === 0) {
      throw new Error('Proprietário do projeto é obrigatório');
    }
  }

  /**
   * Validate project dates
   */
  _validateDates(startDate, endDate) {
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('Data de início deve ser anterior à data de fim');
      }
    }
  }

  /**
   * Calculate overall project progress
   */
  getProgress() {
    if (this.activities.length === 0) return 0;

    const totalProgress = this.activities.reduce(
      (sum, activity) => sum + activity.getProgress(),
      0
    );
    return Math.round(totalProgress / this.activities.length);
  }

  /**
   * Get project statistics
   */
  getStatistics() {
    const stats = {
      totalActivities: this.activities.length,
      completedActivities: this.activities.filter((a) => a.isCompleted())
        .length,
      inProgressActivities: this.activities.filter(
        (a) => a.status === ActivityStatus.IN_PROGRESS
      ).length,
      pendingActivities: this.activities.filter(
        (a) => a.status === ActivityStatus.PENDING
      ).length,
      overdueActivities: this.activities.filter((a) => a.isOverdue()).length,
      totalEstimatedHours: this.activities.reduce(
        (sum, a) => sum + a.estimatedHours,
        0
      ),
      totalActualHours: this.activities.reduce(
        (sum, a) => sum + a.actualHours,
        0
      ),
      overallProgress: this.getProgress(),
    };

    // Calculate efficiency
    stats.efficiency =
      stats.totalEstimatedHours > 0
        ? Math.round(
            (stats.totalEstimatedHours / Math.max(stats.totalActualHours, 1)) *
              100
          )
        : 100;

    return stats;
  }

  /**
   * Get activities by type
   */
  getActivitiesByType(type) {
    return this.activities.filter((activity) => activity.type === type);
  }

  /**
   * Add activity to project
   */
  addActivity(activityData) {
    const activity = new ProjectActivity(activityData);
    const validation = activity.validate();

    if (!validation.isValid) {
      throw new Error(`Invalid activity: ${validation.errors.join(', ')}`);
    }

    this.activities.push(activity);
    this.updatedAt = new Date();
    return activity;
  }

  /**
   * Update activity
   */
  updateActivity(activityId, updateData) {
    const activityIndex = this.activities.findIndex((a) => a.id === activityId);
    if (activityIndex === -1) {
      throw new Error('Activity not found');
    }

    const activity = this.activities[activityIndex];
    Object.assign(activity, updateData);
    activity.updatedAt = new Date();
    this.updatedAt = new Date();

    const validation = activity.validate();
    if (!validation.isValid) {
      throw new Error(
        `Invalid activity update: ${validation.errors.join(', ')}`
      );
    }

    return activity;
  }

  /**
   * Remove activity
   */
  removeActivity(activityId) {
    const activityIndex = this.activities.findIndex((a) => a.id === activityId);
    if (activityIndex === -1) {
      throw new Error('Activity not found');
    }

    this.activities.splice(activityIndex, 1);
    this.updatedAt = new Date();
  }

  /**
   * Check if project is overdue
   */
  isOverdue() {
    if (!this.endDate) return false;
    return (
      new Date() > new Date(this.endDate) &&
      this.status !== ProjectStatus.COMPLETED
    );
  }

  /**
   * Check if project is completed
   */
  isCompleted() {
    return this.status === ProjectStatus.COMPLETED;
  }

  /**
   * Update project status
   */
  updateStatus(newStatus) {
    if (!Object.values(ProjectStatus).includes(newStatus)) {
      throw new Error('Invalid project status');
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Validate project data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 3) {
      errors.push('Project name must have at least 3 characters');
    }

    if (!Object.values(ProjectStatus).includes(this.status)) {
      errors.push('Invalid project status');
    }

    if (!Object.values(ProjectPriority).includes(this.priority)) {
      errors.push('Invalid project priority');
    }

    if (this.budget < 0) {
      errors.push('Budget must be a positive number');
    }

    if (
      this.startDate &&
      this.endDate &&
      new Date(this.startDate) > new Date(this.endDate)
    ) {
      errors.push('Start date must be before end date');
    }

    // Validate activities
    this.activities.forEach((activity, index) => {
      const activityValidation = activity.validate();
      if (!activityValidation.isValid) {
        errors.push(
          `Activity ${index + 1}: ${activityValidation.errors.join(', ')}`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Start the project
   */
  start() {
    if (this.status === ProjectStatus.ACTIVE) {
      throw new Error('Projeto já foi iniciado');
    }
    this.status = ProjectStatus.ACTIVE;
    if (!this.startDate) {
      this.startDate = new Date();
    }
    this.updatedAt = new Date();
  }

  /**
   * Complete the project
   */
  complete() {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error('Projeto deve estar em progresso para ser concluído');
    }
    this.status = ProjectStatus.COMPLETED;
    this.progress = 100;
    this.endDate = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Pause the project
   */
  pause() {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error('Apenas projetos ativos podem ser pausados');
    }
    this.status = ProjectStatus.ON_HOLD;
    this.updatedAt = new Date();
  }

  /**
   * Resume the project
   */
  resume() {
    if (this.status !== ProjectStatus.ON_HOLD) {
      throw new Error('Apenas projetos pausados podem ser retomados');
    }
    this.status = ProjectStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Cancel the project
   */
  cancel() {
    this.status = ProjectStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * Calculate and update project progress
   */
  calculateProgress() {
    this.progress = this.getProgress();
    return this.progress;
  }

  /**
   * Update project progress manually
   */
  updateProgress(progress) {
    this.progress = Math.max(0, Math.min(100, progress));
    this.updatedAt = new Date();
  }

  /**
   * Add activity to project
   */
  addActivity(activityData) {
    const activity =
      activityData instanceof ProjectActivity
        ? activityData
        : new ProjectActivity(activityData);

    this.activities.push(activity);
    this.updatedAt = new Date();
    return activity;
  }

  /**
   * Remove activity from project
   */
  removeActivity(activityId) {
    const index = this.activities.findIndex(
      (activity) => activity.id === activityId
    );
    if (index !== -1) {
      this.activities.splice(index, 1);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Update activity progress
   */
  updateActivityProgress(activityId, progress) {
    const activity = this.activities.find((a) => a.id === activityId);
    if (activity) {
      activity.updateProgress(progress);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get activities by type
   */
  getActivitiesByType(type) {
    return this.activities.filter((activity) => activity.type === type);
  }

  /**
   * Create project from JSON
   */
  static fromJSON(json) {
    const project = new Project({
      id: json.id,
      name: json.name,
      description: json.description,
      status: json.status,
      priority: json.priority,
      budget: json.budget,
      startDate: json.startDate,
      endDate: json.endDate,
      owner: json.owner,
      team: json.team,
      tags: json.tags,
      activities: json.activities || [],
      metadata: json.metadata || {},
    });

    project.progress = json.progress || 0;
    project.createdAt = json.createdAt ? new Date(json.createdAt) : new Date();
    project.updatedAt = json.updatedAt ? new Date(json.updatedAt) : new Date();

    return project;
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      priority: this.priority,
      budget: this.budget,
      startDate: this.startDate,
      endDate: this.endDate,
      owner: this.owner,
      team: this.team,
      tags: this.tags,
      activities: this.activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        planned: activity.planned,
        real: activity.real,
        status: activity.status,
        description: activity.description,
        assignedTo: activity.assignedTo,
        estimatedHours: activity.estimatedHours,
        actualHours: activity.actualHours,
        startDate: activity.startDate,
        endDate: activity.endDate,
        dependencies: activity.dependencies,
        subActivities: activity.subActivities,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      })),
      metadata: this.metadata,
      progress: this.getProgress(),
      statistics: this.getStatistics(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = {
  ProjectEntity: Project,
  Project,
  ProjectActivity,
  ProjectStatus,
  ProjectPriority,
  ActivityType,
  ActivityStatus,
};
