# TICKET-012: Bot Data Read Endpoints

**Project:** The Bridge
**Status:** ✅ DONE
**Priority:** P1 (Critical)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19
**Completed:** 2026-05-19

## Description

Build the read endpoints for bot data so the frontend can display bot performance and status in the Bots tab and Overview tab.

## Acceptance Criteria

- [x] `GET /api/bots/forex` — returns Forex bot status and performance
- [x] `GET /api/bots/polymarket` — returns Polymarket bot status and performance
- [x] `GET /api/bots/wallethunter` — returns WalletHunter feed (latest alerts)
- [x] Data format normalized to match frontend field names
- [x] For MVP, data read from in-memory store with JSON file persistence
- [x] Endpoints use same CORS and error handling as other API routes

## Context

The Bots tab needs to show live data from the trading bots. The webhook endpoints (TICKET-007) will ingest data from Rick's bots, but we need read endpoints to serve that data to the frontend.

## Technical Notes

- Start with reading from a JSON file (e.g., `data/forex.json`, `data/polymarket.json`, `data/wallethunter.json`)
- Each endpoint should return the data structure defined in the API spec.
- Consider adding a `lastUpdated` timestamp.
- Coordinate with TICKET-007 (webhook endpoints) on the data format and file locations.

## Dependencies

- TICKET-001 (Express backend must exist first)
- TICKET-007 (Bot data webhook endpoints) — for future integration, but not required for MVP if we use manual JSON files.

## Completion Notes

Endpoints were already built (TICKET-007 included GET handlers), but three shape/URL mismatches prevented the frontend from using them:

1. **URL mismatch**: Frontend calls `GET /api/wallethunter` but server only had `/api/bots/wallethunter`. Fixed by adding an internal forward in `index.js` that rewrites the request URL and passes to botsRouter.

2. **Forex shape**: Frontend expects `pipTarget` (was `targetPips`), `pipData` (was `pipHistory`), plus `drawdown`, `stages`, `monthlyInjection` with defaults. Fixed by normalizing the GET response instead of spreading raw store data.

3. **Polymarket shape**: Frontend expects `usdcBalance` (was `balance`), `openPositions` (derived from positions array length), `chartData: [{t, v}]` (built from history snapshots). Fixed same way.

4. **WalletHunter alert shape**: Frontend expects `{time: 'HH:MM', size: '$2.5M', hot: boolean}`. Added `normalizeAlert()` and `formatSize()` helpers in bots.js to transform stored alerts on the way out.