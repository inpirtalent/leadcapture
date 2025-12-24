'use strict';

const axios = require('axios');
const { config } = require('../lib/config');
const {
  assertAirtableConfig,
  buildAirtableUrl,
  buildAirtableFields,
  buildAIFields,
} = require('../helpers/airtable');
const { handleAirtableError } = require('../helpers/errors');

/**
 * Airtable API service
 * Handles all Airtable API interactions
 */

/**
 * Create a lead record in Airtable
 * @param {Object} leadData - Lead form data
 * @returns {Promise<{id: string, fields: Object}>} Created record
 * @throws {Error} If Airtable API call fails
 */
async function createLeadRecord(leadData) {
  assertAirtableConfig();

  const fields = buildAirtableFields(leadData);
  const url = buildAirtableUrl('');

  try {
    const response = await axios.post(
      url,
      { fields },
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
    handleAirtableError(error);
  }
}

/**
 * Update a lead record in Airtable
 * @param {string} recordId - Airtable record ID
 * @param {Object} fields - Fields to update
 * @returns {Promise<Object>} Updated record data
 * @throws {Error} If Airtable API call fails
 */
async function updateLeadRecord(recordId, fields) {
  assertAirtableConfig();

  if (!recordId) {
    throw new Error('recordId is required.');
  }

  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('Fields are required for update.');
  }

  const url = buildAirtableUrl(`/${recordId}`);

  try {
    const response = await axios.patch(
      url,
      { fields },
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
    handleAirtableError(error);
  }
}

/**
 * Update lead record with AI enrichment data
 * @param {string} recordId - Airtable record ID
 * @param {Object} enrichmentData - AI enrichment data
 * @returns {Promise<Object>} Updated record data
 * @throws {Error} If Airtable API call fails
 */
async function updateLeadWithAI(recordId, enrichmentData) {
  const aiFields = buildAIFields(enrichmentData);
  return updateLeadRecord(recordId, aiFields);
}

/**
 * Get a lead record by ID from Airtable
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<Object>} Record data
 * @throws {Error} If Airtable API call fails
 */
async function getLeadRecord(recordId) {
  assertAirtableConfig();

  if (!recordId) {
    throw new Error('recordId is required.');
  }

  const url = buildAirtableUrl(`/${recordId}`);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${config.airtable.apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAirtableError(error);
  }
}

module.exports = {
  createLeadRecord,
  updateLeadRecord,
  updateLeadWithAI,
  getLeadRecord,
};
