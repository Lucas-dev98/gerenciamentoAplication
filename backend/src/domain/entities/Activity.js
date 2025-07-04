// Domain Entities - Activity Entity
const BaseEntity = require('../../core/entities/BaseEntity');

/**
 * Activity domain entity representing a project activity
 * Follows Clean Architecture and Domain-Driven Design principles
 */
class Activity extends BaseEntity {
  constructor({
    id,
    type,
    name,
    planned = 0,
    real = 0,
    image = null,
    subActivities = [],
    order = 0,
    status = 'not_started',
    tags = [],
    description = '',
    assignedTo = null,
    priority = 'medium',
    estimatedHours = 0,
    actualHours = 0,
    dependencies = [],
    ...baseProps
  }) {
    super({ id, ...baseProps });

    // Validate required fields
    this.validateRequiredFields({ type, name });

    // Core properties
    this.type = this.validateActivityType(type);
    this.name = this.sanitizeName(name);
    this.planned = this.validateNumericValue(planned, 'planned');
    this.real = this.validateNumericValue(real, 'real');
    this.image = image;
    this.order = this.validateNumericValue(order, 'order');
    this.description = description || '';
    this.assignedTo = assignedTo;
    this.priority = this.validatePriority(priority);
    this.estimatedHours = this.validateNumericValue(
      estimatedHours,
      'estimatedHours'
    );
    this.actualHours = this.validateNumericValue(actualHours, 'actualHours');
    this.tags = Array.isArray(tags) ? tags : [];
    this.dependencies = Array.isArray(dependencies) ? dependencies : [];

    // Sub-activities
    this.subActivities = this.initializeSubActivities(subActivities);

    // Status is calculated based on progress
    this.status = this.calculateStatus();

    // Update progress after initialization
    this.updateProgressFromSubActivities();
  }

  // Validation methods
  validateRequiredFields({ type, name }) {
    if (!type) throw new Error('Activity type is required');
    if (!name || name.trim().length === 0)
      throw new Error('Activity name is required');
  }

  validateActivityType(type) {
    const validTypes = ['parada', 'manutencao', 'partida'];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid activity type: ${type}. Must be one of: ${validTypes.join(', ')}`
      );
    }
    return type;
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

  initializeSubActivities(subActivities) {
    if (!Array.isArray(subActivities)) return [];

    return subActivities.map((sub) => ({
      id: sub.id || this.generateId(),
      name: this.sanitizeName(sub.name || 'Unnamed Sub-activity'),
      planned: this.validateNumericValue(sub.planned, 'planned'),
      real: this.validateNumericValue(sub.real, 'real'),
      description: sub.description || '',
      status: sub.status || 'not_started',
      assignedTo: sub.assignedTo || null,
      createdAt: sub.createdAt || new Date(),
      updatedAt: sub.updatedAt || new Date(),
    }));
  }

  // Business Logic Methods
  calculateProgress() {
    if (this.planned === 0) return 0;
    const progress = (this.real / this.planned) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  calculateStatus() {
    const progress = this.calculateProgress();
    if (progress === 0) return 'not_started';
    if (progress >= 100) return 'completed';
    if (progress >= 50) return 'in_progress';
    return 'started';
  }

  getProgressStatus() {
    const progress = this.calculateProgress();
    if (progress >= 100) return 'completed';
    if (progress >= 80) return 'on-track';
    return 'delayed';
  }

  getProgressColor() {
    const status = this.getProgressStatus();
    const colors = {
      completed: '#4CAF50',
      'on-track': '#FF9800',
      delayed: '#F44336',
    };
    return colors[status];
  }

  getEfficiency() {
    if (this.estimatedHours === 0) return 0;
    return Math.min(
      100,
      (this.estimatedHours / Math.max(this.actualHours, 1)) * 100
    );
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isBlocked() {
    return this.dependencies.some((dep) => !dep.completed);
  }

  getBlockingDependencies() {
    return this.dependencies.filter((dep) => !dep.completed);
  }

  updateReal(value) {
    this.real = Math.max(0, value);
    this.touch();
  }

  // Sub-activity management
  updateSubActivity(subActivityId, updatedData) {
    const subIndex = this.subActivities.findIndex(
      (sub) => sub.id === subActivityId
    );
    if (subIndex === -1) {
      throw new Error(`Sub-activity with ID ${subActivityId} not found`);
    }

    this.subActivities[subIndex] = {
      ...this.subActivities[subIndex],
      ...updatedData,
      updatedAt: new Date(),
    };

    this.updateProgressFromSubActivities();
    this.touch();
    return this.subActivities[subIndex];
  }

  addSubActivity(subActivityData) {
    const newSubActivity = {
      id: subActivityData.id || this.generateId(),
      name: this.sanitizeName(subActivityData.name || 'Unnamed Sub-activity'),
      planned: this.validateNumericValue(subActivityData.planned, 'planned'),
      real: this.validateNumericValue(subActivityData.real, 'real'),
      description: subActivityData.description || '',
      status: subActivityData.status || 'not_started',
      assignedTo: subActivityData.assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.subActivities.push(newSubActivity);
    this.updateProgressFromSubActivities();
    this.touch();
    return newSubActivity;
  }

  removeSubActivity(subActivityId) {
    const initialLength = this.subActivities.length;
    this.subActivities = this.subActivities.filter(
      (sub) => sub.id !== subActivityId
    );

    if (this.subActivities.length === initialLength) {
      throw new Error(`Sub-activity with ID ${subActivityId} not found`);
    }

    this.updateProgressFromSubActivities();
    this.touch();
    return true;
  }

  updateProgressFromSubActivities() {
    if (this.subActivities.length > 0) {
      this.planned = this.subActivities.reduce(
        (sum, sub) => sum + (sub.planned || 0),
        0
      );
      this.real = this.subActivities.reduce(
        (sum, sub) => sum + (sub.real || 0),
        0
      );
    }
    this.status = this.calculateStatus();
  }

  // Validation override
  isValid() {
    return (
      super.isValid() &&
      this.name &&
      this.type &&
      ['parada', 'manutencao', 'partida'].includes(this.type) &&
      this.planned >= 0 &&
      this.real >= 0
    );
  }

  // Serialization override
  toJSON() {
    return {
      ...super.toJSON(),
      type: this.type,
      name: this.name,
      planned: this.planned,
      real: this.real,
      image: this.image,
      order: this.order,
      description: this.description,
      assignedTo: this.assignedTo,
      priority: this.priority,
      estimatedHours: this.estimatedHours,
      actualHours: this.actualHours,
      tags: this.tags,
      dependencies: this.dependencies,
      subActivities: this.subActivities,
      status: this.status,
      progress: this.calculateProgress(),
      efficiency: this.getEfficiency(),
      progressColor: this.getProgressColor(),
    };
  }
}

module.exports = Activity;
