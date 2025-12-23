const { getMessage } = require('../constants/messages');

/**
 * Validation utilities for API requests
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {Object} { isValid: boolean, error: Object|null }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return {
      isValid: false,
      error: getMessage('VALIDATION', 'MISSING_REQUIRED_FIELD'),
      field: 'email',
    };
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: getMessage('VALIDATION', 'INVALID_EMAIL'),
      field: 'email',
    };
  }

  // Check for common invalid patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return {
      isValid: false,
      error: getMessage('VALIDATION', 'INVALID_EMAIL'),
      field: 'email',
    };
  }

  // Check length limits
  if (email.length > 254) {
    return {
      isValid: false,
      error: {
        status: 'error',
        message: 'Email address is too long',
        code: 'VALIDATION_ERROR',
      },
      field: 'email',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validate required field
 * @param {*} value - Field value to validate
 * @param {string} fieldName - Name of the field
 * @returns {Object} { isValid: boolean, error: Object|null, field: string }
 */
function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      isValid: false,
      error: getMessage('VALIDATION', 'MISSING_REQUIRED_FIELD'),
      field: fieldName,
    };
  }
  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validate full name
 * @param {string} name - Full name to validate
 * @returns {Object} { isValid: boolean, error: Object|null, field: string }
 */
function validateFullName(name) {
  const required = validateRequired(name, 'full_name');
  if (!required.isValid) {
    return required;
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: {
        status: 'error',
        message: 'Full name must be at least 2 characters',
        code: 'VALIDATION_ERROR',
      },
      field: 'full_name',
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: {
        status: 'error',
        message: 'Full name is too long',
        code: 'VALIDATION_ERROR',
      },
      field: 'full_name',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validate lead form data
 * @param {Object} data - Lead form data
 * @returns {Object} { isValid: boolean, errors: Array }
 */
function validateLeadData(data) {
  const errors = [];

  // Validate full_name
  const fullNameValidation = validateFullName(data.full_name);
  if (!fullNameValidation.isValid) {
    errors.push({
      field: fullNameValidation.field,
      ...fullNameValidation.error,
    });
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push({
      field: emailValidation.field,
      ...emailValidation.error,
    });
  }

  // Validate message (required)
  const messageValidation = validateRequired(data.message, 'message');
  if (!messageValidation.isValid) {
    errors.push({
      field: 'message',
      ...messageValidation.error,
    });
  }

  // Optional: Validate company if provided
  if (data.company && data.company.trim().length > 200) {
    errors.push({
      field: 'company',
      status: 'error',
      message: 'Company name is too long',
      code: 'VALIDATION_ERROR',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateEmail,
  validateRequired,
  validateFullName,
  validateLeadData,
};

