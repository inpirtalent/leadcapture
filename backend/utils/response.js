const { getMessage, createCustomError } = require('../constants/messages');

/**
 * Response helper utility for consistent API responses
 */
class ResponseHelper {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {Object} messageObj - Message object from constants/messages.js
   * @param {Object} data - Optional data to include in response
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, messageObj, data = null, statusCode = 200) {
    const response = {
      status: messageObj.status,
      message: messageObj.message,
      code: messageObj.code,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {Object} messageObj - Message object from constants/messages.js
   * @param {Object} error - Optional error details
   * @param {number} statusCode - HTTP status code (default: 400)
   */
  static error(res, messageObj, error = null, statusCode = 400) {
    const response = {
      status: messageObj.status,
      message: messageObj.message,
      code: messageObj.code,
    };

    if (error !== null) {
      // Only include error details in development
      if (process.env.NODE_ENV === 'development') {
        response.error = error instanceof Error ? error.message : error;
      }
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send custom error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom error message
   * @param {string} code - Error code
   * @param {number} statusCode - HTTP status code (default: 400)
   */
  static customError(res, message, code = 'CUSTOM_ERROR', statusCode = 400) {
    const messageObj = createCustomError(message, code);
    return this.error(res, messageObj, null, statusCode);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Object} messageObj - Message object from constants/messages.js
   * @param {string} field - Field name that failed validation
   */
  static validationError(res, messageObj, field = null) {
    const response = {
      status: messageObj.status,
      message: messageObj.message,
      code: messageObj.code,
    };

    if (field) {
      response.field = field;
    }

    return res.status(400).json(response);
  }

  /**
   * Send external service error response
   * @param {Object} res - Express response object
   * @param {string} service - Service name (e.g., 'Airtable')
   * @param {Error|Object} error - Error object from the service
   */
  static externalServiceError(res, service, error = null) {
    let messageObj;
    
    if (service === 'Airtable') {
      // Check for connection errors
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || error?.code === 'AIRTABLE_CONNECTION_ERROR') {
        messageObj = getMessage('EXTERNAL_SERVICE', 'AIRTABLE_CONNECTION_ERROR');
      } else if (error?.code === 'AIRTABLE_AUTH_ERROR' || error?.code === 'AIRTABLE_NOT_FOUND') {
        // Use custom error message for auth/not found errors
        messageObj = {
          status: 'error',
          message: error.message || 'Airtable configuration error',
          code: error.code || 'AIRTABLE_ERROR',
        };
      } else {
        // Use custom error message if available, otherwise use default
        if (error?.message && error?.code) {
          messageObj = {
            status: 'error',
            message: error.message,
            code: error.code,
          };
        } else {
          messageObj = getMessage('EXTERNAL_SERVICE', 'AIRTABLE_ERROR');
        }
      }
    } else if (service === 'OpenAI') {
      // Handle OpenAI errors
      if (error?.code === 'OPENAI_API_ERROR' || error?.code === 'OPENAI_PARSE_ERROR') {
        messageObj = {
          status: 'error',
          message: error.message || 'OpenAI API error',
          code: error.code || 'OPENAI_ERROR',
        };
      } else {
        messageObj = {
          status: 'error',
          message: error?.message || 'OpenAI service error',
          code: error?.code || 'OPENAI_ERROR',
        };
      }
    } else {
      messageObj = getMessage('EXTERNAL_SERVICE', 'SERVICE_UNAVAILABLE');
    }

    return this.error(res, messageObj, error, 502);
  }
}

module.exports = ResponseHelper;

