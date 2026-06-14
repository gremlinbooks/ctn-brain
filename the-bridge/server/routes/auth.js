/**
 * The Bridge — Google OAuth + Gmail Routes
 * TICKET-010: Google OAuth + Gmail Integration
 *
 * GET  /api/auth/google          — Start OAuth2 flow (redirect to Google)
 * GET  /api/auth/google/callback — OAuth2 callback (exchange code for tokens)
 * GET  /api/auth/google/status   — Check if authenticated
 * GET  /api/mail/recent          — Get last 10 emails (cached, refreshed every 5 min)
 */

import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const TOKEN_FILE = join(DATA_DIR, 'google-tokens.json');
const MAIL_CACHE_FILE = join(DATA_DIR, 'mail-cache.json');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const router = Router();

// ── Config from env ─────────────────────────────────────
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/auth/google/callback';
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

// ── Token Storage ────────────────────────────────────────
function loadTokens() {
  try {
    if (existsSync(TOKEN_FILE)) {
      return JSON.parse(readFileSync(TOKEN_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('⚠️  Google tokens load error:', e.message);
  }
  return null;
}

function saveTokens(tokens) {
  try {
    writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log('🔑 Google tokens saved');
  } catch (e) {
    console.error('⚠️  Google tokens save error:', e.message);
  }
}

// ── Token Refresh ─────────────────────────────────────────
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data; // { access_token, expires_in, token_type, scope }
}

async function getValidAccessToken() {
  const tokens = loadTokens();
  if (!tokens || !tokens.refresh_token) {
    return null;
  }

  // Check if access token is still valid (with 60s buffer)
  const now = Date.now();
  if (tokens.access_token && tokens.expires_at && tokens.expires_at > now + 60000) {
    return tokens.access_token;
  }

  // Refresh the access token
  try {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    tokens.access_token = newTokens.access_token;
    tokens.expires_at = now + (newTokens.expires_in * 1000);
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
    }
    saveTokens(tokens);
    console.log('🔄 Google access token refreshed');
    return tokens.access_token;
  } catch (e) {
    console.error('❌ Token refresh error:', e.message);
    return null;
  }
}

// ── Mail Cache ───────────────────────────────────────────
let mailCache = { emails: [], lastFetched: 0 };
const MAIL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function loadMailCache() {
  try {
    if (existsSync(MAIL_CACHE_FILE)) {
      mailCache = JSON.parse(readFileSync(MAIL_CACHE_FILE, 'utf-8'));
    }
  } catch (e) {
    // start fresh
  }
}

function saveMailCache() {
  try {
    writeFileSync(MAIL_CACHE_FILE, JSON.stringify(mailCache, null, 2), 'utf-8');
  } catch (e) {
    console.error('⚠️  Mail cache save error:', e.message);
  }
}

loadMailCache();

// ── Email Categorization ─────────────────────────────────
const CATEGORIES = {
  work: {
    senderDomains: ['sunesis.com', 'bigadvisors.com', 'hcahealthcare.com'],
    subjectKeywords: ['invoice', 'proposal', 'contract', 'meeting', 'conference'],
  },
  fx: {
    senderDomains: ['oanda.com', 'forex.com', 'dailyfx.com'],
    subjectKeywords: ['forex', 'audusd', 'pip', 'trade', 'oanda', 'market'],
  },
  peptides: {
    senderDomains: [],
    subjectKeywords: ['peptide', 'bpc', 'ghk', 'semaglutide', 'tesamorelin', 'tb-500'],
  },
  oakbridge: {
    senderDomains: ['oakbridgelabs.com', 'oakbridge-labs.com'],
    subjectKeywords: ['bridge', 'ledger', 'bot', 'willow'],
  },
  dev: {
    senderDomains: ['github.com', 'heroku.com', 'vercel.com', 'netlify.com'],
    subjectKeywords: ['deploy', 'pr ', 'commit', 'build', 'error', 'merge request', 'pull request'],
  },
};

function categorizeEmail(email) {
  const sender = (email.from || '').toLowerCase();
  const subject = (email.subject || '').toLowerCase();

  for (const [category, rules] of Object.entries(CATEGORIES)) {
    for (const domain of rules.senderDomains) {
      if (sender.includes(domain)) return category;
    }
    for (const keyword of rules.subjectKeywords) {
      if (subject.includes(keyword)) return category;
    }
  }
  return 'personal';
}

// ── Gmail API Calls ──────────────────────────────────────
async function fetchRecentEmails(accessToken, maxResults = 10) {
  // List recent message IDs
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&labelIds=INBOX`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) {
    const error = await listRes.text();
    throw new Error(`Gmail list failed: ${listRes.status} ${error}`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  // Fetch each message's details
  const emails = [];
  for (const msg of messages) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!msgRes.ok) continue;

      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];

      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const snippet = msgData.snippet || '';

      emails.push({
        id: msgData.id,
        from,
        subject,
        date,
        snippet: snippet.substring(0, 200),
        category: 'personal', // will be categorized below
      });
    } catch (e) {
      console.error(`Failed to fetch message ${msg.id}:`, e.message);
    }
  }

  // Categorize
  for (const email of emails) {
    email.category = categorizeEmail(email);
  }

  return emails;
}

// ── Routes ───────────────────────────────────────────────

// Start OAuth2 flow
router.get('/google', (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(503).json({ error: { code: 'NOT_CONFIGURED', message: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.' } });
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GMAIL_SCOPE);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token

  res.redirect(authUrl.toString());
});

// OAuth2 callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('❌ Google OAuth error:', error);
    return res.redirect('/?auth=error&reason=' + encodeURIComponent(error));
  }

  if (!code) {
    return res.redirect('/?auth=error&reason=no_code');
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('❌ Token exchange failed:', errorText);
      return res.redirect('/?auth=error&reason=token_exchange_failed');
    }

    const tokens = await tokenRes.json();

    // Save tokens with expiry
    saveTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    });

    console.log('✅ Google OAuth successful — tokens saved');
    res.redirect('/?auth=success');
  } catch (e) {
    console.error('❌ OAuth callback error:', e.message);
    res.redirect('/?auth=error&reason=exception');
  }
});

// Check auth status
router.get('/google/status', (req, res) => {
  const tokens = loadTokens();
  const authenticated = !!(tokens && tokens.refresh_token);
  res.json({
    authenticated,
    hasAccessToken: !!(tokens && tokens.access_token),
    scope: tokens?.scope || null,
  });
});

// Revoke auth (delete tokens)
router.delete('/google', (req, res) => {
  try {
    if (existsSync(TOKEN_FILE)) {
      // Try to revoke the token with Google
      const tokens = loadTokens();
      if (tokens?.access_token) {
        fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`, {
          method: 'POST',
        }).catch(() => {}); // Fire and forget
      }
      // Delete local tokens
      writeFileSync(TOKEN_FILE, '{}', 'utf-8');
    }
    res.json({ ok: true, message: 'Google auth revoked' });
  } catch (e) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// Get recent emails
router.get('/mail/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Check auth
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Google OAuth not authenticated. Visit /api/auth/google to start authorization.',
          authUrl: '/api/auth/google',
        },
      });
    }

    // Check cache
    const now = Date.now();
    if (mailCache.emails.length > 0 && (now - mailCache.lastFetched) < MAIL_CACHE_TTL) {
      return res.json({ emails: mailCache.emails.slice(0, limit), cached: true, fetchedAt: new Date(mailCache.lastFetched).toISOString() });
    }

    // Fetch from Gmail
    const emails = await fetchRecentEmails(accessToken, limit);

    // Update cache
    mailCache = { emails, lastFetched: now };
    saveMailCache();

    res.json({ emails: emails.slice(0, limit), cached: false, fetchedAt: new Date(now).toISOString() });
  } catch (e) {
    console.error('❌ Mail fetch error:', e.message);

    // Return cached data if available, even if stale
    if (mailCache.emails.length > 0) {
      return res.json({
        emails: mailCache.emails.slice(0, parseInt(req.query.limit) || 10),
        cached: true,
        stale: true,
        error: e.message,
        fetchedAt: new Date(mailCache.lastFetched).toISOString(),
      });
    }

    res.status(500).json({ error: { code: 'GMAIL_ERROR', message: e.message } });
  }
});

export default router;