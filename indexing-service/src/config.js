import path from 'path';

const env = process.env.NODE_ENV || 'development';

// Prefer explicit env var if provided, else fall back to per-env defaults
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || (
  env === 'production'
    ? '/home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json'
    : 'C:/Users/laptopcare/config/google-indexing-key.json'
);

export const config = {
  env,
  siteBaseUrl: process.env.SITE_BASE_URL || 'https://sarkaariresult.org',
  watchDir: process.env.WATCH_DIR ? path.resolve(process.env.WATCH_DIR) : path.resolve('..'),
  credentialsPath,
};


