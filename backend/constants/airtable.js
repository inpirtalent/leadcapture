'use strict';

/**
 * Airtable API constants
 */

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Field mapping from form fields to Airtable field names
 */
const FIELD_MAPPING = Object.freeze({
  full_name: 'Full Name',
  email: 'Email',
  company: 'Company',
  budget: 'Budget',
  timeline: 'Timeline',
  message: 'Message',
  source: 'Source',
});

/**
 * AI enrichment field mapping for Airtable
 */
const AI_FIELD_MAPPING = Object.freeze({
  score: 'AI Score',
  summary: 'AI Summary',
  tags: 'AI Tags',
  next_action: 'Next Action',
  follow_up_subject: 'Follow-up Subject',
  follow_up_body: 'Follow-up Body',
});

module.exports = {
  AIRTABLE_API_BASE,
  FIELD_MAPPING,
  AI_FIELD_MAPPING,
};

