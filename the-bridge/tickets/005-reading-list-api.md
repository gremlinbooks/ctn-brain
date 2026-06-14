# TICKET-005: Reading List API

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P2 (High)
**Assigned:** Codex
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Build a reading list API so Willow can add books, update progress, and Craig can manage his reading list from both The Bridge UI and Telegram.

## Acceptance Criteria

- [x] `GET /api/reading/list` — returns full reading list
- [x] `POST /api/reading/list` — add a book
- [x] `PATCH /api/reading/list/:id` — update progress / active selection
- [x] Reading list persists in the Bridge store
- [x] Frontend reading tracker can fetch from API
- [x] 75 Hard reading plan is served from the API-backed reading list

## Context

Craig wants to add books on the fly ("add Deep Work to my reading list") and have Willow track his 75 Hard reading progress. Two concerns: the structured 75 Hard schedule and the freeform reading backlog.

## Technical Notes

- 75 Hard reading schedule is fixed (see PRD) — it's a reference list, not a CRUD list
- The general reading list is fully CRUD
- Consider a `position` field for ordering the "want-to-read" list

## Dependencies

- TICKET-001 (Express backend)

## Completion Notes

Completed during TICKET-013 implementation. The original backend route family described in the ticket was missing from the actual server checkout, so the reading router and persistent store methods were added and wired into `server/index.js`.
