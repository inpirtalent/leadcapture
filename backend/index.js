require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { config } = require('./lib/config');
const leadRoutes = require('./routes/leads');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Routes
app.use('/lead', leadRoutes);

// 404 handler
app.use((req, res) => {
  const { getMessage } = require('./constants/messages');
  const ResponseHelper = require('./utils/response');
  
  ResponseHelper.error(
    res,
    getMessage('CLIENT', 'NOT_FOUND'),
    null,
    404
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Lead capture API running on http://localhost:${PORT}`);
});

