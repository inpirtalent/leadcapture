const express = require('express');
const router = express.Router();
const { getMessage } = require('../constants/messages');
const ResponseHelper = require('../utils/response');
const { validateLeadData } = require('../utils/validation');
const { createLeadRecord, updateLeadWithAI } = require('../services/airtable');
const { enrichLeadWithAI } = require('../services/openai');

// Store progress for each submission (in production, use Redis or similar)
const progressStore = new Map();

/**
 * SSE endpoint for progress updates
 */
router.get('/progress/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ progress: 0, message: 'Starting...' })}\n\n`);

  // Poll for progress updates
  const interval = setInterval(() => {
    const progress = progressStore.get(sessionId);
    
    if (progress) {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
      
      // If complete or error, close connection
      if (progress.progress === 100 || progress.error) {
        clearInterval(interval);
        progressStore.delete(sessionId);
        res.end();
      }
    }
  }, 200); // Poll every 200ms

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    progressStore.delete(sessionId);
    res.end();
  });
});

/**
 * Submit lead with progress tracking
 */
router.post('/', async (req, res) => {
  const sessionId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  
  // Initialize progress
  progressStore.set(sessionId, { progress: 0, message: 'Starting...' });

  // Start processing asynchronously
  processLeadAsync(sessionId, req.body).catch((error) => {
    console.error('Async processing error:', error);
    progressStore.set(sessionId, {
      progress: 0,
      message: 'Error processing lead',
      error: error.message,
    });
  });

  // Return immediately with session ID
  return res.status(202).json({
    status: 'processing',
    message: 'Lead submission started',
    sessionId,
  });
});

/**
 * Async lead processing with progress updates
 */
async function processLeadAsync(sessionId, lead) {
  try {
    // Step 1: Validation (10%)
    updateProgress(sessionId, 10, 'Validating information...');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const validation = validateLeadData(lead);
    if (!validation.isValid) {
      const firstError = validation.errors[0];
      updateProgress(sessionId, 0, firstError.message, true);
      return;
    }

    // Step 2: Save to Airtable (30%)
    updateProgress(sessionId, 30, 'Saving to database...');
    let airtableRecord;
    try {
      airtableRecord = await createLeadRecord(lead);
      console.log('Lead saved to Airtable:', airtableRecord.id);
    } catch (error) {
      console.error('Airtable error:', error);
      updateProgress(sessionId, 0, 'Failed to save lead', true);
      return;
    }

    // Step 3: AI Enrichment (60%)
    updateProgress(sessionId, 60, 'Analyzing with AI...');
    try {
      const enrichment = await enrichLeadWithAI(lead);
      console.log('AI enrichment completed:', enrichment);

      // Step 4: Update Airtable with AI (90%)
      updateProgress(sessionId, 90, 'Updating with AI insights...');
      await updateLeadWithAI(airtableRecord.id, enrichment);
      console.log('Lead updated with AI enrichment in Airtable');
    } catch (error) {
      // Log AI enrichment error but don't fail the request
      console.error('AI enrichment error (non-blocking):', error);
    }

    // Step 5: Complete (100%)
    updateProgress(sessionId, 100, 'Complete!', false, { leadId: airtableRecord.id });
  } catch (error) {
    console.error('Error processing lead:', error);
    updateProgress(sessionId, 0, 'An error occurred', true);
  }
}

/**
 * Update progress for a session
 */
function updateProgress(sessionId, progress, message, error = false, data = null) {
  progressStore.set(sessionId, {
    progress,
    message,
    error,
    data,
  });
}

module.exports = router;

