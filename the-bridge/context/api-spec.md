# The Bridge — API Specification

**Version:** 1.0-draft
**Last Updated:** 2026-05-19

## Base URL

`https://thebridge.oakbridgelabs.com/api`

---

## Endpoints

### Health Check

```
GET /health
Response: { status: "ok", uptime: <seconds> }
```

### AI Terminal (Claude Proxy)

```
POST /chat
Body: { message: string, context?: string }
Response: { reply: string }
Note: API key stays server-side. Never exposed to browser.
```

### Tasks

```
GET    /tasks              — List all tasks
POST   /tasks              — Create task
PUT    /tasks/:id          — Update task
DELETE /tasks/:id           — Delete task
PATCH  /tasks/:id/complete  — Mark task complete

Task schema:
{
  id: string (uuid),
  text: string,
  tag: string (peptides|health|oakbridge|dev|personal|finance),
  done: boolean,
  created: ISO-8601,
  updated: ISO-8601,
  priority?: P1|P2|P3|P4,
  dueDate?: ISO-8601
}
```

### Must Do's (Daily Top 3)

```
GET    /must-dos           — Get today's Must Do's
POST   /must-dos           — Set today's Must Do's (replaces all)
PUT    /must-dos/:position  — Update specific position (1, 2, or 3)

MustDo schema:
{
  position: 1|2|3,
  text: string,
  date: ISO-8601 (YYYY-MM-DD),
  done: boolean
}
```

### Health Logging

```
GET    /health/status       — Get today's health status
POST   /health/log          — Log a health event

Health log types:
- peptide:  { type: "peptide", name: string, done: boolean }
- workout:  { type: "workout", name: string, duration?: number, done: boolean }
- meal:     { type: "meal", label: string, protein: number, done: boolean }
- water:    { type: "water", amount: string }
- weight:   { type: "weight", lbs: number }
- reading:  { type: "reading", pages: number, book: string }
- photo:    { type: "photo", done: boolean }
```

### Reading List

```
GET    /reading/list        — Get full reading list
POST   /reading/list        — Add book to list
PATCH  /reading/list/:id    — Update book (progress, rating, status)

Book schema:
{
  id: string,
  title: string,
  author: string,
  status: "want-to-read" | "reading" | "finished",
  progress?: number (pages read),
  totalPages?: number,
  rating?: 1-5,
  category?: string,
  dateAdded: ISO-8601
}
```

### Bot Data (Read-Only)

```
GET /bots/forex          — Forex bot status + performance
GET /bots/polymarket     — Polymarket bot status + performance
GET /bots/wallethunter   — WalletHunter feed

Forex response:
{
  status: "running" | "idle" | "error",
  balance: number,
  weeklyPips: number,
  targetPips: 115,
  sleeves: [...],
  pipHistory: [...],
  lastUpdated: ISO-8601
}
```

### Bot Data Ingest (Webhooks)

```
POST /bots/forex          — Rick/bot pushes forex data
POST /bots/polymarket     — Rick/bot pushes polymarket data
POST /wallethunter         — WalletHunter alert webhook
POST /openclaw            — OpenClaw webhook receiver
```

### Gratitude

```
GET    /gratitude          — Get today's gratitude entries
POST   /gratitude          — Set today's gratitude entries

Gratitude schema:
{
  position: 1|2|3,
  text: string,
  date: ISO-8601
}
```

---

## Authentication

MVP: Single-user private tool. Basic auth or bearer token for API access.
Future: Session-based auth if multi-user access needed.

## Rate Limiting

Default: 100 requests/minute per IP. AI Terminal: 20 requests/minute per user.

## Error Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  }
}
```