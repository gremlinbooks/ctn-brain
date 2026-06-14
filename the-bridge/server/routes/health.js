/**
 * The Bridge — Health Logging Routes
 * TICKET-004: Health Logging API
 */

import { Router } from 'express';
import { logHealthEvent, getHealthStatus, getHealthHistory } from '../store.js';

const router = Router();

const VALID_TYPES = ['peptide', 'workout', 'meal', 'water', 'weight', 'reading', 'photo'];

router.get('/status', (req, res) => {
  try {
    const date = req.query.date || null;
    const status = getHealthStatus(date);
    res.json(status);
  } catch (err) {
    console.error('Health status error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/log', (req, res) => {
  try {
    const { type, name, value, timestamp, source } = req.body;
    if (!type) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `type is required. Valid types: ${VALID_TYPES.join(', ')}` } });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid type "${type}". Valid types: ${VALID_TYPES.join(', ')}` } });
    }
    const event = logHealthEvent({ type, name, value, timestamp, source: source || 'manual' });
    console.log(`💊 Health logged: ${type}${name ? ' - ' + name : ''}${value ? ' = ' + value : ''}`);
    res.status(201).json({ ok: true, data: event });
  } catch (err) {
    console.error('Health log error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = getHealthHistory(days);
    res.json({ days, history });
  } catch (err) {
    console.error('Health history error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;