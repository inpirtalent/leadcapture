'use strict';

/**
 * Error handling helpers
 */

/**
 * Create a structured error object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Error} originalError - Original error object
 * @returns {Error} Structured error
 */
function createStructuredError(code, message, originalError = null) {
  const err = new Error(message);
  err.code = code;
  if (originalError) {
    err.originalError = originalError;
  }
  return err;
}

/**
 * Handle Airtable API errors from axios
 * @param {Error} error - Axios error object
 * @throws {Error} Structured error
 */
function handleAirtableError(error) {
  if (error?.response) {
    const status = error.response.status;
    const apiMessage = error.response.data?.error?.message;

    if (status === 401 || status === 403) {
      throw createStructuredError(
        'AIRTABLE_AUTH_ERROR',
        'Airtable authentication failed. Please check your access token.',
        error
      );
    }

    if (status === 404) {
      throw createStructuredError(
        'AIRTABLE_NOT_FOUND',
        'Airtable base or table not found. Please check your base ID and table name.',
        error
      );
    }

    if (status === 422) {
      throw createStructuredError(
        'AIRTABLE_VALIDATION_ERROR',
        apiMessage || 'Airtable validation error',
        error
      );
    }

    throw createStructuredError('AIRTABLE_API_ERROR', apiMessage || 'Airtable API error', error);
  }

  if (error?.request) {
    throw createStructuredError(
      'AIRTABLE_CONNECTION_ERROR',
      'Unable to connect to Airtable. Please check your internet connection.',
      error
    );
  }

  throw createStructuredError(
    'AIRTABLE_ERROR',
    'An unexpected error occurred while communicating with Airtable',
    error
  );
}

module.exports = {
  createStructuredError,
  handleAirtableError,
};

