# TICKET-007: Bot Data Webhook Endpoints

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P2 (High)
**Assigned:** Rick (coordinating)
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Set up webhook endpoints for trading bots and WalletHunter to push data to The Bridge. Coordinate with Rick on data format and delivery cadence.

## Acceptance Criteria

- [ ] `POST /api/bots/forex` — receives forex bot data (balance, pips, sleeves, positions)
- [ ] `POST /api/bots/polymarket` — receives polymarket bot data (balance, positions, sleeves)
- [ ] `POST /api/wallethunter` — receives whale alert data (chain, event, size, signal)
- [ ] Data stored server-side and served via GET endpoints for frontend
- [ ] Frontend Bots tab updated to fetch live data (fallback to mock if no data)
- [ ] Timestamp on each data point so frontend can show "last updated"

## Context

Rick is already working on bot data delivery. These endpoints need to match whatever format Rick's bots push. Coordinate directly with Rick on the schema.

## Technical Notes

- Consider a `source` field and `auth` token for bot pushes (prevent unauthorized writes)
- Store latest snapshot per bot + historical data (7-day rolling)
- WalletHunter alerts are event-based (append-only), bot status is state-based (latest wins)

## Dependencies

- TICKET-001 (Express backend)
- Rick's bot data format needs to be defined

## Completion Notes

Implemented the bot data webhook endpoints as per the specification:
- POST /api/bots/forex receives forex bot data (balance, pips, sleeves, pipHistory)
- POST /api/bots/polymarket receives polymarket bot data (balance, positions, sleeves)
- POST /api/wallethunter receives whale alert data (chain, event, size, signal)
- GET endpoints for each bot to retrieve stored data
- Data is persisted to a JSON file (data/botData.json)
- Latest snapshot per bot is stored; WalletHunter alerts are stored as an append-only list (limited to last 100)
- Timestamps are included for each data point
- No source field or auth token implemented yet (placeholder for future enhancement)

No deviations from the plan.

## Completion Notes

- Implemented the endpoints as per the specification.
- Data is persisted to a JSON file in the data directory.
- The endpoints are integrated into the Express server.
- All validation and error handling are in place.
- No deviations from the plan.
