const axios = require('axios');
const { config } = require('../lib/config');
const { getMessage } = require('../constants/messages');

/**
 * Airtable API service
 * Maps form fields to Airtable field names
 */

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Field mapping from form fields to Airtable field names
 */
const FIELD_MAPPING = {
  full_name: 'Full Name',
  email: 'Email',
  company: 'Company',
  budget: 'Budget',
  timeline: 'Timeline',
  message: 'Message',
  source: 'Source',
};

/**
 * Create a lead record in Airtable
 * @param {Object} leadData - Lead form data
 * @returns {Promise<Object>} Created record with ID
 * @throws {Error} If Airtable API call fails
 */
async function createLeadRecord(leadData) {
  if (!config.airtable.apiKey || !config.airtable.baseId || !config.airtable.tableName) {
    throw new Error('Airtable configuration is missing. Please check your environment variables.');
  }

  // Map form fields to Airtable fields
  const fields = {};
  
  Object.keys(FIELD_MAPPING).forEach((formField) => {
    const airtableField = FIELD_MAPPING[formField];
    const value = leadData[formField];
    
    // Only include field if value exists
    if (value !== undefined && value !== null && value !== '') {
      fields[airtableField] = value;
    }
  });

  const url = `${AIRTABLE_API_BASE}/${config.airtable.baseId}/${config.airtable.tableName}`;
  
  try {
    const response = await axios.post(
      url,
      {
        fields,
      },
      {
        headers: {
          Authorization: `Bearer ${config.airtable.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      fields: response.data.fields,
    };
  } catch (error) {
    // Handle different types of Airtable errors
    if (error.response) {
      // Airtable API returned an error response
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401 || status === 403) {
        throw {
          code: 'AIRTABLE_AUTH_ERROR',
          message: 'Airtable authentication failed. Please check your access token.',
          originalError: error,
        };
      }

      if (status === 404) {
        throw {
          code: 'AIRTABLE_NOT_FOUND',
          message: 'Airtable base or table not found. Please check your base ID and table name.',
          originalError: error,
        };
      }

      if (status === 422) {
        throw {
          code: 'AIRTABLE_VALIDATION_ERROR',
          message: errorData.error?.message || 'Airtable validation error',
          originalError: error,
        };
      }

      throw {
        code: 'AIRTABLE_API_ERROR',
        message: errorData.error?.message || 'Airtable API error',
        originalError: error,
      };
    }

    if (error.request) {
      // Request was made but no response received
      throw {
        code: 'AIRTABLE_CONNECTION_ERROR',
        message: 'Unable to connect to Airtable. Please check your internet connection.',
        originalError: error,
      };
    }

    // Something else happened
    throw {
      code: 'AIRTABLE_ERROR',
      message: 'An unexpected error occurred while saving to Airtable',
      originalError: error,
    };
  }
}

/**
 * Get a lead record by ID from Airtable
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<Object>} Record data
 */
async function getLeadRecord(recordId) {
  if (!config.airtable.apiKey || !config.airtable.baseId || !config.airtable.tableName) {
    throw new Error('Airtable configuration is missing.');
  }

  const url = `${AIRTABLE_API_BASE}/${config.airtable.baseId}/${config.airtable.tableName}/${recordId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${config.airtable.apiKey}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw {
        code: 'AIRTABLE_API_ERROR',
        message: error.response.data?.error?.message || 'Failed to retrieve record from Airtable',
        originalError: error,
      };
    }
    throw {
      code: 'AIRTABLE_ERROR',
      message: 'An error occurred while retrieving record from Airtable',
      originalError: error,
    };
  }
}

module.exports = {
  createLeadRecord,
  getLeadRecord,
};

