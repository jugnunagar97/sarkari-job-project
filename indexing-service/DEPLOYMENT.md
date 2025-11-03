## Hostinger Deployment Guide (Production)

This guide deploys the indexing service to Hostinger at `/home/u98e78cdfe4c51684/`.

### 1) Package locally

Create an archive of the `indexing-service/` folder:

```bash
cd indexing-service
tar -czf indexing-service.tar.gz .
# or on Windows PowerShell
Compress-Archive -Path * -DestinationPath indexing-service.zip
```

Upload `indexing-service.tar.gz` or `indexing-service.zip` to the server.

### 2) Upload to Hostinger

Using SFTP or hPanel File Manager:

- Destination: `/home/u98e78cdfe4c51684/`
- Place the archive there and extract into `indexing-service/` directory:

```bash
cd /home/u98e78cdfe4c51684
mkdir -p indexing-service
cd indexing-service
# if tarball
tar -xzf ../indexing-service.tar.gz
# if zip
unzip ../indexing-service.zip
```

### 3) Install Node.js and dependencies

On the server shell:

```bash
node -v || curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

cd /home/u98e78cdfe4c51684/indexing-service
npm ci || npm install
```

### 4) Provide credentials and configure paths

- Ensure your key exists:
  - `/home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json`
- Choose the directory to watch (HTML files). Commonly:
  - `/home/u98e78cdfe4c51684/public_html`

You can configure via pm2 ecosystem or environment exports.

Edit `ecosystem.config.cjs` (WATCH_DIR line) to your actual path if different.

### 5) Start with PM2 (recommended)

```bash
sudo npm i -g pm2
cd /home/u98e78cdfe4c51684/indexing-service
pm2 start ecosystem.config.cjs
pm2 save
# enable startup on reboot
pm2 startup systemd -u u98e78cdfe4c51684 --hp /home/u98e78cdfe4c51684
```

To view logs:

```bash
pm2 logs indexing-service
```

Reload after config changes:

```bash
pm2 reload indexing-service
```

### 6) Alternative: Forever

```bash
sudo npm i -g forever
cd /home/u98e78cdfe4c51684/indexing-service
bash start-prod.sh
```

To keep it running after reboot with forever, add this to your crontab:

```bash
crontab -e
# add line (adjust path if needed):
@reboot cd /home/u98e78cdfe4c51684/indexing-service && bash start-prod.sh >> /home/u98e78cdfe4c51684/indexing-service/logs/boot.log 2>&1
```

### 7) Configure environment

Defaults are already set for production inside `ecosystem.config.cjs`:

- `NODE_ENV=production`
- `GOOGLE_APPLICATION_CREDENTIALS=/home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json`
- `WATCH_DIR=/home/u98e78cdfe4c51684/public_html` (update if your job posts live elsewhere)
- `SITE_BASE_URL=https://sarkaariresult.org`
- `PORT=3030`

You may also export env vars before starting or edit `start-prod.sh`.

### 8) Verify

```bash
curl -s http://127.0.0.1:3030/health
curl -s -X POST http://127.0.0.1:3030/test-indexing -H 'Content-Type: application/json' -d '{"url":"https://sarkaariresult.org/index.html"}'
```

### 9) Security notes

- Ensure the config directory is not web-accessible and restrict perms:

```bash
chmod 700 /home/u98e78cdfe4c51684/config
chmod 600 /home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json
```


