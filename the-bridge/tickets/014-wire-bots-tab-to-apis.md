# TICKET-014: Wire Bots Tab to Live API Data

**Project:** The Bridge
**Status:** 🟡 OPEN
**Priority:** P1 (Critical)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

The Bots tab (Forex card, Polymarket card, sleeve tables, WalletHunter feed) currently renders mock/hardcoded data when no real data is available from the API. The backend read endpoints are fully built and serving data (ticket 012), and Rick's Atlas Bridge Publisher is ready to push live forex data. The React components in the Bots tab need to be wired to fetch from the real API endpoints and display live data, with graceful fallback to empty/placeholder states when no data is available.

This is the same pattern as ticket 013 (Lifestyle tab wiring) but for the Bots tab.

## Acceptance Criteria

### Forex Card
- [ ] Fetches data from `GET /api/bots/forex` on tab load and auto-refreshes every 60 seconds
- [ ] Displays `balance` (formatted as USD with 2 decimal places)
- [ ] Displays `weeklyPips` with target of 115 (pip progress toward weekly goal)
- [ ] Displays `status` badge (running = green dot, idle = amber dot, error = red dot)
- [ ] Displays `lastUpdated` as relative time ("2 min ago", "never")
- [ ] Renders `sleeves` table with name, pips, trades, win rate, P&L
- [ ] Renders `pipData` (pipHistory) as a mini chart showing recent daily pips
- [ ] When API returns `source: "mock"`, shows a subtle "demo data" indicator; removes it when real data arrives
- [ ] When no data at all (null response), shows empty state with "No data yet — waiting for bot connection" message

### Polymarket Card
- [ ] Fetches data from `GET /api/bots/polymarket` on tab load and auto-refreshes every 60 seconds
- [ ] Displays `usdcBalance` (formatted as USD)
- [ ] Displays `winRate` as percentage
- [ ] Displays `openPositions` count
- [ ] Renders `positions` table if present
- [ ] Renders `sleeves` table with name, balance, P&L, win rate
- [ ] Renders `chartData` as a balance-over-time mini chart
- [ ] Same "demo data" indicator and empty state handling as Forex

### WalletHunter Feed
- [ ] Fetches data from `GET /api/bots/wallethunter?limit=50` on tab load
- [ ] Renders alerts with time, chain, event, token, size, and hot indicator
- [ ] Auto-refreshes every 30 seconds (whale alerts are time-sensitive)
- [ ] "Hot" alerts (bullish/bearish signal) get visual emphasis (amber highlight or fire icon)
- [ ] Empty state: "No recent whale alerts" when no data

### Bot Status Summary
- [ ] Overview tab uses `GET /api/bots/status` for the top-bar bot status dots
- [ ] Each bot shows green/amber/red dot based on `status` field
- [ ] Hovering or clicking shows last updated time

### General
- [ ] All mock/hardcoded data in the Bots tab components is replaced with API calls
- [ ] Loading states shown while API calls are in flight (skeleton or spinner)
- [ ] Error handling: if API is unreachable, show subtle error indicator, don't crash the tab
- [ ] Data refreshes when the Bots tab is activated (not just on initial page load)
- [ ] Follow the same fetch pattern as the Lifestyle tab (useEffect on mount, local state, re-fetch on interval)

## Context

The Bots tab is one of the most visible sections of The Bridge — Craig checks it to see how his trading bots are performing. The backend endpoints are complete and serving normalized data. Rick's Atlas Bridge Publisher is ready to push live forex data. This ticket makes the Bots tab display real data instead of mock placeholders.

The Lifestyle tab was successfully wired in ticket 013 using this same pattern. Follow that approach for consistency.

## Technical Notes

**Frontend location:** `the-bridge/bridge-local/src/App.jsx` (~1500 line single-file component)

**API endpoints (all live and serving data):**

| Endpoint | Method | Returns |
|----------|--------|---------|
| `GET /api/bots/forex` | GET | Forex bot status, balance, pips, sleeves, pipHistory |
| `GET /api/bots/polymarket` | GET | Polymarket bot status, balance, positions, sleeves, chartData |
| `GET /api/bots/wallethunter` | GET | Whale alerts array |
| `GET /api/bots/status` | GET | Summary of all bot statuses |

**Forex response shape (from bots.js):**
```json
{
  "status": "running" | "idle" | "error",
  "balance": 27.33,
  "weeklyPips": 0,
  "pipTarget": 115,
  "drawdown": 0,
  "stages": [],
  "monthlyInjection": 0,
  "pipData": [{ "date": "2026-05-19", "pips": 0, "trades": 1 }],
  "sleeves": [{ "name": "Breakwater", "pips": 0, "trades": 1, "winRate": 0 }],
  "pnl": null,
  "winRate": null,
  "lastTrade": null,
  "lastUpdated": "2026-05-20T02:04:21Z",
  "history": [...]
}
```
When no real data: returns mock shape with `source: "mock"`.

**Polymarket response shape:**
```json
{
  "status": "running" | "idle",
  "usdcBalance": 49.35,
  "winRate": 0.33,
  "openPositions": 1,
  "positions": [{ "market": "...", "side": "YES", "size": 5, "entry": 0.65 }],
  "chartData": [{ "t": "...", "v": 49.35 }],
  "sleeves": [{ "name": "Bulldozer", "balance": 49.35, "pnl": 19.35, "winRate": 0.33 }],
  "lastUpdated": "ISO-8601",
  "source": "mock"
}
```
When no real data: returns mock shape with `source: "mock"`.

**WalletHunter response shape:**
```json
{
  "alerts": [
    { "id": "...", "time": "14:32", "chain": "ETH", "event": "transfer", "token": "ETH", "size": "$2.5M", "hot": true }
  ],
  "subscribers": 0,
  "revenue": 0,
  "total": 2,
  "source": "mock"
}
```
When no real data: returns mock alerts with `source: "mock"`.

**Design system:** Parchment `#f4f3ef`, Surface `#fefefe`, Sage `#6b8f72` (forex success), Slate `#5a7089` (polymarket), Amber `#9a7d52` (financial, warnings). Fonts: Cormorant Garamond (display/numbers), IBM Plex Mono (data), DM Sans (body).

**Auto-refresh intervals:** Forex and Polymarket: every 60 seconds. WalletHunter: every 30 seconds (time-sensitive alerts).

**Existing bot status dots in the top bar:** The Overview tab already has bot status indicators. Wire those to `GET /api/bots/status` for real-time status.

## Dependencies

- ✅ TICKET-001 (Express backend) — DONE
- ✅ TICKET-007 (Bot data webhook endpoints) — DONE
- ✅ TICKET-012 (Bot data read endpoints) — DONE
- ✅ Atlas Bridge Publisher (Rick) — DONE
- No other blockers — this is pure frontend wiring

## Completion Notes

[Fill in when done — which components were wired, any deviations from the plan, anything the next person should know.]