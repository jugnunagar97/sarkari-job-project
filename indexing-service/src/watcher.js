import chokidar from 'chokidar';
import path from 'path';
import { logger } from './logger.js';
import { config } from './config.js';
import { publishUrlNotification } from './googleIndexing.js';

function toPublicUrl(filePath) {
  // Expecting HTML files in project root; convert path to site URL
  const relative = path.relative(config.watchDir, filePath).replace(/\\/g, '/');
  // Only process .html files that live at top-level or nested; build URL
  return `${config.siteBaseUrl}/${relative}`.replace(/\/+/g, '/');
}

export function startWatcher() {
  const watcher = chokidar.watch('**/*.html', {
    cwd: config.watchDir,
    ignored: ['**/node_modules/**', '**/.git/**', '**/indexing-service/**'],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });

  const handle = async (absPath, type) => {
    const fullPath = path.resolve(config.watchDir, absPath);
    const url = toPublicUrl(fullPath);
    try {
      logger.info('Watcher event', { event: type, file: fullPath, url });
      const apiType = type === 'unlink' ? 'URL_DELETED' : 'URL_UPDATED';
      await publishUrlNotification(url, apiType);
    } catch (err) {
      logger.error('Watcher processing error', { error: String(err), file: fullPath });
    }
  };

  watcher
    .on('add', (p) => handle(p, 'add'))
    .on('change', (p) => handle(p, 'change'))
    .on('unlink', (p) => handle(p, 'unlink'))
    .on('error', (error) => logger.error('Watcher error', { error: String(error) }));

  logger.info('File watcher started', { watchDir: config.watchDir });
  return watcher;
}


