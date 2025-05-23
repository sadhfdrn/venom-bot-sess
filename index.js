const express = require('express');
const fs = require('fs');
const path = require('path');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const qrStreams = {};

app.get('/qr/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  qrStreams[sessionId] = res;

  req.on('close', () => {
    delete qrStreams[sessionId];
  });
});

app.post('/start-session', async (req, res) => {
  const sessionId = `session_${Date.now()}`;
  const sessionPath = path.join(__dirname, 'tokens', sessionId);

  fs.mkdirSync(sessionPath, { recursive: true });

  const lockFile = path.join(sessionPath, 'SingletonLock');
  if (fs.existsSync(lockFile)) {
    fs.rmSync(lockFile, { force: true });
  }

  try {
    await wppconnect.create({
      session: sessionId,
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log(`PAIR CODE: ${urlCode}`);
        if (qrStreams[sessionId]) {
          qrStreams[sessionId].write(`data: ${JSON.stringify({ pairCode: urlCode })}\n\n`);
        }
      },
      waitForLogin: true,
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      puppeteerOptions: {
        userDataDir: sessionPath
      }
    });

    res.json({ sessionId });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
