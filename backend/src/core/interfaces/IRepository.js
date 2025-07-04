// Core - Base Repository Interface
/**
 * Base repository interface following clean architecture principles
 * All repositories must implement these methods
 */
class IRepository {
  /**
   * Find an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object|null>} Entity or null if not found
   */
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Find all entities with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (limit, offset, sort)
   * @returns {Promise<Array>} Array of entities
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method findAll must be implemented');
  }

  /**
   * Save entity (create or update)
   * @param {Object} entity - Entity to save
   * @returns {Promise<Object>} Saved entity
   */
  async save(entity) {
    throw new Error('Method save must be implemented');
  }

  /**
   * Delete entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  /**
   * Check if entity exists
   * @param {string} id - Entity ID
   * @returns {Promise<boolean>} Existence status
   */
  async exists(id) {
    throw new Error('Method exists must be implemented');
  }

  /**
   * Count entities with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Count of entities
   */
  async count(filters = {}) {
    throw new Error('Method count must be implemented');
  }
}

module.exports = IRepository;
