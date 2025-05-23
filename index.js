const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/start-session', async (req, res) => {
  const { phone } = req.body;
  const sessionId = `session_${Date.now()}`;

  try {
    const client = await wppconnect.create({
      session: sessionId,
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      waitForLogin: true,
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log(`Scan this QR: ${urlCode}`);
      }
    });

    await client.sendText(`${phone}@c.us`, `Your session ID is: ${sessionId}`);
    res.json({ sessionId });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});