import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import { logger } from './logger.js';
import { config } from './config.js';

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

let authClient;

async function getAccessToken() {
  if (!authClient) {
    authClient = new GoogleAuth({
      scopes: [INDEXING_SCOPE],
      keyFile: config.credentialsPath,
    });
  }
  const client = await authClient.getClient();
  const accessToken = await client.getAccessToken();
  if (!accessToken || !accessToken.token) {
    throw new Error('Failed to obtain access token for Google Indexing API');
  }
  return accessToken.token;
}

export async function publishUrlNotification(url, type) {
  const validTypes = new Set(['URL_UPDATED', 'URL_DELETED']);
  if (!validTypes.has(type)) {
    throw new Error(`Invalid notification type: ${type}`);
  }

  const token = await getAccessToken();
  const body = { url, type };
  const res = await fetch(INDEXING_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    logger.error('Indexing API error', { status: res.status, body: json, url, type });
    throw new Error(`Indexing API request failed with status ${res.status}`);
  }

  logger.info('Indexing API success', { url, type, response: json });
  return json;
}


