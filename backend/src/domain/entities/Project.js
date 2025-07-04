// Domain Entities - Project Entity
class Project {
  constructor({
    id,
    name,
    description,
    status = 'active',
    priority = 'medium',
    progress = 0,
    activities = [],
    metadata = {},
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.progress = progress;
    this.activities = activities;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Business Logic Methods
  calculateProgress() {
    if (!this.activities || this.activities.length === 0) return 0;

    const totalPlanned = this.activities.reduce(
      (sum, activity) => sum + (activity.planned || 0),
      0
    );
    const totalReal = this.activities.reduce(
      (sum, activity) => sum + (activity.real || 0),
      0
    );

    return totalPlanned > 0 ? (totalReal / totalPlanned) * 100 : 0;
  }

  getActivitiesByType(type) {
    return this.activities.filter((activity) => activity.type === type);
  }

  getStatistics() {
    const byType = {
      parada: this.getActivitiesByType('parada').length,
      manutencao: this.getActivitiesByType('manutencao').length,
      partida: this.getActivitiesByType('partida').length,
    };

    return {
      totalActivities: this.activities.length,
      activitiesByType: byType,
      totalProgress: this.calculateProgress(),
      lastUpdated: this.updatedAt,
    };
  }

  updateProgress() {
    this.progress = this.calculateProgress();
    this.updatedAt = new Date();
  }

  addActivity(activity) {
    this.activities.push(activity);
    this.updateProgress();
  }

  isValid() {
    return this.name && this.name.trim().length > 0;
  }
}

module.exports = Project;
