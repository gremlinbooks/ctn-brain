/**
 * The Bridge — In-Memory Data Store
 * 
 * MVP storage layer. All data persists in-process (resets on server restart).
 * Will migrate to Supabase in Phase 3.
 * 
 * Patterns:
 * - Bot data: latest-wins (overwrite snapshot per bot)
 * - WalletHunter: append-only event stream
 * - Must Do's / Gratitude: date-keyed, 3 entries per day
 * - Health logs: append-only events, aggregated for status
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ── In-Memory Store ──────────────────────────────────────
const store = {
  // Bot data: latest snapshot per source
  // Keyed by source: 'forex', 'polymarket'
  bots: {
    forex: null,
    polymarket: null,
  },

  // WalletHunter alerts: append-only
  wallethunter: [],

  // Bot history: 7-day rolling, keyed by source
  botHistory: {
    forex: [],    // [{ timestamp, data }]
    polymarket: [],
  },

  // Must Do's: date-keyed { 'YYYY-MM-DD': [{ position, text, done }] }
  mustDos: {},

  // Gratitude: date-keyed { 'YYYY-MM-DD': [{ position, text }] }
  gratitude: {},

  // Health logs: date-keyed { 'YYYY-MM-DD': [{ type, name?, value?, timestamp, source }] }
  healthLogs: {},

  // Reading list: simple persistent list for the Lifestyle tab
  readingList: [],
};

// ── Persistence ─────────────────────────────────────────
const STORE_FILE = join(DATA_DIR, 'store.json');

export function loadStore() {
  try {
    if (existsSync(STORE_FILE)) {
      const raw = readFileSync(STORE_FILE, 'utf-8');
      const saved = JSON.parse(raw);
      // Merge saved data into store (preserves defaults for new fields)
      Object.assign(store.bots, saved.bots || {});
      Object.assign(store.botHistory, saved.botHistory || {});
      store.wallethunter = saved.wallethunter || [];
      Object.assign(store.mustDos, saved.mustDos || {});
      Object.assign(store.gratitude, saved.gratitude || {});
      Object.assign(store.healthLogs, saved.healthLogs || {});
      store.readingList = saved.readingList || [];
      console.log('📦 Store loaded from disk');
    }
  } catch (e) {
    console.error('⚠️  Store load error, starting fresh:', e.message);
  }
}

export function saveStore() {
  try {
    writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('⚠️  Store save error:', e.message);
  }
}

// ── Helpers ─────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function pruneOlderThan7Days(arr) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return arr.filter(item => new Date(item.timestamp).getTime() > cutoff);
}

// ── Bot Data (latest-wins) ──────────────────────────────
export function setBotData(source, data) {
  if (source !== 'forex' && source !== 'polymarket') {
    throw new Error(`Unknown bot source: ${source}`);
  }

  const timestamp = data.timestamp || new Date().toISOString();
  const snapshot = { ...data, timestamp, source };

  store.bots[source] = snapshot;

  // Append to history (keep 7 days rolling)
  store.botHistory[source].push({ timestamp, data: snapshot });
  store.botHistory[source] = pruneOlderThan7Days(store.botHistory[source]);

  saveStore();
  return snapshot;
}

export function getBotData(source) {
  return store.bots[source] || null;
}

export function getBotHistory(source, days = 7) {
  return store.botHistory[source] || [];
}

// ── WalletHunter (append-only) ─────────────────────────
export function addWhaleAlert(alert) {
  const timestamp = alert.timestamp || new Date().toISOString();
  const entry = { ...alert, timestamp, id: `wh_${Date.now()}` };
  store.wallethunter.unshift(entry); // Newest first

  // Keep last 500 alerts
  if (store.wallethunter.length > 500) {
    store.wallethunter = store.wallethunter.slice(0, 500);
  }

  saveStore();
  return entry;
}

export function getWhaleAlerts(limit = 50, since = null) {
  let alerts = store.wallethunter;
  if (since) {
    alerts = alerts.filter(a => new Date(a.timestamp).getTime() > new Date(since).getTime());
  }
  return alerts.slice(0, limit);
}

// ── Must Do's (date-keyed) ─────────────────────────────
export function getMustDos(date = null) {
  const d = date || today();
  if (!store.mustDos[d]) {
    store.mustDos[d] = [
      { position: 1, text: '', done: false },
      { position: 2, text: '', done: false },
      { position: 3, text: '', done: false },
    ];
  }
  return { date: d, items: store.mustDos[d] };
}

export function setMustDos(items, date = null) {
  const d = date || today();
  // Accept either 3-item array or object with position keys
  const normalized = items.map((item, i) => ({
    position: item.position || (i + 1),
    text: item.text || '',
    done: item.done || false,
  }));
  store.mustDos[d] = normalized;
  saveStore();
  return { date: d, items: normalized };
}

export function updateMustDo(position, update, date = null) {
  const d = date || today();
  const entry = getMustDos(d);
  const idx = entry.items.findIndex(item => item.position === position);
  if (idx === -1) {
    throw new Error(`Position ${position} not found`);
  }
  entry.items[idx] = { ...entry.items[idx], ...update, position };
  store.mustDos[d] = entry.items;
  saveStore();
  return { date: d, items: store.mustDos[d] };
}

// ── Gratitude (date-keyed) ─────────────────────────────
export function getGratitude(date = null) {
  const d = date || today();
  if (!store.gratitude[d]) {
    store.gratitude[d] = [
      { position: 1, text: '' },
      { position: 2, text: '' },
      { position: 3, text: '' },
    ];
  }
  return { date: d, items: store.gratitude[d] };
}

export function setGratitude(items, date = null) {
  const d = date || today();
  const normalized = items.map((item, i) => ({
    position: item.position || (i + 1),
    text: item.text || '',
  }));
  store.gratitude[d] = normalized;
  saveStore();
  return { date: d, items: normalized };
}

// ── Health Logs (append-only, date-keyed) ───────────────
const HEALTH_TYPES = ['peptide', 'workout', 'meal', 'water', 'weight', 'reading', 'photo'];

export function logHealthEvent(event) {
  if (!HEALTH_TYPES.includes(event.type)) {
    throw new Error(`Unknown health event type: ${event.type}. Valid: ${HEALTH_TYPES.join(', ')}`);
  }

  const d = today();
  const entry = {
    id: `hl_${Date.now()}`,
    type: event.type,
    name: event.name || null,
    value: event.value || null,
    timestamp: event.timestamp || new Date().toISOString(),
    source: event.source || 'manual',
  };

  if (!store.healthLogs[d]) {
    store.healthLogs[d] = [];
  }
  store.healthLogs[d].push(entry);
  saveStore();
  return entry;
}

export function getHealthStatus(date = null) {
  const d = date || today();
  const logs = store.healthLogs[d] || [];

  // 75 Hard daily tasks (7 required)
  const seventyFiveHard = {
    tasks: [
      { type: 'workout', label: '2x Workout', done: logs.some(l => l.type === 'workout') },
      { type: 'diet', label: 'Follow Diet', done: logs.some(l => l.type === 'meal') },
      { type: 'water', label: '1 Gallon Water', done: logs.some(l => l.type === 'water') },
      { type: 'reading', label: '10 Pages Reading', done: logs.some(l => l.type === 'reading') },
      { type: 'photo', label: 'Progress Photo', done: logs.some(l => l.type === 'photo') },
      { type: 'peptide', label: 'Peptide Protocol', done: logs.some(l => l.type === 'peptide') },
      { type: 'weight', label: 'Weigh In', done: logs.some(l => l.type === 'weight') },
    ],
    completedCount: 0,
    totalCount: 7,
    percentage: 0,
  };
  seventyFiveHard.completedCount = seventyFiveHard.tasks.filter(t => t.done).length;
  seventyFiveHard.percentage = Math.round((seventyFiveHard.completedCount / seventyFiveHard.totalCount) * 100);

  // Peptide tracking
  const peptideLogs = logs.filter(l => l.type === 'peptide');
  const peptides = peptideLogs.map(l => ({ name: l.name, done: true, timestamp: l.timestamp }));

  // Weight tracking
  const weightLogs = logs.filter(l => l.type === 'weight');

  // Workout tracking
  const workoutLogs = logs.filter(l => l.type === 'workout');

  // Reading tracking
  const readingLogs = logs.filter(l => l.type === 'reading');

  // Meal tracking
  const mealLogs = logs.filter(l => l.type === 'meal');

  // Water tracking
  const waterLogs = logs.filter(l => l.type === 'water');

  return {
    date: d,
    seventyFiveHard,
    peptides,
    weight: weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null,
    workouts: workoutLogs,
    readings: readingLogs,
    meals: mealLogs,
    water: waterLogs,
    allLogs: logs,
  };
}

export function getHealthHistory(days = 7) {
  const history = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const status = getHealthStatus(dateStr);
    if (status.allLogs.length > 0) {
      history.push(status);
    }
  }
  return history;
}

// ── Reading List ───────────────────────────────────────
const DEFAULT_READING_LIST = [
  { id: 'book_1', days: '1-10', book: 'Enchiridion', author: 'Epictetus', active: true, totalPages: null, pagesToday: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'book_2', days: '11-30', book: 'Antifragile', author: 'Nassim Taleb', active: false, totalPages: null, pagesToday: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'book_3', days: '31-40', book: "Man's Search for Meaning", author: 'Viktor Frankl', active: false, totalPages: null, pagesToday: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'book_4', days: '41-50', book: 'The War of Art', author: 'Steven Pressfield', active: false, totalPages: null, pagesToday: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'book_5', days: '51-60', book: 'Discipline Equals Freedom', author: 'Jocko Willink', active: false, totalPages: null, pagesToday: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'book_6', days: '61-75', book: 'On Duties + Musonius Rufus', author: 'Cicero / Rufus', active: false, totalPages: null, pagesToday: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

function ensureReadingList() {
  if (!Array.isArray(store.readingList) || store.readingList.length === 0) {
    store.readingList = DEFAULT_READING_LIST.map(entry => ({ ...entry }));
    saveStore();
  }
}

export function getReadingList() {
  ensureReadingList();
  return store.readingList;
}

export function addReadingBook(book) {
  ensureReadingList();

  if (book.active) {
    store.readingList = store.readingList.map(entry => ({ ...entry, active: false }));
  }

  const timestamp = new Date().toISOString();
  const entry = {
    id: `book_${Date.now()}`,
    book: book.book,
    author: book.author || '',
    days: book.days || '',
    active: Boolean(book.active),
    totalPages: book.totalPages ?? null,
    pagesToday: book.pagesToday ?? 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.readingList.push(entry);
  saveStore();
  return entry;
}

export function updateReadingBook(id, update) {
  ensureReadingList();
  const index = store.readingList.findIndex(entry => entry.id === id);

  if (index === -1) {
    throw new Error('NOT_FOUND');
  }

  if (update.active) {
    store.readingList = store.readingList.map(entry => ({ ...entry, active: false }));
  }

  const current = store.readingList[index];
  const next = {
    ...current,
    ...update,
    pagesToday: update.pagesToday ?? current.pagesToday ?? 0,
    totalPages: update.totalPages ?? current.totalPages ?? null,
    updatedAt: new Date().toISOString(),
  };
  store.readingList[index] = next;
  saveStore();
  return next;
}

// ── Export full store (for debugging) ──────────────────
export function getFullStore() {
  return { ...store };
}

export default store;
