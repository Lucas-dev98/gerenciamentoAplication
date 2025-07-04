// Domain Entities - Project Entity (Clean Architecture)
const BaseEntity = require('../../core/entities/BaseEntity');
const Activity = require('./Activity');

/**
 * Project domain entity representing a business project
 * Follows Clean Architecture and Domain-Driven Design principles
 */
class Project extends BaseEntity {
  constructor({
    id,
    name,
    description = '',
    status = 'active',
    priority = 'medium',
    progress = 0,
    activities = [],
    metadata = {},
    owner = null,
    team = [],
    startDate = null,
    endDate = null,
    deadline = null,
    budget = 0,
    tags = [],
    location = '',
    category = 'general',
    ...baseProps
  }) {
    super({ id, ...baseProps });

    // Validate required fields
    this.validateRequiredFields({ name });

    // Core properties
    this.name = this.sanitizeName(name);
    this.description = description;
    this.status = this.validateStatus(status);
    this.priority = this.validatePriority(priority);
    this.owner = owner;
    this.startDate = startDate ? new Date(startDate) : null;
    this.endDate = endDate ? new Date(endDate) : null;
    this.deadline = deadline ? new Date(deadline) : null;
    this.budget = this.validateNumericValue(budget, 'budget');
    this.tags = Array.isArray(tags) ? tags : [];
    this.location = location;
    this.category = category;
    this.team = Array.isArray(team) ? team : [];

    // Initialize activities as domain entities
    this.activities = this.initializeActivities(activities);

    // Metadata for additional information
    this.metadata = {
      csvImport: false,
      originalData: null,
      processedAt: null,
      ...metadata,
    };

    // Calculate initial progress
    this.updateProgress();
  }

  // Validation methods
  validateRequiredFields({ name }) {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name is required');
    }
  }

  validateStatus(status) {
    const validStatuses = [
      'draft',
      'active',
      'completed',
      'cancelled',
      'on-hold',
      'archived',
    ];
    if (!validStatuses.includes(status)) {
      return 'active'; // Default fallback
    }
    return status;
  }

  validatePriority(priority) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return 'medium'; // Default fallback
    }
    return priority;
  }

  validateNumericValue(value, fieldName) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return 0; // Default fallback
    }
    return numValue;
  }

  sanitizeName(name) {
    return name.trim().replace(/\s+/g, ' ');
  }

  initializeActivities(activities) {
    if (!Array.isArray(activities)) return [];

    return activities.map((activityData) => {
      if (activityData instanceof Activity) {
        return activityData;
      }
      return new Activity(activityData);
    });
  }

  // Business Logic Methods
  calculateProgress() {
    if (this.activities.length === 0) return 0;

    const totalPlanned = this.activities.reduce(
      (sum, activity) => sum + activity.planned,
      0
    );
    const totalReal = this.activities.reduce(
      (sum, activity) => sum + activity.real,
      0
    );

    if (totalPlanned === 0) return 0;
    return Math.min(100, Math.max(0, (totalReal / totalPlanned) * 100));
  }

  updateProgress() {
    this.progress = this.calculateProgress();
    this.touch();
  }

  getActivitiesByType(type) {
    return this.activities.filter((activity) => activity.type === type);
  }

  getStatistics() {
    const totalActivities = this.activities.length;
    const completedActivities = this.activities.filter((activity) =>
      activity.isCompleted()
    ).length;
    const inProgressActivities = this.activities.filter(
      (activity) => activity.status === 'in_progress'
    ).length;
    const notStartedActivities = this.activities.filter(
      (activity) => activity.status === 'not_started'
    ).length;

    // Calculate type-specific statistics
    const typeStats = {
      parada: this.getTypeStatistics('parada'),
      manutencao: this.getTypeStatistics('manutencao'),
      partida: this.getTypeStatistics('partida'),
    };

    // Calculate efficiency metrics
    const totalEstimatedHours = this.activities.reduce(
      (sum, act) => sum + act.estimatedHours,
      0
    );
    const totalActualHours = this.activities.reduce(
      (sum, act) => sum + act.actualHours,
      0
    );
    const efficiency =
      totalEstimatedHours > 0
        ? (totalEstimatedHours / Math.max(totalActualHours, 1)) * 100
        : 0;

    // Budget and timeline analysis
    const isOverdue = this.deadline && new Date() > this.deadline;
    const daysRemaining = this.deadline
      ? Math.ceil((this.deadline - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      overview: {
        totalActivities,
        completedActivities,
        inProgressActivities,
        notStartedActivities,
        completionRate:
          totalActivities > 0
            ? (completedActivities / totalActivities) * 100
            : 0,
        overallProgress: this.progress,
      },
      efficiency: {
        totalEstimatedHours,
        totalActualHours,
        efficiency: Math.min(100, Math.max(0, efficiency)),
        isOnSchedule: efficiency >= 90,
      },
      timeline: {
        startDate: this.startDate,
        endDate: this.endDate,
        deadline: this.deadline,
        isOverdue,
        daysRemaining,
      },
      budget: {
        allocated: this.budget,
        spent: 0,
        remaining: this.budget,
      },
      typeBreakdown: typeStats,
    };
  }

  getTypeStatistics(type) {
    const typeActivities = this.getActivitiesByType(type);
    const total = typeActivities.length;

    if (total === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        averageProgress: 0,
        totalPlanned: 0,
        totalReal: 0,
      };
    }

    const completed = typeActivities.filter((act) => act.isCompleted()).length;
    const inProgress = typeActivities.filter(
      (act) => act.status === 'in_progress'
    ).length;
    const totalPlanned = typeActivities.reduce(
      (sum, act) => sum + act.planned,
      0
    );
    const totalReal = typeActivities.reduce((sum, act) => sum + act.real, 0);
    const averageProgress =
      typeActivities.reduce((sum, act) => sum + act.calculateProgress(), 0) /
      total;

    return {
      total,
      completed,
      inProgress,
      averageProgress: Math.round(averageProgress * 100) / 100,
      totalPlanned,
      totalReal,
      completionRate: (completed / total) * 100,
    };
  }

  // Activity management
  addActivity(activityData) {
    const activity =
      activityData instanceof Activity
        ? activityData
        : new Activity(activityData);
    this.activities.push(activity);
    this.updateProgress();
    this.touch();
    return activity;
  }

  removeActivity(activityId) {
    const initialLength = this.activities.length;
    this.activities = this.activities.filter(
      (activity) => activity.id !== activityId
    );

    if (this.activities.length === initialLength) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    this.updateProgress();
    this.touch();
    return true;
  }

  updateActivity(activityId, updatedData) {
    const activityIndex = this.activities.findIndex(
      (activity) => activity.id === activityId
    );
    if (activityIndex === -1) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }

    // Update activity properties
    const activity = this.activities[activityIndex];
    Object.assign(activity, updatedData);
    activity.touch();

    this.updateProgress();
    this.touch();
    return activity;
  }

  getActivityById(activityId) {
    return this.activities.find((activity) => activity.id === activityId);
  }

  // CSV Import helpers
  markAsCSVImport(originalData = null) {
    this.metadata.csvImport = true;
    this.metadata.originalData = originalData;
    this.metadata.processedAt = new Date();
    this.touch();
  }

  isCSVImport() {
    return this.metadata.csvImport === true;
  }

  // Validation override
  isValid() {
    return (
      super.isValid() &&
      this.name &&
      this.name.trim().length > 0 &&
      [
        'draft',
        'active',
        'completed',
        'cancelled',
        'on-hold',
        'archived',
      ].includes(this.status) &&
      this.progress >= 0 &&
      this.progress <= 100
    );
  }

  // Serialization override
  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      description: this.description,
      status: this.status,
      priority: this.priority,
      progress: this.progress,
      owner: this.owner,
      team: this.team,
      startDate: this.startDate,
      endDate: this.endDate,
      deadline: this.deadline,
      budget: this.budget,
      tags: this.tags,
      location: this.location,
      category: this.category,
      activities: this.activities.map((activity) => activity.toJSON()),
      metadata: this.metadata,
      statistics: this.getStatistics(),
    };
  }
}

module.exports = Project;
