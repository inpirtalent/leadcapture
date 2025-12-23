const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/lead', (req, res) => {
  const lead = req.body;
  console.log('Received lead:', lead);

  res.status(200).json({
    status: 'received',
    message: 'Lead captured successfully',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Lead capture API running on http://localhost:${PORT}`);
});

