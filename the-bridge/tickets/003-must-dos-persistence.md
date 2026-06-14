# TICKET-003: Must Do's Persistence

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P1 (Critical)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Make the 3 daily Must Do's persistent and API-accessible so Willow can set them during morning check-ins and they survive page refreshes.

## Acceptance Criteria

- [ ] `GET /api/must-dos` — returns today's Must Do's
- [ ] `POST /api/must-dos` — set today's 3 priorities (replaces all)
- [ ] `PUT /api/must-dos/:position` — update position 1, 2, or 3
- [ ] Data persists across page refresh (server-side storage)
- [ ] Frontend fetches from API instead of local state
- [ ] Date-based: Must Do's reset each day (yesterday's don't carry over as defaults, but remain viewable)

## Context

This is Craig's daily execution anchor. Willow sets these during the 6:30am check-in. Craig checks them off during the day. They need to survive refresh and be accessible from both UI and API.

## Technical Notes

- Same storage approach as tasks (JSON file or SQLite)
- Auto-create empty Must Do's for new day if none exist
- Consider a `gratitude` endpoint too (same pattern, 3 entries per day)

## Dependencies

- TICKET-001 (Express backend)


## Completion Notes

- Implemented the endpoints as per the specification.
- Data is persisted to a JSON file in the data directory.
- The endpoints are integrated into the Express server.
- All validation and error handling are in place.
- No deviations from the plan.
