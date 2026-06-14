# PRD: The Bridge

**Author:** Willow (from Craig's vision)
**Created:** 2026-05-19
**Updated:** 2026-05-19
**Status:** Approved

## Vision

The Bridge is Craig Nowotny's personal command center — a single, always-on dashboard that unifies trading bots, health protocols, finances, tasks, and daily priorities into one click. Named for a ship's bridge (command and control), a land bridge (safe passage over turbulent waters), and the Oakbridge brand.

**Mottos:** *Endure. Rise. Create.* | *Aut Vincere Aut Mori*

## Problem Statement

Craig is running 6+ projects, a 13-peptide health protocol, 75 Hard, and rebuilding financially — all with ADHD. Context switching kills momentum. Important things fall through cracks. The Bridge externalizes the tracking, reminding, and prioritizing so Craig can focus on execution.

## Goals

1. **One-click awareness** — See the status of everything that matters in a single glance
2. **Externalized memory** — Tasks, priorities, health data, reading lists live outside Craig's head
3. **Bot integration** — Trading bot performance, whale alerts, and bot health visible in real-time
4. **Willow integration** — The assistant can read and write data to The Bridge, keeping everything in sync
5. **Daily rhythm** — Must Do's, gratitude, 75 Hard tracking, meal/protein tracking built into the flow

## Non-Goals (for MVP)

- Not building a mobile app (yet) — responsive web first
- Not replacing email/calendar clients — surfacing summaries only
- Not building a trading engine — displaying results from existing bots
- Not building social features — this is a private command center

## Users

- **Craig Nowotny** — primary and only user. This is a personal tool.

## Features

### Must Have (MVP)
- Overview tab with Must Do's, Recent Mail, Next Meeting, Financial snapshot, Health summary, Open Tasks, Gratitude, AI Terminal
- Bots tab with Forex and Polymarket performance, sleeve tables, WalletHunter feed
- Lifestyle tab with 75 Hard tracker, Peptide stack (3 phases), Meal plan, Body composition, Reading tracker
- Revenue tab with $1M mission panel and Oakbridge Labs panel
- Task management — full CRUD for tasks with categories and completion
- Must Do's — 3 daily priorities, persistent across sessions
- AI Terminal — Claude-powered chat with full context
- Backend API — Express server proxying Claude, serving bot data, handling CRUD

### Should Have (V2)
- Communications tab — live Gmail and Google Calendar integration
- Willow API integration — Willow reads/writes tasks, health data, Must Do's
- localStorage persistence for Must Do's and Gratitude
- Daily weight entry in Body Composition
- Budget tab — income vs expense tracking
- Notification system — WalletHunter hot signals surfaced to top bar

### Nice to Have (Later)
- The Forge — project/build management section
- WebSocket real-time bot data (replace polling)
- Mobile-optimized responsive layout
- Dark mode

## Technical Architecture

**Frontend:** React 18 + Vite + Recharts + Google Fonts (Cormorant Garamond, IBM Plex Mono, DM Sans)

**Backend:** Node.js + Express (ESM) + Anthropic Claude API (server-side proxy)

**Infrastructure:** Ubuntu VPS, Nginx (reverse proxy + SSL), PM2 (process management), Let's Encrypt

**Database:** Start with in-memory + localStorage, migrate to Supabase for persistence

**Deployment:** `/var/www/the-bridge/` on VPS, auto-restart on reboot

**Domain:** thebridge.oakbridgelabs.com

## Data Sources

| Data | Source | Integration |
|------|--------|-------------|
| Forex bot performance | Rick/bot delivery | POST to /api/bots/forex or Supabase |
| Polymarket bot performance | Rick/bot delivery | POST to /api/bots/polymarket or Supabase |
| WalletHunter alerts | Bot scraping pipeline | POST to /api/wallethunter webhook |
| Tasks | Willow + manual input | CRUD via /api/tasks |
| Must Do's | Willow + manual input | CRUD via /api/must-dos |
| Health data | Willow check-ins | POST to /api/health/log |
| Reading list | Willow + manual input | CRUD via /api/reading |
| Email | Gmail API | OAuth + Google API (V2) |
| Calendar | Google Calendar API | OAuth + Google API (V2) |
| AI Terminal | Anthropic Claude | Server-side proxy via /api/chat |

## Design / UX

**Aesthetic:** Zen command — luxury instrument, not a dashboard. Warm parchment (#f4f3ef), sage (#6b8f72), amber (#9a7d52), slate (#5a7089).

**Typography:**
- Cormorant Garamond — display, wordmark, numbers
- IBM Plex Mono — all data, times, values, labels
- DM Sans — body text, navigation, prose

**Layout:** 6 tabs (Overview · Bots · Communications · Lifestyle · Revenue · Budget), top bar with timezone clocks, bot status dots, daily P&L.

**Full design spec:** See `The_Bridge_Summary.md` in the project root.

## Success Metrics

1. Craig opens The Bridge first thing in the morning and last thing at night
2. Zero context-switching — everything visible without leaving the dashboard
3. Willow can push updates (tasks, health, Must Do's) that appear in real-time
4. Bot data reflects live performance within 15 minutes
5. 75 Hard tracking is updated daily without friction

## Open Questions

- Database choice: Supabase vs SQLite vs something else? (Recommendation: Supabase for future scale)
- Authentication: Single-user private tool — is auth needed? (Recommendation: basic auth for now)
- Real-time updates: WebSocket vs polling vs SSE? (Recommendation: SSE for MVP, WebSocket later)

## Timeline

- **Phase 1 (Now):** Frontend complete (mock data), build Express backend, wire API endpoints, deploy to VPS
- **Phase 2 (1-2 weeks):** Connect live bot data via Rick, implement task/health CRUD, localStorage persistence
- **Phase 3 (2-4 weeks):** Google OAuth for email/calendar, Willow API integration, Supabase migration