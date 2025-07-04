// Core - Domain Entity Base Class
/**
 * Base entity class with common properties and methods
 * All domain entities should extend this class
 */
class BaseEntity {
  constructor({
    id,
    createdAt = new Date(),
    updatedAt = new Date(),
    version = 1,
  }) {
    this.id = id; // Don't auto-generate, let repository handle it
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.version = version;
  }

  /**
   * Generate unique ID for entity
   * @returns {string} Unique identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Update entity timestamp
   */
  touch() {
    this.updatedAt = new Date();
    this.version += 1;
  }

  /**
   * Validate entity data
   * Override this method in derived classes
   * @returns {boolean} Validation result
   */
  isValid() {
    // For new entities (no ID), validation is more lenient
    return true; // Let derived classes handle specific validation
  }

  /**
   * Get entity as plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }

  /**
   * Clone entity
   * @returns {BaseEntity} Cloned entity
   */
  clone() {
    return new this.constructor(this.toJSON());
  }

  /**
   * Check if entity is equal to another
   * @param {BaseEntity} other - Other entity
   * @returns {boolean} Equality result
   */
  equals(other) {
    return other instanceof BaseEntity && this.id === other.id;
  }

  /**
   * Get entity age in milliseconds
   * @returns {number} Age in milliseconds
   */
  getAge() {
    return Date.now() - this.createdAt.getTime();
  }

  /**
   * Check if entity was recently created
   * @param {number} thresholdMs - Threshold in milliseconds (default: 1 hour)
   * @returns {boolean} Whether entity is recent
   */
  isRecent(thresholdMs = 3600000) {
    return this.getAge() < thresholdMs;
  }
}

module.exports = BaseEntity;
