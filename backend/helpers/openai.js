'use strict';

const { config } = require('../lib/config');
const { ENRICHMENT_PROMPT } = require('../constants/openai');

/**
 * OpenAI helper functions
 */

/**
 * Assert that OpenAI configuration is present
 * @returns {Object} OpenAI config object
 * @throws {Error} If configuration is missing
 */
function assertOpenAIConfig() {
  if (!config.openai?.apiKey) {
    throw new Error('OpenAI configuration is missing. Please check your environment variables.');
  }
  return config.openai;
}

/**
 * Extract first name from full name
 * @param {string} fullName - Full name string
 * @returns {string} First name
 */
function extractFirstName(fullName) {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
}

/**
 * Build lead context string for AI prompt
 * @param {Object} leadData - Lead form data
 * @returns {string} Formatted lead context
 */
function buildLeadContext(leadData) {
  const firstName = extractFirstName(leadData.full_name);
  
  return `Lead:
Full name: ${leadData.full_name || ''}
First name: ${firstName}
Email: ${leadData.email || ''}
Company: ${leadData.company || ''}
Budget: ${leadData.budget || ''}
Timeline: ${leadData.timeline || ''}
Message: ${leadData.message || ''}
Source: ${leadData.source || ''}`;
}

/**
 * Get the enrichment prompt
 * @returns {string} Enrichment prompt
 */
function getEnrichmentPrompt() {
  return ENRICHMENT_PROMPT;
}

module.exports = {
  assertOpenAIConfig,
  buildLeadContext,
  getEnrichmentPrompt,
};

