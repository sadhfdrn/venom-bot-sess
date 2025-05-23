const express = require('express');
const venom = require('venom-bot');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // To serve HTML frontend

app.post('/start', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ status: 'error', message: 'Phone number is required' });
  }

  const sessionId = `session-${phone}`;

  try {
    venom
      .create({
        session: sessionId,
        multidevice: true,
        puppeteerOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      })
      .then(client => {
        client.sendText(`${phone}@c.us`, `Hello! Your Venom session (${sessionId}) is now active.`);
        res.json({ status: 'success', sessionId });
      })
      .catch(err => {
        console.error('Venom error:', err);
        res.status(500).json({ status: 'error', message: 'Failed to create session' });
      });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});