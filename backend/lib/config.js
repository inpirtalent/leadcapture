require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  airtable: {
    apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
    baseId: process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_TABLE_NAME,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
};

// Validate Airtable configuration
if (!config.airtable.apiKey || !config.airtable.baseId || !config.airtable.tableName) {
  console.warn('Warning: Airtable configuration is incomplete. Some features may not work.');
}

module.exports = { config };

