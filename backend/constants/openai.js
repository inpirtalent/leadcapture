'use strict';

/**
 * OpenAI API constants
 */

/**
 * AI enrichment field mappings for Airtable
 */
const AI_FIELD_MAPPING = Object.freeze({
  score: 'AI Score',
  summary: 'AI Summary',
  tags: 'AI Tags',
  next_action: 'Next Action',
  follow_up_subject: 'Follow-up Subject',
  follow_up_body: 'Follow-up Body',
});

/**
 * Lead scoring options (single select)
 */
const LEAD_SCORES = Object.freeze(['Hot', 'Warm', 'Cold']);

/**
 * AI Tags options (multi-select)
 */
const AI_TAG_OPTIONS = Object.freeze(['Default', 'Make.com', 'Zapier', 'Email', 'Phone', 'Other']);

/**
 * AI enrichment prompt template
 */
const ENRICHMENT_PROMPT = `You are a marketing ops + sales assistant.
Classify and summarize this inbound lead for a CRM.

Rules:
- Score "Hot" if budget is clear OR urgency is high OR strong buying intent.
- Score "Warm" if interest is clear but budget/urgency is moderate.
- Score "Cold" if vague, no budget, no clear intent.

Tags (select 3-8 from these options only):
- "Default" - Use for general leads without specific tool mentions
- "Make.com" - If lead mentions Make.com or automation with Make
- "Zapier" - If lead mentions Zapier or Zapier integrations
- "Email" - If lead mentions email marketing, email automation, or email workflows
- "Phone" - If lead mentions phone calls, call tracking, or phone-based processes
- "Other" - For any other specific tools, platforms, or use cases mentioned

Select tags based on what the lead mentions in their message. You can select multiple tags.
Keep summary to 1 sentence.
Provide a specific, actionable next action recommendation.

Follow-up Email:
Generate a friendly, human follow-up email that:
- Is short and concise
- Feels personal and not salesy
- Mentions their specific intent/request from the message
- Offers to help with a call or continue via email
- Use the lead's first name from "Full Name" field
- Keep subject line short and friendly (under 60 characters)
- Keep body to 3-4 sentences maximum`;

/**
 * JSON schema for structured output
 */
const ENRICHMENT_SCHEMA = {
  name: 'lead_enrichment',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      score: {
        type: 'string',
        enum: LEAD_SCORES,
        description: 'Lead quality score: Hot, Warm, or Cold',
      },
      summary: {
        type: 'string',
        description: 'One sentence summary of the lead',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
          enum: AI_TAG_OPTIONS,
        },
        minItems: 3,
        maxItems: 8,
        description: 'Tags selected from predefined options: Default, Make.com, Zapier, Email, Phone, Other',
      },
      next_action: {
        type: 'string',
        description: 'Recommended next action for this lead',
      },
      follow_up_subject: {
        type: 'string',
        description: 'Short, friendly email subject line for follow-up (under 60 characters)',
      },
      follow_up_body: {
        type: 'string',
        description: 'Friendly, human email body for follow-up (3-4 sentences, mentions their intent)',
      },
    },
    required: ['score', 'summary', 'tags', 'next_action', 'follow_up_subject', 'follow_up_body'],
  },
};

module.exports = {
  AI_FIELD_MAPPING,
  LEAD_SCORES,
  AI_TAG_OPTIONS,
  ENRICHMENT_PROMPT,
  ENRICHMENT_SCHEMA,
};

