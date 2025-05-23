const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const sessions = {}; // Store session clients

app.post('/start-session', async (req, res) => {
  const { phone } = req.body;
  const sessionId = `session_${Date.now()}`;

  try {
    let pairCodeSent = false;

  const client = await wppconnect.create({
  session: sessionId,
  headless: true,
  executablePath: '/usr/bin/chromium',
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--no-zygote',
    '--single-process'
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
        }
        console.log(`Scan this Pairing Code: ${urlCode}`);
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
