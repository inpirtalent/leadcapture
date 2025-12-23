const express = require('express');
const router = express.Router();
const { getMessage } = require('../constants/messages');
const ResponseHelper = require('../utils/response');
const { validateLeadData } = require('../utils/validation');
const { createLeadRecord } = require('../services/airtable');

router.post('/', async (req, res) => {
  try {
    const lead = req.body;
    console.log('Received lead:', lead);

    // Validate lead data
    const validation = validateLeadData(lead);
    if (!validation.isValid) {
      // Return first validation error with field information
      const firstError = validation.errors[0];
      const errorResponse = {
        ...firstError,
        field: firstError.field,
      };
      return res.status(400).json(errorResponse);
    }

    // Save to Airtable
    let airtableRecord;
    try {
      airtableRecord = await createLeadRecord(lead);
      console.log('Lead saved to Airtable:', airtableRecord.id);
    } catch (error) {
      console.error('Airtable error:', error);
      return ResponseHelper.externalServiceError(res, 'Airtable', error);
    }

    // Success response using predefined message
    return ResponseHelper.success(
      res,
      getMessage('SUCCESS', 'LEAD_CAPTURED'),
      { leadId: airtableRecord.id },
      200
    );
  } catch (error) {
    console.error('Error processing lead:', error);
    return ResponseHelper.error(
      res,
      getMessage('SERVER', 'PROCESSING_ERROR'),
      error,
      500
    );
  }
});

module.exports = router;

