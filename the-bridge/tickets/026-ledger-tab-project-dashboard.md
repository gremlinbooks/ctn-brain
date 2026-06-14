# Ticket 026 — LEDGER Tab: Project Dashboard with Ticket Management

## Context

The LEDGER is the single source of truth for all Oakbridge projects. Currently, The Bridge doesn't have a unified view of all LEDGER projects. Craig wants a dedicated "LEDGER" tab that shows all projects, their open tickets, and allows inline ticket management.

## Acceptance Criteria

### Backend
- [ ] `GET /api/ledger/projects` — scan LEDGER filesystem, return all projects with metadata
- [ ] `GET /api/ledger/projects/:slug` — return single project with full details (PRD, STATUS, tickets)
- [ ] `GET /api/ledger/projects/:slug/tickets` — return parsed tickets for a project
- [ ] `GET /api/ledger/projects/:slug/tickets/:id` — return single ticket
- [ ] `POST /api/ledger/projects/:slug/tickets` — create new ticket from template
- [ ] `PUT /api/ledger/projects/:slug/tickets/:id` — update ticket (status, priority, assignee, body)
- [ ] Parse markdown frontmatter into structured JSON
- [ ] Handle missing PRDs gracefully (show STATUS-only projects)

### Frontend
- [ ] New "LEDGER" tab in nav (between GTD and Forge)
- [ ] Project cards: name, description, open ticket count, overall status emoji
- [ ] Ticket list per project with status filters
- [ ] Inline editing for ticket status, priority, assignee
- [ ] "New Ticket" button with template prefill
- [ ] Ticket detail view with full markdown body

### Data Model
```typescript
interface Project {
  slug: string;
  name: string;
  description: string;
  status: 'green' | 'yellow' | 'red';
  ticketCount: { open: number; inProgress: number; done: number; blocked: number };
  hasPRD: boolean;
  hasTickets: boolean;
}

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'done' | 'blocked' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  body: string;
  frontmatter: Record<string, any>;
}
```

## Technical Notes

- LEDGER path: `~/workspace/LEDGER/` (relative to server working directory)
- Ticket parsing: gray-matter for frontmatter, then markdown body
- Git commit: write files to disk, but DON'T auto-commit — Willow/Craig review first
- File naming: `###-kebab-case-title.md`
- Template location: `LEDGER/_templates/`

## Bot Command Section
Each bot project needs a dedicated section in its PRD/STATUS for:
- Start command
- Stop command
- Restart command
- Status check command
- Log location

Morty will handle this documentation work separately (see handoff).

## Out of Scope
- Auto-commit to git (manual review required)
- PRD creation for undocumented projects (Morty's task)
- Real-time file watching (polling is fine)
- Ticket reordering/drag-and-drop

## Test Plan
1. Hit `/api/ledger/projects` → returns all 6 projects
2. Hit `/api/ledger/projects/the-bridge/tickets` → returns parsed tickets 001-025
3. POST new ticket → file written to `the-bridge/tickets/026-*.md`
4. PUT update status → file updated, git status shows change
5. Frontend: navigate to LEDGER tab → see project cards → click The Bridge → see tickets → edit status → refresh persists
