# PRD: Forex Bot (Atlas Trading Engine / 4X Trading Box)

**Author:** Codex  
**Created:** 2026-05-19  
**Updated:** 2026-05-19  
**Status:** Active architecture handoff

## Vision

The Forex Bot is the Atlas Trading Engine: an automated AUDUSD trading system intended to run 24/5, log every decision, and compound capital through disciplined, replayable strategy execution. The immediate business goal remains `115` pips/week or better, but the engineering goal is stricter: one writer, one auditable decision path, and data good enough to drive The Bridge without guesswork.

## Problem Statement

Manual forex trading is emotional and inconsistent. Atlas exists to replace discretionary clicks with deterministic strategy execution, structured logging, backtesting, and promotion discipline. The current gap is not “how do we invent a bot” but “how do we run the existing bot coherently, expose its data to The Bridge, and stop leaking runtime confusion into live trading.”

## Goals

1. **Deterministic AUDUSD execution** on OANDA with restart-safe reconciliation.
2. **Transparent performance reporting** from Atlas internals into The Bridge.
3. **Single-writer live operation** with explicit strategy ownership and traceable trade metadata.
4. **Repeatable research pipeline** for replay, walk-forward validation, and promotion guards.
5. **Sleeve / branch visibility** so Craig can see what actually produced pips, drawdown, and risk.

## Non-Goals

- Not a generic multi-broker bot platform.
- Not a SaaS product.
- Not fully autonomous portfolio management across many pairs yet.
- Not “AI decides everything” black-box trading.

## Users

- **Craig Nowotny** — owner, reviews performance, approves live direction, monitors account behavior.
- **Rick** — runtime / deployment operator, VPS and service handling, integration coordination.
- **Willow / The Bridge** — reporting and dashboard layer.

## Product Scope

This project is **not** a simple “4 sleeves” box anymore. The actual codebase contains:

- **OakBridge base strategy** (`oakbridge_fxtrader_v2`) with EMA trend, stochastic filters, session blocking, profit floors, drawdown stops, rejoin/pullback/continuation logic, and spread gating.
- **Harbor Shark v2 / v3** research and live-shadow paths with playbooks, book search, sleeve health, and targeted entry families.
- **Harbor Apex** supervisor / de-risk layer over V3-style proposals.
- **Apex 2.0 / Breakwater** validator-touch branch architecture with replay runners, branch packs, and shadow/live decision journaling.
- **Learning pipeline** for Bot2/Bot3/Bot4/Bot5, pattern models, walk-forward tests, promotion guards, and replay comparison scripts.

The current operational focus is **Breakwater** on top of the Atlas engine, but the codebase still includes the older strategy families and research surfaces.

## Current Reality

### Platform

- **Primary runtime:** VPS
  - confirmed host used for Atlas live runtime: `trader@207.148.15.61`
  - historical repo path on VPS: `/home/trader/atlas-trading-engine/atlas-trading-engine-new`
- **Local development / research:** Craig’s machine at `~/Desktop/oakbridgelabs/tradingbot/atlas-trading-engine/`
- **Service model:** `systemd` service exists for legacy `8000` runtime; ad hoc `uvicorn` launch scripts are also used for Breakwater shadow/live variants.

### Language / Framework

- **Language:** Python
- **Runtime / API:** FastAPI + `uvicorn`
- **Persistence:** SQLite
- **Broker integration:** OANDA v20 API
- **Target Python:** Python `3.12` on Linux VPS

### Broker / API

- **Broker:** OANDA
- **API:** OANDA v20 REST
- **Environments supported:** `practice` and `live` via `.env`

### Current Account Balance

- **Last verified live account snapshot:** `27.33 USD`
- **Verification date:** 2026-05-19
- **Source:** OANDA account summary queried from the live Atlas runtime
- This should be treated as an operational snapshot, not a planning baseline. The balance is small and volatile.

### Who Manages It

- **Runtime / deployment owner:** Rick
- **Performance / direction owner:** Craig
- **Reporting consumer:** The Bridge / Willow

### Existing Code

- **Primary local repo:** `~/Desktop/oakbridgelabs/tradingbot/atlas-trading-engine/`
- **LEDGER project path:** `forex-bot/`

## Technical Architecture

### Application Layer

- `app/main.py`
  - FastAPI application startup
  - initializes SQLite
  - starts evaluator loop + snapshot loop
- `app/scheduler.py`
  - evaluator loop orchestration
  - periodic broker snapshots
  - broker-vs-ledger position reconciliation
- `app/engine/evaluator.py`
  - live strategy evaluation
  - routing between Breakwater, Harbor Shark, Apex, and base strategy paths
  - order sizing, execution, exit management, hotfix guards

### API Surface

Atlas currently exposes FastAPI endpoints including:

- `GET /api/v1/health`
  - health, loop timestamps, dry-run state, failure counters
- `POST /api/v1/execute`
  - manual order submission
- `POST /api/v1/strategy`
  - live strategy config updates
- `POST /api/v1/alert`
  - TradingView-style alert entry path
- TradingView validator routes
  - validator logging / support-resistance tooling surface

This is **not** yet wired directly to The Bridge `POST /api/bots/forex`.

### Storage Model

#### SQLite

Primary ledgers:

- `data/trades.db`
  - `trade_intents`
  - `positions`
  - `snapshots`
  - `decisions`
  - `candle_cursor`
- `data/candles_cache.db`
  - cached historical candles for replay / backtest speed

#### Structured JSONL Logs

Primary log files:

- `logs/decision.jsonl`
- `logs/execution.jsonl`
- `logs/snapshot.jsonl`
- `logs/system.jsonl`

Strategy / research-specific logs may also exist:

- `logs/breakwater_live.jsonl`
- `logs/breakwater_shadow.jsonl`
- `logs/harbor_shark_v3_shadow.jsonl`
- `logs/harbor_apex.jsonl`
- `logs/harbor_apex_derisk.jsonl`
- validator / learning logs

### Data Delivery

Atlas currently outputs performance and runtime data through **all** of these:

1. **SQLite ledgers** in `data/trades.db`
2. **Structured JSONL logs** in `logs/`
3. **FastAPI health endpoint** for runtime state
4. **Backtest / replay artifacts** in `reports/analysis/` and `reports/learning/`

What it does **not** currently do:

- no native The Bridge webhook push
- no native `POST /api/bots/forex`
- no canonical Supabase write path for production bot telemetry

## Strategy Architecture

### Base Strategy

The base OakBridge strategy is parameterized through `.env` and includes:

- EMA trend filter
- stochastic entry / exit modes
- profit floors
- trailing drawdown lock
- drawdown stop
- session blocking
- spread gating
- pullback / continuation / rejoin behavior
- M1 confirmation options
- entry block rules

### Harbor Shark

- **Harbor Shark v2**
  - live scorer / bundle path
  - targeted entry families with S/R gate
- **Harbor Shark v3**
  - playbook / sleeve-native book architecture
  - shadow/live modes
  - playbook allowlists
  - preempt-base behavior
  - sleeve attribution and health analysis

### Harbor Apex

- supervisor / arbiter over V3-style proposals
- live/shadow capability
- de-risk overlays for targeted setups

### Breakwater

- current Apex2-derived validator-touch / branch model
- branch packs defined in `config/breakwater_validator_touch_branches_*.json`
- live / shadow decision logging
- replay-style target / invalidation / timeout exits
- current configuration is still `.env`-driven, not auto-self-tuning

## Sleeve / Branch Activation

Activation is currently **manual at the high level**, not fully automatic.

Examples:

- `.env` flags choose which major engine is active:
  - `STRATEGY_ENABLED`
  - `HARBOR_SHARK_V3_LIVE_ENABLED`
  - `HARBOR_APEX_LIVE_ENABLED`
  - `BREAKWATER_LIVE_ENABLED`
- branch / playbook selection is configured by:
  - `BREAKWATER_BRANCH_CONFIG_PATH`
  - `HARBOR_SHARK_V3_PLAYBOOK_ALLOWLIST`
  - strategy parameter toggles

Within an active engine, there is internal branch/playbook selection logic, but **switching major sleeves or engines is still done manually through config and deployment choices**.

## Configuration System

Atlas is heavily `.env` driven.

- `app/config.py` currently defines roughly **171** environment-backed settings.
- This includes:
  - broker credentials
  - loop cadence
  - margin sizing
  - OakBridge parameters
  - Harbor Shark toggles
  - Harbor Apex toggles
  - Breakwater toggles
  - validator / S&R gates
  - hotfix / de-risk controls

This is a powerful but dangerous system: behavior can change materially based on env flags alone.

## Learning / Validation Pipeline

Atlas already contains a deep research surface, including:

- Bot2 / Bot3 / Bot4 / Bot5 experiments
- walk-forward validation scripts
- pattern datasets and models
- promotion guards
- backtest runners
- replay comparison scripts
- sleeve / session cubes
- capital timeline exporters
- Breakwater branch comparison and stress exports

Representative script families:

- `scripts/run_bot*_*.py`
- `scripts/train_*`
- `scripts/run_breakwater_*`
- `scripts/export_breakwater_*`
- `scripts/run_apex2_*`

This means the right next work is not “invent a backtester” but “standardize what data gets emitted to The Bridge and what is considered promotable.”

## Data Model for The Bridge

The Bridge expects:

```json
{
  "status": "running" | "idle" | "error",
  "balance": 27.33,
  "weeklyPips": 0,
  "targetPips": 115,
  "sleeves": [],
  "pipHistory": [],
  "lastUpdated": "2026-05-19T17:24:17Z"
}
```

Atlas currently has the source ingredients, but they are spread across SQLite + JSONL + analysis artifacts. A translation layer is required.

## Success Metrics

1. The Bridge shows real Atlas data, not mock sleeve numbers.
2. Live runtime has exactly one known writer.
3. Every live trade can be attributed to a specific strategy / branch / sleeve.
4. Weekly pips and sleeve metrics are derivable from Atlas data without manual reconstruction.
5. Promotion decisions come from replay + stress + runtime evidence, not ad hoc intuition.

## Next Product Work

1. Build Atlas → The Bridge payload mapper for `POST /api/bots/forex`
2. Define canonical sleeve / branch serialization from Atlas data
3. Decide which runtime artifact is the source of truth for:
   - balance
   - weekly pips
   - active sleeves
   - pip history
4. Harden live runtime so config changes cannot silently reintroduce multi-writer behavior
5. Decide whether Breakwater strict `v2` or relaxed `v2.1` is the intended promotion path after execution validation
