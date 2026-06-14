/**
 * The Bridge — LEDGER Project Routes
 * TICKET-026: LEDGER Tab — Project Dashboard with Ticket Management
 * 
 * GET  /api/ledger/projects              — List all projects
 * GET  /api/ledger/projects/:slug      — Get single project details
 * GET  /api/ledger/projects/:slug/tickets — List all tickets for project
 * GET  /api/ledger/projects/:slug/tickets/:id — Get single ticket
 * POST /api/ledger/projects/:slug/tickets — Create new ticket
 * PUT  /api/ledger/projects/:slug/tickets/:id — Update ticket
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEDGER_ROOT = path.resolve(__dirname, '../../..'); // server/routes → server → the-bridge → LEDGER

const router = Router();

// ── Helpers ──────────────────────────────────────────────

function parseFrontmatter(content) {
  const lines = content.split('\n');
  const fm = {};
  let i = 0;
  
  if (lines[0]?.trim() === '---') {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '---') {
      const line = lines[i];
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        // Remove quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        fm[key] = val;
      }
      i++;
    }
    i++; // skip closing ---
  }
  
  const body = lines.slice(i).join('\n').trim();
  return { frontmatter: fm, body };
}

function statusEmojiToCode(emoji) {
  const map = {
    '🟢': 'done',
    '🔵': 'in-progress',
    '🟡': 'open',
    '🔴': 'blocked',
    '⚪': 'cancelled',
  };
  return map[emoji] || 'open';
}

function codeToStatusEmoji(code) {
  const map = {
    'done': '🟢',
    'in-progress': '🔵',
    'open': '🟡',
    'blocked': '🔴',
    'cancelled': '⚪',
  };
  return map[code] || '🟡';
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function nextTicketId(ticketsDir) {
  const files = fs.readdirSync(ticketsDir).filter(f => f.endsWith('.md'));
  let max = 0;
  for (const f of files) {
    const m = f.match(/^(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return String(max + 1).padStart(3, '0');
}

// ── GET: List all projects ─────────────────────────────

router.get('/projects', (req, res) => {
  try {
    const entries = fs.readdirSync(LEDGER_ROOT, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === '_templates' || entry.name === 'daily-journal') continue;
      
      const slug = entry.name;
      const dir = path.join(LEDGER_ROOT, slug);
      
      let name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      let description = '';
      let status = 'yellow';
      let hasPRD = false;
      let hasTickets = false;
      
      // Check for PRD
      const prdPath = path.join(dir, 'PRD.md');
      if (fs.existsSync(prdPath)) {
        hasPRD = true;
        const prdContent = fs.readFileSync(prdPath, 'utf-8');
        const { frontmatter } = parseFrontmatter(prdContent);
        if (frontmatter.name) name = frontmatter.name;
        if (frontmatter.description) description = frontmatter.description;
        if (frontmatter.status) {
          const s = frontmatter.status.toLowerCase();
          status = s.includes('green') || s.includes('live') ? 'green' : s.includes('red') ? 'red' : 'yellow';
        }
      }
      
      // Check for STATUS
      const statusPath = path.join(dir, 'STATUS.md');
      if (fs.existsSync(statusPath)) {
        const statusContent = fs.readFileSync(statusPath, 'utf-8');
        // Try to extract overall status from first heading or emoji
        const firstLine = statusContent.split('\n')[0];
        if (firstLine.includes('🟢')) status = 'green';
        else if (firstLine.includes('🔴')) status = 'red';
        else if (firstLine.includes('🟡')) status = 'yellow';
      }
      
      // Count tickets
      const ticketsDir = path.join(dir, 'tickets');
      let ticketCount = { open: 0, inProgress: 0, done: 0, blocked: 0, cancelled: 0 };
      if (fs.existsSync(ticketsDir)) {
        hasTickets = true;
        const files = fs.readdirSync(ticketsDir).filter(f => f.endsWith('.md'));
        for (const f of files) {
          const content = fs.readFileSync(path.join(ticketsDir, f), 'utf-8');
          const { frontmatter } = parseFrontmatter(content);
          const s = statusEmojiToCode(frontmatter.status || '');
          if (ticketCount[s] !== undefined) ticketCount[s]++;
          else ticketCount.open++;
        }
      }
      
      projects.push({
        slug,
        name,
        description,
        status,
        hasPRD,
        hasTickets,
        ticketCount,
      });
    }
    
    res.json({ projects });
  } catch (err) {
    console.error('LEDGER projects error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── GET: Single project ────────────────────────────────

router.get('/projects/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const dir = path.join(LEDGER_ROOT, slug);
    
    if (!fs.existsSync(dir)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }
    
    let prd = null;
    let statusDoc = null;
    
    const prdPath = path.join(dir, 'PRD.md');
    if (fs.existsSync(prdPath)) {
      const content = fs.readFileSync(prdPath, 'utf-8');
      const parsed = parseFrontmatter(content);
      prd = { ...parsed, path: prdPath };
    }
    
    const statusPath = path.join(dir, 'STATUS.md');
    if (fs.existsSync(statusPath)) {
      const content = fs.readFileSync(statusPath, 'utf-8');
      const parsed = parseFrontmatter(content);
      statusDoc = { ...parsed, path: statusPath };
    }
    
    res.json({ slug, prd, status: statusDoc });
  } catch (err) {
    console.error('LEDGER project error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── GET: List tickets for project ──────────────────────

router.get('/projects/:slug/tickets', (req, res) => {
  try {
    const { slug } = req.params;
    const ticketsDir = path.join(LEDGER_ROOT, slug, 'tickets');
    
    if (!fs.existsSync(ticketsDir)) {
      return res.json({ tickets: [] });
    }
    
    const files = fs.readdirSync(ticketsDir)
      .filter(f => f.endsWith('.md'))
      .sort();
    
    const tickets = [];
    for (const f of files) {
      const content = fs.readFileSync(path.join(ticketsDir, f), 'utf-8');
      const parsed = parseFrontmatter(content);
      const id = f.replace('.md', '');
      tickets.push({
        id,
        title: parsed.frontmatter.title || id,
        status: statusEmojiToCode(parsed.frontmatter.status || ''),
        priority: (parsed.frontmatter.priority || 'medium').toLowerCase(),
        assignee: parsed.frontmatter.assignee || null,
        body: parsed.body,
        frontmatter: parsed.frontmatter,
      });
    }
    
    res.json({ tickets });
  } catch (err) {
    console.error('LEDGER tickets error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── GET: Single ticket ───────────────────────────────────

router.get('/projects/:slug/tickets/:id', (req, res) => {
  try {
    const { slug, id } = req.params;
    const ticketPath = path.join(LEDGER_ROOT, slug, 'tickets', `${id}.md`);
    
    if (!fs.existsSync(ticketPath)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }
    
    const content = fs.readFileSync(ticketPath, 'utf-8');
    const parsed = parseFrontmatter(content);
    
    res.json({
      id,
      title: parsed.frontmatter.title || id,
      status: statusEmojiToCode(parsed.frontmatter.status || ''),
      priority: (parsed.frontmatter.priority || 'medium').toLowerCase(),
      assignee: parsed.frontmatter.assignee || null,
      body: parsed.body,
      frontmatter: parsed.frontmatter,
    });
  } catch (err) {
    console.error('LEDGER ticket error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── POST: Create new ticket ────────────────────────────

router.post('/projects/:slug/tickets', (req, res) => {
  try {
    const { slug } = req.params;
    const { title, status = 'open', priority = 'medium', assignee, body = '' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Title is required' } });
    }
    
    const ticketsDir = path.join(LEDGER_ROOT, slug, 'tickets');
    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }
    
    const id = nextTicketId(ticketsDir);
    const fileName = `${id}-${slugify(title)}.md`;
    const filePath = path.join(ticketsDir, fileName);
    
    const emoji = codeToStatusEmoji(status);
    const content = `---
title: "${title}"
status: ${emoji}
priority: ${priority}
${assignee ? `assignee: ${assignee}` : ''}
---

${body}
`;
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    res.status(201).json({
      ok: true,
      ticket: {
        id: fileName.replace('.md', ''),
        title,
        status,
        priority,
        assignee: assignee || null,
        body,
      },
    });
  } catch (err) {
    console.error('LEDGER create ticket error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ── PUT: Update ticket ───────────────────────────────────

router.put('/projects/:slug/tickets/:id', (req, res) => {
  try {
    const { slug, id } = req.params;
    const updates = req.body;
    const ticketPath = path.join(LEDGER_ROOT, slug, 'tickets', `${id}.md`);
    
    if (!fs.existsSync(ticketPath)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }
    
    const content = fs.readFileSync(ticketPath, 'utf-8');
    const parsed = parseFrontmatter(content);
    
    // Merge updates
    if (updates.title) parsed.frontmatter.title = updates.title;
    if (updates.status) parsed.frontmatter.status = codeToStatusEmoji(updates.status);
    if (updates.priority) parsed.frontmatter.priority = updates.priority;
    if (updates.assignee !== undefined) parsed.frontmatter.assignee = updates.assignee;
    if (updates.body) parsed.body = updates.body;
    
    // Rebuild file
    const fmLines = Object.entries(parsed.frontmatter)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${v}`);
    
    const newContent = `---\n${fmLines.join('\n')}\n---\n\n${parsed.body}`;
    fs.writeFileSync(ticketPath, newContent, 'utf-8');
    
    res.json({
      ok: true,
      ticket: {
        id,
        title: parsed.frontmatter.title,
        status: statusEmojiToCode(parsed.frontmatter.status),
        priority: parsed.frontmatter.priority,
        assignee: parsed.frontmatter.assignee || null,
        body: parsed.body,
      },
    });
  } catch (err) {
    console.error('LEDGER update ticket error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
