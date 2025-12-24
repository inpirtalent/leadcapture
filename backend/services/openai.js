'use strict';

const OpenAI = require('openai');
const { config } = require('../lib/config');
const { assertOpenAIConfig, buildLeadContext, getEnrichmentPrompt } = require('../helpers/openai');
const { ENRICHMENT_SCHEMA } = require('../constants/openai');

/**
 * OpenAI API service
 * Handles all OpenAI API interactions
 */

let openaiClient = null;

/**
 * Get or create OpenAI client instance
 * @returns {OpenAI} OpenAI client
 */
function getOpenAIClient() {
  if (!openaiClient) {
    assertOpenAIConfig();
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }
  return openaiClient;
}

/**
 * Enrich lead with AI analysis
 * @param {Object} leadData - Lead form data
 * @returns {Promise<Object>} Enrichment data with score, summary, tags, next_action
 * @throws {Error} If OpenAI API call fails
 */
async function enrichLeadWithAI(leadData) {
  assertOpenAIConfig();

  const client = getOpenAIClient();
  const prompt = getEnrichmentPrompt();
  const input = buildLeadContext(leadData);

  try {
    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: ENRICHMENT_SCHEMA,
      },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const enrichment = JSON.parse(content);

    // Validate the response structure
    if (
      !enrichment.score ||
      !enrichment.summary ||
      !enrichment.tags ||
      !enrichment.next_action ||
      !enrichment.follow_up_subject ||
      !enrichment.follow_up_body
    ) {
      throw new Error('Invalid enrichment response structure');
    }

    return enrichment;
  } catch (error) {
    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      throw {
        code: 'OPENAI_API_ERROR',
        message: error.message || 'OpenAI API error',
        originalError: error,
      };
    }

    if (error.message && error.message.includes('JSON')) {
      throw {
        code: 'OPENAI_PARSE_ERROR',
        message: 'Failed to parse OpenAI response',
        originalError: error,
      };
    }

    throw {
      code: 'OPENAI_ERROR',
      message: 'An unexpected error occurred while enriching lead with AI',
      originalError: error,
    };
  }
}

module.exports = {
  enrichLeadWithAI,
};

