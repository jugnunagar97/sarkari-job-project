import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { logger } from './logger.js';
import { config } from './config.js';
import { publishUrlNotification } from './googleIndexing.js';
import { startWatcher } from './watcher.js';

const app = express();
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.env });
});

// Generic submit endpoint: { url: string, type: 'URL_UPDATED'|'URL_DELETED' }
app.post('/index-now', async (req, res) => {
  const { url, type } = req.body || {};
  if (!url || !type) {
    return res.status(400).json({ error: 'Missing url or type' });
  }
  try {
    const result = await publishUrlNotification(url, type);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Test endpoint to validate credentials and flow
app.post('/test-indexing', async (req, res) => {
  try {
    const testUrl = req.body?.url || `${config.siteBaseUrl}/index.html`;
    const result = await publishUrlNotification(testUrl, 'URL_UPDATED');
    res.json({ success: true, testUrl, result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  logger.info('Indexing service started', { port: PORT, env: config.env, watchDir: config.watchDir });
});

// Start watcher last so server is responsive quickly
startWatcher();


