#!/usr/bin/env bash
set -euo pipefail

# Ensure Node and pm2 are installed before running this

export NODE_ENV=production
export SITE_BASE_URL=${SITE_BASE_URL:-https://sarkaariresult.org}
export GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS:-/home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json}
# EDIT THIS to your actual directory containing HTML pages on Hostinger
export WATCH_DIR=${WATCH_DIR:-/home/u98e78cdfe4c51684/public_html}
export PORT=${PORT:-3030}

mkdir -p logs

if command -v pm2 >/dev/null 2>&1; then
  pm2 start ecosystem.config.cjs
  pm2 save
  echo "Started with pm2. To view logs: pm2 logs indexing-service"
else
  if ! command -v forever >/dev/null 2>&1; then
    npm i -g forever
  fi
  forever stop src/server.js || true
  forever start -a -l logs/forever.log -o logs/out.log -e logs/err.log -c node src/server.js
  echo "Started with forever. To view logs: tail -f logs/out.log logs/err.log"
fi


