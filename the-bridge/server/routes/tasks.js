/**
 * The Bridge — Task CRUD Endpoints
 * TICKET-002: Task management API
 *
 * GET    /api/tasks              — List all tasks
 * POST   /api/tasks              — Create task
 * PUT    /api/tasks/:id          — Update task
 * DELETE /api/tasks/:id          — Delete task
 * PATCH  /api/tasks/:id/complete — Mark task done
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const TASKS_FILE = join(DATA_DIR, 'tasks.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const VALID_TAGS = ['peptides', 'health', 'oakbridge', 'dev', 'personal', 'finance'];
const VALID_PRIORITIES = ['P1', 'P2', 'P3', 'P4'];

// ── Persistence ─────────────────────────────────────────

function loadTasks() {
  try {
    if (existsSync(TASKS_FILE)) {
      const raw = readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('⚠️  Tasks load error, starting fresh:', e.message);
  }
  return [];
}

function saveTasks(tasks) {
  try {
    writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (e) {
    console.error('⚠️  Tasks save error:', e.message);
  }
}

const router = Router();

// ── GET /api/tasks — List all tasks ─────────────────────

router.get('/', (req, res) => {
  try {
    const tasks = loadTasks();
    // Support filtering by tag or done status
    let filtered = tasks;
    if (req.query.tag) {
      filtered = filtered.filter(t => t.tag === req.query.tag);
    }
    if (req.query.done !== undefined) {
      const done = req.query.done === 'true';
      filtered = filtered.filter(t => t.done === done);
    }
    res.json({ tasks: filtered, total: tasks.length });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── POST /api/tasks — Create task ───────────────────────

router.post('/', (req, res) => {
  try {
    const { text, tag, priority, dueDate, source } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'text is required' } });
    }

    if (tag && !VALID_TAGS.includes(tag)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid tag. Valid: ${VALID_TAGS.join(', ')}` } });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid priority. Valid: ${VALID_PRIORITIES.join(', ')}` } });
    }

    const tasks = loadTasks();
    const now = new Date().toISOString();

    const task = {
      id: randomUUID(),
      text: text.trim(),
      tag: tag || 'personal',
      done: false,
      priority: priority || 'P3',
      dueDate: dueDate || null,
      source: source || 'manual',
      created: now,
      updated: now,
    };

    tasks.push(task);
    saveTasks(tasks);

    console.log(`✅ Task created: ${task.id} — "${task.text}" [${task.tag}/${task.priority}]`);
    res.status(201).json({ ok: true, task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── PUT /api/tasks/:id — Update task ────────────────────

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const tasks = loadTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const { text, tag, priority, dueDate, done } = req.body;

    if (tag && !VALID_TAGS.includes(tag)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid tag. Valid: ${VALID_TAGS.join(', ')}` } });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid priority. Valid: ${VALID_PRIORITIES.join(', ')}` } });
    }

    const task = tasks[index];
    if (text !== undefined) task.text = text.trim();
    if (tag !== undefined) task.tag = tag;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (done !== undefined) task.done = Boolean(done);
    task.updated = new Date().toISOString();

    saveTasks(tasks);

    console.log(`✏️  Task updated: ${task.id} — "${task.text}"`);
    res.json({ ok: true, task });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── DELETE /api/tasks/:id — Delete task ─────────────────

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const tasks = loadTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const [removed] = tasks.splice(index, 1);
    saveTasks(tasks);

    console.log(`🗑️  Task deleted: ${removed.id} — "${removed.text}"`);
    res.json({ ok: true, task: removed });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── PATCH /api/tasks/:id/complete — Mark done ───────────

router.patch('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const tasks = loadTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const task = tasks[index];
    task.done = true;
    task.updated = new Date().toISOString();

    saveTasks(tasks);

    console.log(`✅ Task completed: ${task.id} — "${task.text}"`);
    res.json({ ok: true, task });
  } catch (err) {
    console.error('Complete task error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;