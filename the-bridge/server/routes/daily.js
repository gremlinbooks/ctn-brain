/**
 * The Bridge — Must Do's & Gratitude Routes
 * TICKET-003: Must Do's Persistence
 * TICKET-009: Gratitude Persistence
 */

import { Router } from 'express';
import { getMustDos, setMustDos, updateMustDo, getGratitude, setGratitude } from '../store.js';

const router = Router();

// ── Must Do's ───────────────────────────────────────────

router.get('/must-dos', (req, res) => {
  try {
    const date = req.query.date || null;
    const result = getMustDos(date);
    res.json(result);
  } catch (err) {
    console.error('Get must-dos error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/must-dos', (req, res) => {
  try {
    const { items, date } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'items array required with 3 entries' } });
    }
    if (items.length !== 3) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Exactly 3 Must Do items required' } });
    }
    const result = setMustDos(items, date);
    console.log(`✅ Must Do's set for ${result.date}: ${items.map(i => i.text || '(empty)').join(', ')}`);
    res.status(201).json(result);
  } catch (err) {
    console.error('Set must-dos error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.put('/must-dos/:position', (req, res) => {
  try {
    const position = parseInt(req.params.position);
    if (![1, 2, 3].includes(position)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Position must be 1, 2, or 3' } });
    }
    const { text, done, date } = req.body;
    const update = {};
    if (text !== undefined) update.text = text;
    if (done !== undefined) update.done = done;
    const result = updateMustDo(position, update, date || null);
    res.json(result);
  } catch (err) {
    console.error('Update must-do error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/must-dos/history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const result = getMustDos(dateStr);
      if (result.items.some(item => item.text)) {
        history.push(result);
      }
    }
    res.json({ history });
  } catch (err) {
    console.error('Must-dos history error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── Gratitude ───────────────────────────────────────────

router.get('/gratitude', (req, res) => {
  try {
    const date = req.query.date || null;
    const result = getGratitude(date);
    res.json(result);
  } catch (err) {
    console.error('Get gratitude error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/gratitude', (req, res) => {
  try {
    const { items, date } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'items array required with 3 entries' } });
    }
    if (items.length !== 3) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Exactly 3 gratitude items required' } });
    }
    const result = setGratitude(items, date);
    res.status(201).json(result);
  } catch (err) {
    console.error('Set gratitude error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/gratitude/history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const result = getGratitude(dateStr);
      if (result.items.some(item => item.text)) {
        history.push(result);
      }
    }
    res.json({ history });
  } catch (err) {
    console.error('Gratitude history error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;