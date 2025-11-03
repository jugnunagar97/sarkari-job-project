## Indexing Service

Google Indexing API automation for `sarkaariresult.org`.

### Features
- File watcher for `.html` creates/updates/deletes → submits to Indexing API
- Endpoints: `/health`, `/index-now`, `/test-indexing`
- Logging to `logs/` and console

### Credentials
- Dev (Windows): `C:\Users\laptopcare\config\google-indexing-key.json`
- Prod (Linux): `/home/u98e78cdfe4c51684/config/sarkaariresult-indexing-key.json`

You can override via env: `GOOGLE_APPLICATION_CREDENTIALS`.

### Setup
1. Install dependencies:
   ```bash
   cd indexing-service
   npm install
   ```
2. Run locally (development):
   ```bash
   npm run dev
   ```
3. Environment variables (optional):
   - `NODE_ENV` (default `development`)
   - `GOOGLE_APPLICATION_CREDENTIALS` (absolute path)
   - `WATCH_DIR` (defaults to repo root parent `..`)
   - `SITE_BASE_URL` (default `https://sarkaariresult.org`)
   - `PORT` (default `3030`)

### API
- `GET /health`
- `POST /index-now` body: `{ "url": "https://...", "type": "URL_UPDATED|URL_DELETED" }`
- `POST /test-indexing` optional body: `{ "url": "https://..." }`


