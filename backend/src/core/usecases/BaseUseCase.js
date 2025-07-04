// Core - Use Case Base Class
/**
 * Base use case class following clean architecture principles
 * All use cases should extend this class
 */
class BaseUseCase {
  constructor(repository, logger = console) {
    if (!repository) {
      throw new Error('Repository is required for use case');
    }
    this.repository = repository;
    this.logger = logger;
  }

  /**
   * Execute the use case
   * Override this method in derived classes
   * @param {Object} params - Use case parameters
   * @returns {Promise<Object>} Use case result
   */
  async execute(params = {}) {
    throw new Error('Method execute must be implemented');
  }

  /**
   * Validate input parameters
   * Override this method in derived classes
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateInput(params) {
    return { isValid: true, errors: [] };
  }

  /**
   * Format success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Formatted success response
   */
  success(data, message = 'Operation completed successfully') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format error response
   * @param {string} message - Error message
   * @param {any} error - Error details
   * @param {string} code - Error code
   * @returns {Object} Formatted error response
   */
  error(message, error = null, code = 'UNKNOWN_ERROR') {
    this.logger.error('Use Case Error:', { message, error, code });
    return {
      success: false,
      message,
      error: error instanceof Error ? error.message : error,
      code,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log operation info
   * @param {string} operation - Operation name
   * @param {Object} details - Operation details
   */
  logInfo(operation, details = {}) {
    this.logger.info(
      `UseCase [${this.constructor.name}] - ${operation}`,
      details
    );
  }

  /**
   * Log operation error
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   * @param {Object} details - Additional details
   */
  logError(operation, error, details = {}) {
    this.logger.error(`UseCase [${this.constructor.name}] - ${operation}`, {
      error: error.message,
      stack: error.stack,
      ...details,
    });
  }

  /**
   * Sanitize and validate ID
   * @param {string} id - ID to validate
   * @returns {string|null} Validated ID or null
   */
  validateId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return null;
    }
    return id.trim();
  }

  /**
   * Apply pagination to query options
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Object} Pagination options
   */
  getPaginationOptions(page = 1, limit = 10) {
    const offset = (Math.max(1, page) - 1) * Math.max(1, limit);
    return {
      limit: Math.min(100, Math.max(1, limit)), // Max 100 items per page
      offset: Math.max(0, offset),
    };
  }
}

module.exports = BaseUseCase;
