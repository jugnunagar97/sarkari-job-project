module.exports = {
  apps: [
    {
      name: 'indexing-service',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        SITE_BASE_URL: 'https://sarkaariresult.org',
        GOOGLE_APPLICATION_CREDENTIALS: '/home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json',
        // TODO: UPDATE THIS to your real content directory on the server
        WATCH_DIR: '/home/u98e78cdfe4c51684/public_html',
        PORT: '3030'
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_memory_restart: '200M'
    }
  ]
};


