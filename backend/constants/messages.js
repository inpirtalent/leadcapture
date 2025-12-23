/**
 * Predefined response messages for API responses
 * Organized by category for easy maintenance and extension
 */

const MESSAGES = {
  // Success messages
  SUCCESS: {
    LEAD_CAPTURED: {
      status: 'success',
      message: 'Lead captured successfully',
      code: 'LEAD_CAPTURED',
    },
    LEAD_RETRIEVED: {
      status: 'success',
      message: 'Lead retrieved successfully',
      code: 'LEAD_RETRIEVED',
    },
    OPERATION_COMPLETE: {
      status: 'success',
      message: 'Operation completed successfully',
      code: 'OPERATION_COMPLETE',
    },
  },

  // Error messages - Validation
  VALIDATION: {
    INVALID_INPUT: {
      status: 'error',
      message: 'Invalid input provided',
      code: 'VALIDATION_ERROR',
    },
    MISSING_REQUIRED_FIELD: {
      status: 'error',
      message: 'Missing required field',
      code: 'MISSING_REQUIRED_FIELD',
    },
    INVALID_EMAIL: {
      status: 'error',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL',
    },
  },

  // Error messages - External services
  EXTERNAL_SERVICE: {
    AIRTABLE_ERROR: {
      status: 'error',
      message: 'Failed to save lead to Airtable',
      code: 'AIRTABLE_ERROR',
    },
    AIRTABLE_CONNECTION_ERROR: {
      status: 'error',
      message: 'Unable to connect to Airtable service',
      code: 'AIRTABLE_CONNECTION_ERROR',
    },
    SERVICE_UNAVAILABLE: {
      status: 'error',
      message: 'External service is currently unavailable',
      code: 'SERVICE_UNAVAILABLE',
    },
  },

  // Error messages - Server
  SERVER: {
    INTERNAL_ERROR: {
      status: 'error',
      message: 'An internal server error occurred',
      code: 'INTERNAL_ERROR',
    },
    PROCESSING_ERROR: {
      status: 'error',
      message: 'Error processing request',
      code: 'PROCESSING_ERROR',
    },
  },

  // Error messages - Client
  CLIENT: {
    NOT_FOUND: {
      status: 'error',
      message: 'Resource not found',
      code: 'NOT_FOUND',
    },
    UNAUTHORIZED: {
      status: 'error',
      message: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    },
    BAD_REQUEST: {
      status: 'error',
      message: 'Bad request',
      code: 'BAD_REQUEST',
    },
  },
};

/**
 * Helper function to get a message by path
 * @param {string} category - Category name (e.g., 'SUCCESS', 'VALIDATION')
 * @param {string} key - Message key (e.g., 'LEAD_CAPTURED')
 * @returns {Object} Message object with status, message, and code
 */
function getMessage(category, key) {
  if (!MESSAGES[category] || !MESSAGES[category][key]) {
    return MESSAGES.SERVER.INTERNAL_ERROR;
  }
  return MESSAGES[category][key];
}

/**
 * Helper function to create a custom error message
 * @param {string} message - Custom error message
 * @param {string} code - Error code
 * @returns {Object} Message object
 */
function createCustomError(message, code = 'CUSTOM_ERROR') {
  return {
    status: 'error',
    message,
    code,
  };
}

module.exports = {
  MESSAGES,
  getMessage,
  createCustomError,
};

