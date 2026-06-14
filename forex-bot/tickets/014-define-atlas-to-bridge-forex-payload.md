# TICKET-014: Define Atlas → The Bridge Forex Payload Mapping

**Project:** Forex Bot  
**Status:** 🟢 DONE  
**Priority:** P1 (Critical)  
**Assigned:** Codex  
**Created:** 2026-05-19  
**Updated:** 2026-05-19

## Description

Define the exact mapping from Atlas outputs to The Bridge forex schema so implementation work is not inventing field semantics ad hoc.

Bridge target schema:

```json
{
  "status": "running" | "idle" | "error",
  "balance": number,
  "weeklyPips": number,
  "targetPips": 115,
  "sleeves": [
    {
      "name": "string",
      "status": "running" | "idle",
      "trades": number,
      "winRate": number,
      "avgPips": number,
      "pnl": number
    }
  ],
  "pipHistory": [
    { "date": "YYYY-MM-DD", "pips": number }
  ],
  "lastUpdated": "ISO-8601"
}
```

Atlas source data is fragmented across SQLite, JSONL, and runtime config. This ticket defines which source owns each Bridge field and the exact query/calculation Rick should use.

## Acceptance Criteria

- [x] `status` source is defined
- [x] `balance` source is defined
- [x] `weeklyPips` calculation is defined
- [x] `sleeves` schema is defined for Atlas concepts
- [x] `pipHistory` source and aggregation window are defined
- [x] `lastUpdated` source is defined
- [x] Mapping notes documented in LEDGER so implementation can be delegated

## Canonical Mapping

### Global Rule

The Bridge forex payload should be built from **Atlas live runtime artifacts only**:

- runtime health from `GET /api/v1/health`
- live account balance from SQLite `snapshots`
- realized live-trade performance from SQLite `trade_intents`
- current ownership / active strategy from `positions.metadata_json`
- engine enablement from `app/config.py`

Do **not** use replay artifacts, weekly analysis exports, or report CSVs for Bridge live metrics.

### 1. `status`

**Pick:** `/api/v1/health`

**Why:** It is the only purpose-built, structured runtime health surface in Atlas. It already exposes evaluator freshness, snapshot freshness, halt state, failure counts, and degraded snapshot state. Log scraping is less stable, and publisher freshness is a downstream transport concern, not Atlas runtime truth.

**Atlas fields used**

- `status`
- `last_evaluator_run`
- `last_snapshot_run`
- `halted`
- `evaluator_failures`
- `snapshot_failures`
- `snapshot_degraded`

**Bridge mapping**

- `running`
  - `/api/v1/health` responds successfully
  - `halted == false`
  - `snapshot_degraded == false`
  - evaluator is fresh
  - snapshot loop is fresh
  - at least one live engine flag is enabled
- `idle`
  - `/api/v1/health` responds successfully
  - freshness checks pass
  - but no live engine flag is enabled
- `error`
  - health endpoint fails
  - or `halted == true`
  - or `snapshot_degraded == true`
  - or evaluator/snapshot loop is stale

**Freshness thresholds**

- evaluator fresh if `now_utc - last_evaluator_run <= 2 * CANDLE_POLL_SECONDS`
- snapshot fresh if `now_utc - last_snapshot_run <= 2 * SNAPSHOT_SECONDS`

**Live engine flags**

- `STRATEGY_ENABLED`
- `HARBOR_SHARK_V2_ENABLED && HARBOR_SHARK_V2_MODE=live`
- `HARBOR_SHARK_V3_LIVE_ENABLED`
- `HARBOR_APEX_LIVE_ENABLED`
- `BREAKWATER_LIVE_ENABLED`

### 2. `balance`

**Pick:** latest row from SQLite `snapshots`

**Exact source**

- DB: `data/trades.db`
- table: `snapshots`
- field: `balance`

**Exact query**

```sql
SELECT balance
FROM snapshots
ORDER BY id DESC
LIMIT 1;
```

**Why not direct OANDA read at publish time:** Atlas already performs the OANDA account summary call inside `Scheduler.snapshot_once()` and persists the result. Re-reading OANDA in the publisher would duplicate broker I/O, add another failure path, and risk disagreement with Atlas’ own persisted state.

### 3. `sleeves`

**Pick:** normalize sleeves to **top-level live engines**, not raw Breakwater branches and not raw Harbor Shark playbooks.

**Canonical sleeve roster**

- `OakBridge Base`
- `Harbor Shark v2`
- `Harbor Shark v3`
- `Harbor Apex`
- `Breakwater`

**Why:** The Bridge schema expects a small stable list. Breakwater branches and Harbor Shark playbooks are sub-attribution details that vary over time. Atlas high-level activation is manual at the engine level, so Bridge should show stable engine rows and roll playbook/branch attribution into them.

**Not separate sleeves**

- Harbor Apex de-risk is not a separate sleeve
- Breakwater branch names are not sleeve identities
- Harbor Shark playbook names are not sleeve identities

**Source fields**

- `trade_intents.requested_json.metadata.strategy`
- `trade_intents.requested_json.metadata.playbook_name`
- `trade_intents.requested_json.metadata.branch_name`
- `positions.metadata_json.strategy`
- config flags from `app/config.py`

**Normalization rule**

```text
strategy == 'breakwater'            -> Breakwater
strategy == 'harbor_apex'           -> Harbor Apex
strategy == 'harbor_shark_v3'       -> Harbor Shark v3
strategy == 'harbor_shark_v2'       -> Harbor Shark v2
strategy == 'oakbridge_fxtrader_v2' -> OakBridge Base
strategy == '' with base-strategy-style metadata -> OakBridge Base
otherwise -> Legacy / Unknown
```

The empty-string fallback is required because older base-strategy trades predate consistent `metadata.strategy` serialization. Those rows still contain base-strategy-only metadata such as `fast_ema`, `slow_ema`, and `entry_diag`.

**Sleeve object schema**

```json
{
  "name": "Breakwater | Harbor Apex | Harbor Shark v3 | Harbor Shark v2 | OakBridge Base",
  "status": "running | idle",
  "trades": 0,
  "winRate": 0,
  "avgPips": 0,
  "pnl": 0
}
```

**Field definitions**

- `name`
  - normalized engine label above
- `status`
  - `running` if the engine’s live flag is enabled, or the current open position in `positions.metadata_json.strategy` resolves to that engine
  - `idle` otherwise
- `trades`
  - count of closed live trades in the current ISO week attributed to that sleeve
- `winRate`
  - percentage of closed live trades in the current ISO week where realized pips `> 0`
- `avgPips`
  - average realized pips per closed live trade in the current ISO week
- `pnl`
  - sum of realized pips in the current ISO week

`pnl` is defined in **pips**, not dollars, so all sleeve metrics stay unit-consistent with `weeklyPips` and `avgPips`.

### 4. `weeklyPips`

**Pick:** realized pips from closed live trades derived from `trade_intents`

**Do not use**

- `decisions` table
- replay artifacts
- unrealized/open-position estimates

`decisions` records evaluation activity, not realized close-out performance.

**Time window**

- current ISO week in UTC
- Monday `00:00:00Z` inclusive
- next Monday `00:00:00Z` exclusive

This matches The Bridge’s weekly target framing and its 7-day Mon-Sun chart labels.

**Trade-pairing logic**

1. Entry rows:
   - `trade_intents.side IN ('LONG','SHORT')`
   - `trade_intents.status = 'SUBMITTED'`
   - entry trade id = `trade_intents.oanda_trade_id`
   - entry price = `json_extract(response_json, '$.orderFillTransaction.price')`
2. Exit rows:
   - `trade_intents.status = 'SUBMITTED'`
   - explode `json_each(response_json, '$.orderFillTransaction.tradesClosed')`
   - closed trade id = `json_extract(json_each.value, '$.tradeID')`
   - exit price = `json_extract(json_each.value, '$.price')`
3. Join exit rows back to entry rows by OANDA trade id
4. Compute realized pips:
   - LONG: `(exit_price - entry_price) / 0.0001`
   - SHORT: `(entry_price - exit_price) / 0.0001`
5. Sum only rows whose `exit_ts` falls in the current ISO week

**Reference SQL shape**

```sql
WITH entry_fills AS (
  SELECT
    created_at AS entry_ts,
    oanda_trade_id AS trade_id,
    side,
    CAST(json_extract(response_json, '$.orderFillTransaction.price') AS REAL) AS entry_price
  FROM trade_intents
  WHERE side IN ('LONG', 'SHORT')
    AND status = 'SUBMITTED'
    AND COALESCE(oanda_trade_id, '') <> ''
),
exit_fills AS (
  SELECT
    t.created_at AS exit_ts,
    json_extract(j.value, '$.tradeID') AS trade_id,
    CAST(json_extract(j.value, '$.price') AS REAL) AS exit_price
  FROM trade_intents t,
       json_each(t.response_json, '$.orderFillTransaction.tradesClosed') j
  WHERE t.status = 'SUBMITTED'
),
closed_trades AS (
  SELECT
    x.exit_ts,
    CASE
      WHEN e.side = 'LONG' THEN (x.exit_price - e.entry_price) / 0.0001
      WHEN e.side = 'SHORT' THEN (e.entry_price - x.exit_price) / 0.0001
    END AS pips
  FROM entry_fills e
  JOIN exit_fills x ON x.trade_id = e.trade_id
)
SELECT ROUND(COALESCE(SUM(pips), 0), 1) AS weekly_pips
FROM closed_trades
WHERE exit_ts >= :week_start_utc
  AND exit_ts < :next_week_start_utc;
```

### 5. `pipHistory`

**Pick:** the same closed-trade pairing logic as `weeklyPips`, aggregated daily

**Window**

- exactly 7 points
- current ISO week in UTC
- Monday through Sunday

**Aggregation**

- group realized pips by `DATE(exit_ts)` in UTC
- fill missing days with `0`
- always emit all 7 days in week order

**Shape**

```json
[
  { "date": "2026-05-19", "pips": 0.0 }
]
```

**Reference SQL shape**

```sql
WITH entry_fills AS (...),
exit_fills AS (...),
closed_trades AS (...)
SELECT
  substr(exit_ts, 1, 10) AS date,
  ROUND(SUM(pips), 1) AS pips
FROM closed_trades
WHERE exit_ts >= :week_start_utc
  AND exit_ts < :next_week_start_utc
GROUP BY substr(exit_ts, 1, 10)
ORDER BY date;
```

The publisher should post-process the SQL result into a fixed Monday-Sunday 7-row array so the Bridge chart never changes length.

### 6. `lastUpdated`

**Pick:** timestamp of the publish action

**Why:** The Bridge needs to know when its forex snapshot was last refreshed, not just when the last underlying trade or snapshot happened. Publish time is the correct freshness signal for a webhook-fed dashboard.

**Implementation detail**

- generate at publish time in UTC ISO-8601
- send it to the Bridge webhook as `timestamp`

The current Bridge ingest path stores `data.timestamp` and exposes that later as `lastUpdated` on `GET /api/bots/forex`.

Example:

```json
{
  "timestamp": "2026-05-19T17:24:17Z"
}
```

## Canonical Helper Dataset

Rick should build one shared internal closed-trade dataset and reuse it for:

- `weeklyPips`
- `pipHistory`
- sleeve `trades`
- sleeve `winRate`
- sleeve `avgPips`
- sleeve `pnl`

That helper should pair `trade_intents` entries and exits by OANDA trade id exactly once.

## Dependencies

- `011-define-technical-architecture.md`

## Completion Notes

- Defined the canonical Atlas source for every Bridge forex payload field.
- Standardized `status` on `/api/v1/health`, `balance` on latest SQLite snapshot, and performance metrics on realized closed trades from `trade_intents`.
- Chose current ISO week in UTC as the common window for `weeklyPips`, `pipHistory`, and sleeve performance.
- Defined sleeves as normalized top-level live engines rather than volatile playbook/branch names.
- Documented the exact trade-pairing logic Rick can implement in the Bridge publisher.
- Clarified the Bridge server behavior: publisher should send publish time as `timestamp`, which The Bridge later exposes as `lastUpdated`.
