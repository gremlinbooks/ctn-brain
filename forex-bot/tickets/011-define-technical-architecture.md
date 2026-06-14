# TICKET-011: Define Forex Bot Technical Architecture

**Project:** Forex Bot  
**Status:** 🟢 DONE  
**Priority:** P1 (Critical)  
**Assigned:** Codex  
**Created:** 2026-05-19  
**Updated:** 2026-05-19

## Description

Replace the placeholder “Craig needs to answer basic stack questions” state with the actual Atlas Trading Engine architecture so future work can proceed from reality instead of guesswork.

## Acceptance Criteria

- [x] Platform identified
  - Atlas runs primarily on a VPS (`trader@207.148.15.61`) with local development at `~/Desktop/oakbridgelabs/tradingbot/atlas-trading-engine/`
- [x] Programming language identified
  - Python with FastAPI / `uvicorn`
- [x] Broker and API identified
  - OANDA v20 REST API, supporting `practice` and `live`
- [x] Current account balance confirmed
  - last verified live balance: `27.33 USD` on 2026-05-19
- [x] Data delivery method defined
  - SQLite (`data/trades.db`, `data/candles_cache.db`), JSONL logs (`logs/*.jsonl`), FastAPI health endpoint, replay/report artifacts
- [x] Bot management responsibility confirmed
  - Rick handles runtime / deployment
  - Craig monitors and directs strategy
- [x] Sleeve activation logic defined
  - high-level engine activation is manual via `.env` flags and branch/playbook config
- [x] Existing code location confirmed
  - `~/Desktop/oakbridgelabs/tradingbot/atlas-trading-engine/`

## Completion Notes

The architecture is now documented in:

- `forex-bot/PRD.md`
- `forex-bot/STATUS.md`

Key findings:

- this is not a simple four-sleeve bot; it is the Atlas Trading Engine with OakBridge, Harbor Shark, Harbor Apex, and Breakwater/Apex2 layers
- Atlas already has a deep backtesting / walk-forward / replay surface
- Atlas does not yet publish a normalized Bridge webhook payload
- current next work is integration and reliability, not basic architecture discovery
