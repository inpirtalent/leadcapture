'use strict';

const { config } = require('../lib/config');
const { AIRTABLE_API_BASE, FIELD_MAPPING, AI_FIELD_MAPPING } = require('../constants/airtable');

/**
 * Airtable helper functions
 */

/**
 * Assert that Airtable configuration is present
 * @returns {Object} Airtable config object
 * @throws {Error} If configuration is missing
 */
function assertAirtableConfig() {
  const { airtable } = config || {};
  if (!airtable?.apiKey || !airtable?.baseId || !airtable?.tableName) {
    throw new Error('Airtable configuration is missing. Please check your environment variables.');
  }
  return airtable;
}

/**
 * Build Airtable API URL
 * @param {string} path - Additional path to append
 * @returns {string} Full Airtable API URL
 */
function buildAirtableUrl(path = '') {
  const { baseId, tableName } = config.airtable;
  // NOTE: Table name may contain spaces; encode it.
  const table = encodeURIComponent(tableName);
  return `${AIRTABLE_API_BASE}/${baseId}/${table}${path}`;
}

/**
 * Build Airtable fields object from lead data
 * @param {Object} leadData - Lead form data
 * @param {Object} mapping - Field mapping (defaults to FIELD_MAPPING)
 * @returns {Object} Airtable fields object
 */
function buildAirtableFields(leadData = {}, mapping = FIELD_MAPPING) {
  const fields = {};

  for (const [formField, airtableField] of Object.entries(mapping)) {
    const value = leadData[formField];

    // Only include field if value exists (allow 0 / false)
    if (value !== undefined && value !== null && value !== '') {
      fields[airtableField] = value;
    }
  }

  return fields;
}

/**
 * Build Airtable fields object from AI enrichment data
 * @param {Object} enrichmentData - AI enrichment data
 * @param {Object} mapping - Field mapping (defaults to AI_FIELD_MAPPING)
 * @returns {Object} Airtable fields object
 */
function buildAIFields(enrichmentData = {}, mapping = AI_FIELD_MAPPING) {
  const fields = {};

  // Map score
  if (enrichmentData.score) {
    fields[mapping.score] = enrichmentData.score;
  }

  // Map summary
  if (enrichmentData.summary) {
    fields[mapping.summary] = enrichmentData.summary;
  }

  // Map tags (Airtable multi-select expects an array)
  if (enrichmentData.tags && Array.isArray(enrichmentData.tags)) {
    // Airtable multi-select fields expect an array of strings
    fields[mapping.tags] = enrichmentData.tags;
  }

  // Map next_action
  if (enrichmentData.next_action) {
    fields[mapping.next_action] = enrichmentData.next_action;
  }

  // Map follow-up subject
  if (enrichmentData.follow_up_subject) {
    fields[mapping.follow_up_subject] = enrichmentData.follow_up_subject;
  }

  // Map follow-up body
  if (enrichmentData.follow_up_body) {
    fields[mapping.follow_up_body] = enrichmentData.follow_up_body;
  }

  // Set follow_up_sent to false (always false for now)
  fields['Follow-up Sent'] = false;

  return fields;
}

module.exports = {
  assertAirtableConfig,
  buildAirtableUrl,
  buildAirtableFields,
  buildAIFields,
};

