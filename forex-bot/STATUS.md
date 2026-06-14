# Forex Bot — STATUS

**Last Updated:** 2026-05-19  
**Overall Status:** 🟡 Running, but still operationally fragile

## What's Working

- ✅ Atlas Trading Engine exists and runs as a FastAPI + `uvicorn` service.
- ✅ The engine trades `AUD_USD` on OANDA.
- ✅ Core persistence works:
  - `data/trades.db`
  - `data/candles_cache.db`
- ✅ Structured runtime telemetry exists:
  - `logs/decision.jsonl`
  - `logs/execution.jsonl`
  - `logs/snapshot.jsonl`
  - `logs/system.jsonl`
- ✅ Replay / backtesting / walk-forward tooling exists across Bot2/Bot3/Bot4/Bot5, Harbor Shark, Apex2, and Breakwater.
- ✅ The current codebase supports:
  - OakBridge base strategy
  - Harbor Shark v2/v3
  - Harbor Apex
  - Breakwater shadow/live paths
- ✅ FastAPI health and control endpoints exist and are usable for runtime inspection.
- ✅ Legacy rogue `8000` writer on the Atlas VPS was identified, stopped, and disabled.
- ✅ Canonical Atlas → Bridge forex payload mapping is now defined in `TICKET-014`.

## What's Partially Working

- 🟡 Breakwater live path exists and runs, but strategy tuning is still in flux.
- 🟡 Live execution attribution is much better than before, but requires continued validation after recent fixes.
- 🟡 Sleeve / branch analytics exist in analysis exports, but are not yet normalized for The Bridge.
- 🟡 Current balance is known operationally, but small and unstable enough that it should not be treated as a planning constant.

## What's Not Working

- ❌ Atlas does **not** currently push live data to The Bridge `POST /api/bots/forex`.
- ❌ The Bridge is still using placeholder / mock assumptions for the forex bot view.
- ❌ Atlas still does not have the publisher/adapter implementation for `POST /api/bots/forex`.
- ❌ Sleeve activation is not fully automated; it is still primarily controlled by `.env` flags and branch config files.
- ❌ Stage ladder enforcement is not implemented in code.
- ❌ Automated sleeve switching based on live health/regime is not productionized.
- ❌ There is no production-ready “single source of truth” service that converts SQLite + JSONL into dashboard-ready summaries.

## Current Operational Reality

- **Primary local repo:** `~/Desktop/oakbridgelabs/tradingbot/atlas-trading-engine/`
- **Primary VPS host:** `trader@207.148.15.61`
- **Broker:** OANDA v20
- **Language:** Python
- **API framework:** FastAPI
- **Storage:** SQLite + JSONL logs
- **Service model:** `systemd` for legacy runtime, script-launched `uvicorn` for Breakwater variants

## Current Balance

- **Last verified live account balance:** `27.33 USD`
- **Date verified:** 2026-05-19

## Data Delivery Today

Atlas currently emits data through:

1. SQLite ledgers in `data/trades.db`
2. candle cache in `data/candles_cache.db`
3. structured JSONL logs in `logs/`
4. FastAPI `/api/v1/health`
5. replay / analysis artifacts under `reports/analysis/` and `reports/learning/`

Atlas does **not yet** deliver bot performance directly to The Bridge API.

## Management / Ownership

- **Rick:** runtime and deployment handling
- **Craig:** bot monitoring and strategy direction

## What's Next

1. Build the Atlas → The Bridge forex payload adapter
2. Implement the `TICKET-014` mapping decisions in a publisher that posts to The Bridge
3. Decide which Atlas artifact is the source of truth for any future non-Bridge analytics beyond the live dashboard payload
4. Continue hardening live runtime reliability and single-writer guarantees
5. Decide whether strict Breakwater `v2` or a controlled subset of `v2.1` is the next promotion candidate

## Active Tickets

- `011-define-technical-architecture.md`
- `012-wire-live-data-to-bridge.md`
- `013-weekly-performance-summary.md`
- `014-define-atlas-to-bridge-forex-payload.md`
- `015-harden-live-runtime-and-single-writer-controls.md`
