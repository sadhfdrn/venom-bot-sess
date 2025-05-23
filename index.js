const express = require('express');
const bodyParser = require('body-parser');
const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/pair', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).send('Phone number required');

  const sessionId = `session_${Date.now()}`;

  try {
    const client = await wppconnect.create({
      session: sessionId,
      catchQR: (qrCode, asciiQR, attempts, urlCode) => {
        console.log(`Scan this QR for ${sessionId}:`, urlCode);
      },
      statusFind: (statusSession, session) => {
        console.log(`Session ${session} status:`, statusSession);
      },
      headless: true
    });

    await client.sendText(`${phone}@c.us`, `Your session ID is: ${sessionId}`);

    res.send({ success: true, sessionId });
  } catch (err) {
    console.error('Error starting session:', err);
    res.status(500).send('Error creating session');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
