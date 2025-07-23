const express = require('express');
const cors = require('cors');
const loggingMiddleware = require('../Logging Middleware/index');
const logger = require('../Logging Middleware/logger');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Add logging middleware for all requests
app.use(loggingMiddleware('backend', 'info', 'shortening'));

// In-memory storage
const urls = new Map();
const clicks = new Map();

// Generate random shortcode
function generateShortcode() {
  return Math.random().toString(36).substring(2, 8);
}

// POST /shorturls - Create short URL
app.post('/shorturls', async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  await logger({
    stack: 'backend',
    level: 'info',
    message: `Creating short URL for: ${url}`,
    packageName: 'shortening'
  });

  // Basic validation
  if (!url || !url.startsWith('http')) {
    await logger({
      stack: 'backend',
      level: 'error',
      message: 'Invalid URL provided',
      packageName: 'shortening'
    });
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let finalShortcode = shortcode;
  
  // Use custom shortcode or generate one
  if (shortcode) {
    if (urls.has(shortcode)) {
      await logger({
        stack: 'backend',
        level: 'error',
        message: `Shortcode already exists: ${shortcode}`,
        packageName: 'shortening'
      });
      return res.status(400).json({ error: 'Shortcode already exists' });
    }
  } else {
    finalShortcode = generateShortcode();
    while (urls.has(finalShortcode)) {
      finalShortcode = generateShortcode();
    }
  }

  const expiryDate = new Date(Date.now() + validity * 60 * 1000);
  
  urls.set(finalShortcode, {
    url,
    createdAt: new Date(),
    expiryDate,
    clickCount: 0
  });
  
  clicks.set(finalShortcode, []);

  await logger({
    stack: 'backend',
    level: 'info',
    message: `Short URL created: ${finalShortcode}`,
    packageName: 'shortening'
  });

  res.status(201).json({
    shortLink: `http://localhost:3000/${finalShortcode}`,
    expiry: expiryDate.toISOString()
  });
});

// GET /shorturls/:shortcode - Get statistics
app.get('/shorturls/:shortcode', async (req, res) => {
  const { shortcode } = req.params;

  await logger({
    stack: 'backend',
    level: 'info',
    message: `Getting stats for: ${shortcode}`,
    packageName: 'shortening'
  });

  const urlData = urls.get(shortcode);
  if (!urlData) {
    await logger({
      stack: 'backend',
      level: 'warn',
      message: `Shortcode not found: ${shortcode}`,
      packageName: 'shortening'
    });
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  const clickHistory = clicks.get(shortcode) || [];

  res.json({
    shortcode,
    originalUrl: urlData.url,
    createdAt: urlData.createdAt.toISOString(),
    expiryDate: urlData.expiryDate.toISOString(),
    totalClicks: urlData.clickCount,
    clickHistory
  });
});

// GET /:shortcode - Redirect
app.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;

  await logger({
    stack: 'backend',
    level: 'info',
    message: `Redirect request for: ${shortcode}`,
    packageName: 'redirect'
  });

  const urlData = urls.get(shortcode);
  if (!urlData) {
    await logger({
      stack: 'backend',
      level: 'warn',
      message: `Redirect failed - not found: ${shortcode}`,
      packageName: 'redirect'
    });
    return res.status(404).json({ error: 'Short link not found' });
  }

  if (new Date() > urlData.expiryDate) {
    await logger({
      stack: 'backend',
      level: 'warn',
      message: `Redirect failed - expired: ${shortcode}`,
      packageName: 'redirect'
    });
    return res.status(410).json({ error: 'Short link has expired' });
  }

  // Record click
  urlData.clickCount++;
  clicks.get(shortcode).push({
    timestamp: new Date().toISOString(),
    referrer: req.get('Referer') || 'Direct'
  });

  await logger({
    stack: 'backend',
    level: 'info',
    message: `Redirecting to: ${urlData.url}`,
    packageName: 'redirect'
  });

  res.redirect(302, urlData.url);
});

app.listen(PORT, async () => {
  await logger({
    stack: 'backend',
    level: 'info',
    message: `Server started on port ${PORT}`,
    packageName: 'shortening'
  });
  console.log(`Server running on port ${PORT}`);
});
