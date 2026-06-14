# TICKET-002: Task CRUD Endpoints

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P1 (Critical)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Build the task management API so tasks can be created, read, updated, deleted, and marked complete from both The Bridge UI and Willow via API calls.

## Acceptance Criteria

- [x] `GET /api/tasks` — returns all tasks
- [x] `POST /api/tasks` — create a new task (text, tag, priority, dueDate)
- [x] `PUT /api/tasks/:id` — update task fields
- [x] `DELETE /api/tasks/:id` — delete a task
- [x] `PATCH /api/tasks/:id/complete` — mark task done
- [x] Tasks persisted to JSON file or SQLite (not just memory — must survive restart)
- [ ] Frontend updated to fetch tasks from API instead of mock data
- [x] Categories/tags: peptides, health, oakbridge, dev, personal, finance

## Context

Willow needs to add/complete tasks via API from Telegram check-ins. Craig needs to manage tasks in The Bridge UI. Both should stay in sync.

## Technical Notes

- Start with JSON file storage (simple, no DB dependency for MVP)
- Each task gets a UUID
- Include created/updated timestamps
- Consider adding a `source` field (e.g., "willow", "manual") for audit

## Dependencies

- TICKET-001 (Express backend must exist first)

## Completion Notes

All CRUD endpoints implemented and deployed to Heroku (v14).

- `GET /api/tasks` — list all, supports `?tag=dev` and `?done=true` filtering
- `POST /api/tasks` — create with text, tag, priority, dueDate, source
- `PUT /api/tasks/:id` — update any fields
- `DELETE /api/tasks/:id` — delete
- `PATCH /api/tasks/:id/complete` — mark done
- Persisted to `data/tasks.json` (survives restart)
- Valid tags: peptides, health, oakbridge, dev, personal, finance
- Valid priorities: P1, P2, P3, P4 (defaults to P3)
- UUID ids, created/updated timestamps, source tracking (willow/manual)

Remaining: Frontend task component needs to be wired to use `/api/tasks` instead of mock data (separate ticket).
