import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

// Route imports
import botsRouter from './routes/bots.js';
import dailyRouter from './routes/daily.js';
import healthRouter from './routes/health.js';
import readingRouter from './routes/reading.js';
import tasksRouter from './routes/tasks.js';
import authRouter from './routes/auth.js';
import ledgerRouter from './routes/ledger.js';

// Store initialization
import { loadStore } from './store.js';

dotenv.config();
loadStore();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

// Initialize Anthropic client (optional — won't crash if key missing)
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────
// Bot Data: webhook push + read endpoints (forex, polymarket, wallethunter)
app.use('/api/bots', botsRouter);

// Must Do's + Gratitude (daily router)
app.use('/api', dailyRouter);

// Health Logging
app.use('/api/health', healthRouter);

// Reading List
app.use('/api/reading', readingRouter);

// Tasks
app.use('/api/tasks', tasksRouter);

// Auth + Gmail
app.use('/api/auth', authRouter);

// LEDGER — Project Dashboard + Ticket Management
app.use('/api/ledger', ledgerRouter);

// ── Alias: frontend calls /api/wallethunter ─────────────
app.get('/api/wallethunter', (req, res, next) => {
  req.url = '/wallethunter';
  botsRouter(req, res, next);
});
app.post('/api/wallethunter', (req, res, next) => {
  req.url = '/wallethunter';
  botsRouter(req, res, next);
});

// ── Claude API Proxy ──────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  if (!anthropic) {
    return res.status(503).json({
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Claude API not configured' }
    });
  }

  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Message is required' }
      });
    }

    const systemPrompt = `You are Willow, the AI assistant for Craig Nowotny's personal command center called The Bridge.

You have access to and should be knowledgeable about:
- The Bridge: Craig's personal command center dashboard
- 13-peptide health protocol (3 phases)
- 75 Hard program
- Body composition goals
- $1M revenue mission
- Oakbridge Labs consulting projects and pipeline
- Personal philosophy: Stoicism, Jocko Willink, Extreme Ownership
- Trading bots: Forex bot (AUDUSD, 115 pips/week target), Polymarket bot (crypto 5-min yes/no markets), WalletHunter (whale alert scraping)
- Financial tracking and goals
- Task management and priorities

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Respond helpfully and concisely. If you need specific data from the bots or systems, you can ask for clarification or suggest checking The Bridge for live data.`;

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const replyText = msg.content[0].text;
    res.json({ reply: replyText });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({
      error: {
        code: 'CLAUDE_API_ERROR',
        message: 'Failed to get response from Claude API'
      }
    });
  }
});

// ── Serve Frontend (Vite build) ─────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
// SPA fallback: serve index.html for any non-API route
app.get('/{*path}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// ── Error Handling ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong!' } });
});

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

const server = createServer(app);

server.listen(port, () => {
  console.log(`🌉 The Bridge server running on port ${port}`);
  console.log(`   Health:     GET  /api/health`);
  console.log(`   Auth:       GET  /api/auth/google (start OAuth flow)`);
  console.log(`   Mail:       GET  /api/auth/mail/recent`);
  console.log(`   Bot push:   POST /api/bots/forex|polymarket|wallethunter`);
  console.log(`   Bot read:   GET  /api/bots/forex|polymarket|wallethunter|status`);
  console.log(`   Tasks:      GET/POST /api/tasks, PUT/DELETE /api/tasks/:id`);
  console.log(`   Must Do's:  GET/POST /api/must-dos, PUT /api/must-dos/:position`);
  console.log(`   Gratitude:  GET/POST /api/gratitude`);
  console.log(`   Health:     GET /api/health/status, POST /api/health/log`);
  console.log(`   Reading:    GET/POST /api/reading/list, PATCH /api/reading/list/:id`);
  console.log(`   Ledger:     GET /api/ledger/projects, GET /api/ledger/projects/:slug/tickets`);
  console.log(`   Chat:       POST /api/chat`);
});

export default app;
