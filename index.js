const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
const PORT = process.env.PORT || 3000;
const sessions = {};

app.use(express.json());

app.post('/start-session', async (req, res) => {
  const sessionId = `session_${Date.now()}`;
  let pairCodeSent = false;

  try {
    const client = await wppconnect.create({
      session: sessionId,
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ],
      waitForLogin: true,
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log(`Scan this Pairing Code: ${urlCode}`);
        if (!pairCodeSent) {
          pairCodeSent = true;
          res.json({ sessionId, pairCode: urlCode });
        }
      }
    });

    sessions[sessionId] = client;

  } catch (error) {
    console.error('Error starting session:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start session' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
