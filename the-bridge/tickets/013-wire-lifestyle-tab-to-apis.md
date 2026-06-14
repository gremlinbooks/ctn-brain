# TICKET-013: Wire Lifestyle Tab to Backend APIs

**Project:** The Bridge
**Status:** 🟡 OPEN
**Priority:** P1 (Critical)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

The Lifestyle tab (75 Hard tracker, peptide stack, meal plan, body composition, reading tracker) currently renders mock/hardcoded data. The backend APIs for health logging and reading list are now complete (tickets 004 and 005), but the React components are not connected to them. This ticket wires every Lifestyle component to pull real data from the Express backend and write user input back through the API.

## Acceptance Criteria

### 75 Hard Tracker
- [ ] Fetches today's health data from `GET /api/health/status` on tab load
- [ ] Each daily task (2 workouts, diet, 1 gal water, 10 pages reading, progress photo) shows real completion status from the API
- [ ] Toggling a task calls `POST /api/health/log` with the correct type (`workout`, `meal`, `water`, `reading`, `photo`)
- [ ] Daily completion percentage calculates from logged events
- [ ] Falls back to empty/incomplete state if API returns no data (first visit of the day)

### Peptide Stack
- [ ] Displays the 3-phase peptide protocol from health data
- [ ] Each peptide shows taken/not-taken status from `GET /api/health/status`
- [ ] Checking off a peptide calls `POST /api/health/log` with `{ type: "peptide", name: "<peptide>", done: true }`
- [ ] Phase transitions are correctly handled (Phase 1 starts June 1, etc.)

### Meal Plan
- [ ] Displays today's meals from health data
- [ ] Each meal shows protein count and completion status
- [ ] Adding/checking a meal calls `POST /api/health/log` with `{ type: "meal", label: "<name>", protein: <number>, done: true }`
- [ ] Daily protein total sums from logged meals (target: 240g)

### Body Composition
- [ ] Weight entry calls `POST /api/health/log` with `{ type: "weight", lbs: <number> }`
- [ ] Current weight and target (215-225 lbs, 10% BF) display from logged data
- [ ] Shows last logged weight and date

### Reading Tracker
- [ ] Fetches reading list from `GET /api/reading/list`
- [ ] Current book (75 Hard schedule) shows with page progress
- [ ] Logging pages calls `POST /api/health/log` with `{ type: "reading", pages: <number>, book: "<title>" }`
- [ ] 75 Hard reading schedule is separate from the general reading list
- [ ] Adding a new book calls `POST /api/reading/list`

### General
- [ ] All API calls use the same base URL and error handling pattern as other wired tabs (Tasks, Must Do's, Gratitude)
- [ ] Loading states shown while API calls are in flight
- [ ] Graceful error handling — if the API is down, show a subtle error indicator, don't crash the tab
- [ ] Data refreshes when the tab is activated (not just on initial page load)
- [ ] No mock data remains in the Lifestyle components — all hardcoded data replaced with API calls

## Context

The Lifestyle tab is one of the most-used sections of The Bridge. Craig checks it daily for 75 Hard tracking, peptide logging, and meal planning. The backend endpoints are fully built and tested (tickets 004 and 005), but the frontend still renders static/mock data. This is a pure frontend wiring task — no new backend work needed.

The existing wired components (Tasks, Must Do's, Gratitude) follow this pattern:
1. `useEffect` fetches data on mount
2. Local state holds the response
3. User actions POST to the API, then re-fetch or optimistic update
4. Loading and error states handled gracefully

Follow the same pattern for consistency.

## Technical Notes

**Frontend location:** `the-bridge/bridge-local/src/App.jsx` (~1500 line single-file component)

**API endpoints already built and serving data:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health/status` | GET | Today's health status (all categories) |
| `/api/health/log` | POST | Log a health event (peptide, workout, meal, water, weight, reading, photo) |
| `/api/reading/list` | GET | Full reading list |
| `/api/reading/list` | POST | Add a book |
| `/api/reading/list/:id` | PATCH | Update book progress/rating/status |

**Health log types and their schemas:**
- `peptide`: `{ type: "peptide", name: string, done: boolean }`
- `workout`: `{ type: "workout", name: string, duration?: number, done: boolean }`
- `meal`: `{ type: "meal", label: string, protein: number, done: boolean }`
- `water`: `{ type: "water", amount: string }`
- `weight`: `{ type: "weight", lbs: number }`
- `reading`: `{ type: "reading", pages: number, book: string }`
- `photo`: `{ type: "photo", done: boolean }`

**Design system:** Parchment `#f4f3ef`, Sage `#6b8f72`, Rose `#8f6b6b` (for 75 Hard), Plum `#9a7ab0` (for peptides). Fonts: Cormorant Garamond (display), IBM Plex Mono (data), DM Sans (body).

**75 Hard reading schedule reference:**
- Days 1–10: Enchiridion (Epictetus) — current
- Days 11–30: Antifragile (Taleb)
- Days 31–40: Man's Search for Meaning (Frankl)
- Days 41–50: The War of Art (Pressfield)
- Days 51–60: Discipline Equals Freedom (Jocko)
- Days 61–75: On Duties + Musonius Rufus (Cicero/Rufus)

**Peptide phases reference:**
- Phase 1 (June 1): BPC-157, TB-500, Tesamorelin, Ipamorelin, GHK-Cu, Semax, Selank
- Phase 2 (Month 2–3): Retatrutide, MOTS-c
- Phase 3 (Month 4+): Epithalon, Pinealon, Humanin, BAM15

## Dependencies

- ✅ TICKET-001 (Express backend) — DONE
- ✅ TICKET-004 (Health Logging API) — DONE
- ✅ TICKET-005 (Reading List API) — DONE
- No other blockers — this is pure frontend work

## Completion Notes

[Fill in when done — which components were wired, any deviations from the plan, anything the next person should know.]