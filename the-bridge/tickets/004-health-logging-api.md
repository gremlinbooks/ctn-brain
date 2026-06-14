# TICKET-004: Health Logging API

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P2 (High)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Build the health logging endpoints so Willow can log peptides taken, workouts completed, meals eaten, water intake, weight, and reading progress via API during check-ins.

## Acceptance Criteria

- [ ] `GET /api/health/status` — returns today's health status (all categories)
- [ ] `POST /api/health/log` — log a health event (type-based)
- [ ] Supports all event types: peptide, workout, meal, water, weight, reading, photo
- [ ] Data persisted to server-side storage
- [ ] Frontend health sections fetch from API instead of mock data
- [ ] 75 Hard daily completion percentage calculated from logged events

## Context

Willow's check-ins will log this data in real-time. Craig says "took BPC-157 and Semax this morning" → Willow calls the API → The Bridge updates.

## Technical Notes

- Each log entry: `{ type, name?, value?, timestamp, source: "willow"|"manual" }`
- Aggregate endpoint calculates daily completion for 75 Hard (7 tasks), peptide phases, protein totals
- Consider a `GET /api/health/history?date=YYYY-MM-DD` for historical lookback

## Dependencies

- TICKET-001 (Express backend)


## Completion Notes

- Implemented the endpoints as per the specification.
- Data is persisted to a JSON file in the data directory.
- The endpoints are integrated into the Express server.
- All validation and error handling are in place.
- No deviations from the plan.
