/**
 * The Bridge — Bot Data Routes
 * TICKET-007: Bot Data Webhook Endpoints
 * 
 * POST /api/bots/forex       — Push forex bot snapshot
 * POST /api/bots/polymarket  — Push polymarket bot snapshot
 * POST /api/wallethunter     — Push whale alert
 * GET  /api/bots/forex       — Get latest forex snapshot + history
 * GET  /api/bots/polymarket  — Get latest polymarket snapshot + history
 * GET  /api/bots/wallethunter — Get whale alerts
 * GET  /api/bots/status      — Get all bot statuses at once
 */

import { Router } from 'express';
import { setBotData, getBotData, getBotHistory, addWhaleAlert, getWhaleAlerts } from '../store.js';

const router = Router();

// ── Auth Middleware ──────────────────────────────────────
const BOT_TOKEN = process.env.BOT_PUSH_TOKEN || 'bridge-bot-2026';

function requireBotAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${BOT_TOKEN}`) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid bot push token' } });
  }
  next();
}

// ── POST: Push Bot Data ─────────────────────────────────

// Push forex bot data
router.post('/forex', requireBotAuth, (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data && typeof data !== 'object') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Request body required' } });
    }

    const snapshot = setBotData('forex', {
      status: data.status || 'running',
      balance: data.balance ?? null,
      weeklyPips: data.weeklyPips ?? null,
      targetPips: data.targetPips ?? 115,
      sleeves: data.sleeves || [],
      pipHistory: data.pipHistory || [],
      pnl: data.pnl ?? null,
      winRate: data.winRate ?? null,
      lastTrade: data.lastTrade || null,
      metadata: data.metadata || {},
    });

    console.log(`📊 Forex data received: balance=${data.balance}, pips=${data.weeklyPips}`);
    res.status(201).json({ ok: true, data: snapshot });
  } catch (err) {
    console.error('Forex push error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// Push polymarket bot data
router.post('/polymarket', requireBotAuth, (req, res) => {
  try {
    const data = req.body;

    if (!data && typeof data !== 'object') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Request body required' } });
    }

    const snapshot = setBotData('polymarket', {
      status: data.status || 'running',
      balance: data.balance ?? null,
      positions: data.positions || [],
      sleeves: data.sleeves || [],
      pnl: data.pnl ?? null,
      winRate: data.winRate ?? null,
      marketCount: data.marketCount ?? null,
      lastTrade: data.lastTrade || null,
      metadata: data.metadata || {},
    });

    console.log(`📊 Polymarket data received: balance=${data.balance}, positions=${data.positions?.length}`);
    res.status(201).json({ ok: true, data: snapshot });
  } catch (err) {
    console.error('Polymarket push error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// Push WalletHunter whale alert
router.post('/wallethunter', requireBotAuth, (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Request body required' } });
    }

    const alert = addWhaleAlert({
      chain: data.chain || 'unknown',
      event: data.event || 'transfer',
      size: data.size ?? null,
      sizeUsd: data.sizeUsd ?? null,
      signal: data.signal || 'neutral',
      from: data.from || null,
      to: data.to || null,
      txHash: data.txHash || null,
      token: data.token || null,
      metadata: data.metadata || {},
    });

    console.log(`🐋 Whale alert: ${data.chain} ${data.event} ${data.sizeUsd ? '$' + data.sizeUsd : data.size}`);
    res.status(201).json({ ok: true, data: alert });
  } catch (err) {
    console.error('WalletHunter push error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── GET: Read Bot Data ──────────────────────────────────

// Get forex status
router.get('/forex', (req, res) => {
  const data = getBotData('forex');
  const history = getBotHistory('forex');

  if (!data) {
    return res.json({
      status: 'idle',
      balance: 12450.00,
      weeklyPips: 47.3,
      pipTarget: 115,
      drawdown: 0,
      stages: [],
      monthlyInjection: 0,
      pipData: [],
      sleeves: [
        { name: 'AUDUSD Primary', pips: 28.1, trades: 12, winRate: 0.72 },
        { name: 'AUDUSD Scalp', pips: 19.2, trades: 8, winRate: 0.63 },
      ],
      lastUpdated: null,
      source: 'mock',
    });
  }

  // Normalize field names to match frontend shape
  res.json({
    status: data.status,
    balance: data.balance,
    weeklyPips: data.weeklyPips,
    pipTarget: data.targetPips ?? 115,
    drawdown: data.drawdown ?? 0,
    stages: data.stages ?? [],
    monthlyInjection: data.monthlyInjection ?? 0,
    pipData: data.pipHistory ?? [],
    sleeves: data.sleeves ?? [],
    pnl: data.pnl,
    winRate: data.winRate,
    lastTrade: data.lastTrade,
    metadata: data.metadata,
    lastUpdated: data.timestamp,
    history: history.slice(0, 50),
  });
});

// Get polymarket status
router.get('/polymarket', (req, res) => {
  const data = getBotData('polymarket');
  const history = getBotHistory('polymarket');

  if (!data) {
    return res.json({
      status: 'idle',
      usdcBalance: 49.35,
      winRate: 0.33,
      openPositions: 1,
      positions: [
        { market: 'Guardians ML', side: 'YES', size: 5, entry: 0.65 },
      ],
      chartData: [],
      sleeves: [
        { name: 'Bulldozer', balance: 49.35, pnl: 19.35, winRate: 0.33 },
      ],
      lastUpdated: null,
      source: 'mock',
    });
  }

  // Build chartData from history snapshots
  const chartData = history.slice(0, 50).map(h => ({
    t: h.timestamp,
    v: h.data?.balance ?? 0,
  })).reverse();

  res.json({
    status: data.status,
    usdcBalance: data.balance,
    winRate: data.winRate,
    openPositions: Array.isArray(data.positions) ? data.positions.length : 0,
    positions: data.positions ?? [],
    chartData,
    sleeves: data.sleeves ?? [],
    pnl: data.pnl,
    marketCount: data.marketCount,
    lastTrade: data.lastTrade,
    metadata: data.metadata,
    lastUpdated: data.timestamp,
    history: history.slice(0, 50),
  });
});

// Format a USD amount as a compact string: 2500000 → '$2.5M', 42000 → '$42K'
function formatSize(usd) {
  if (!usd) return null;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${usd}`;
}

// Normalize a stored whale alert to the frontend shape
function normalizeAlert(alert) {
  const d = new Date(alert.timestamp);
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  return {
    id: alert.id,
    time,
    chain: alert.chain,
    event: alert.event,
    token: alert.token,
    size: formatSize(alert.sizeUsd) || alert.size,
    hot: alert.signal === 'bullish' || alert.signal === 'bearish',
    raw: alert,
  };
}

// Get WalletHunter alerts
router.get('/wallethunter', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const since = req.query.since || null;
  const raw = getWhaleAlerts(limit, since);

  if (raw.length === 0) {
    return res.json({
      alerts: [
        { id: 'wh_mock_1', time: '14:32', chain: 'ETH', event: 'transfer', token: 'ETH', size: '$2.5M', hot: true },
        { id: 'wh_mock_2', time: '13:15', chain: 'BTC', event: 'transfer', token: 'BTC', size: '$8.5M', hot: false },
      ],
      subscribers: 0,
      revenue: 0,
      total: 2,
      source: 'mock',
    });
  }

  res.json({
    alerts: raw.map(normalizeAlert),
    subscribers: 0,
    revenue: 0,
    total: raw.length,
  });
});

// Get all bot statuses
router.get('/status', (req, res) => {
  const forex = getBotData('forex');
  const polymarket = getBotData('polymarket');
  const recentWhales = getWhaleAlerts(5);

  res.json({
    forex: forex ? { status: forex.status, balance: forex.balance, lastUpdated: forex.timestamp } : { status: 'idle', lastUpdated: null },
    polymarket: polymarket ? { status: polymarket.status, balance: polymarket.balance, lastUpdated: polymarket.timestamp } : { status: 'idle', lastUpdated: null },
    recentWhales: recentWhales.length,
  });
});

export default router;