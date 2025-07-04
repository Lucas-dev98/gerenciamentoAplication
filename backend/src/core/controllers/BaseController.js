// Core - Base Controller Class
/**
 * Base controller class following clean architecture principles
 * All controllers should extend this class
 */
class BaseController {
  constructor(useCase, logger = console) {
    if (!useCase) {
      throw new Error('Use case is required for controller');
    }
    this.useCase = useCase;
    this.logger = logger;
  }

  /**
   * Handle success response
   * @param {Object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  handleSuccess(res, data, message = 'Success', statusCode = 200) {
    const response = {
      status: 'success',
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Controller Success:', {
      statusCode,
      message,
      dataLength: Array.isArray(data) ? data.length : 1,
    });

    res.status(statusCode).json(response);
  }

  /**
   * Handle error response
   * @param {Object} res - Express response object
   * @param {Error|string} error - Error object or message
   * @param {string} defaultMessage - Default error message
   * @param {number} statusCode - HTTP status code
   */
  handleError(
    res,
    error,
    defaultMessage = 'Internal server error',
    statusCode = 500
  ) {
    let errorMessage = defaultMessage;
    let errorDetails = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails =
        process.env.NODE_ENV === 'development' ? error.stack : null;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && error.message) {
      errorMessage = error.message;
      errorDetails = error.error || error.details;
    }

    const response = {
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    if (errorDetails && process.env.NODE_ENV === 'development') {
      response.details = errorDetails;
    }

    this.logger.error('Controller Error:', {
      statusCode,
      message: errorMessage,
      error: errorDetails,
      stack: error instanceof Error ? error.stack : null,
    });

    res.status(statusCode).json(response);
  }

  /**
   * Handle not found response
   * @param {Object} res - Express response object
   * @param {string} resource - Resource name
   * @param {string} id - Resource ID
   */
  handleNotFound(res, resource = 'Resource', id = null) {
    const message = id
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;

    this.handleError(res, message, message, 404);
  }

  /**
   * Handle validation error response
   * @param {Object} res - Express response object
   * @param {Array|Object} validationErrors - Validation errors
   */
  handleValidationError(res, validationErrors) {
    const response = {
      status: 'error',
      message: 'Validation failed',
      errors: validationErrors,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn('Controller Validation Error:', validationErrors);
    res.status(400).json(response);
  }

  /**
   * Extract request parameters safely
   * @param {Object} req - Express request object
   * @returns {Object} Extracted parameters
   */
  extractParams(req) {
    return {
      id: req.params?.id,
      body: req.body || {},
      query: req.query || {},
      user: req.user,
      headers: req.headers || {},
    };
  }

  /**
   * Validate required parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} requiredFields - Required field names
   * @returns {Object} Validation result
   */
  validateRequiredParams(params, requiredFields = []) {
    const errors = [];

    requiredFields.forEach((field) => {
      const value = this.getNestedValue(params, field);
      if (value === undefined || value === null || value === '') {
        errors.push(`Field '${field}' is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @returns {any} Value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Apply pagination from query parameters
   * @param {Object} query - Query parameters
   * @returns {Object} Pagination options
   */
  getPaginationFromQuery(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
    };
  }

  /**
   * Apply sorting from query parameters
   * @param {Object} query - Query parameters
   * @param {Array} allowedFields - Allowed sort fields
   * @returns {Object} Sort options
   */
  getSortFromQuery(query, allowedFields = []) {
    const sortBy = query.sortBy;
    const sortOrder =
      query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    if (!sortBy || !allowedFields.includes(sortBy)) {
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    }

    return { sortBy, sortOrder };
  }

  /**
   * Log controller action
   * @param {string} action - Action name
   * @param {Object} details - Action details
   */
  logAction(action, details = {}) {
    this.logger.info(
      `Controller [${this.constructor.name}] - ${action}`,
      details
    );
  }
}

module.exports = BaseController;
