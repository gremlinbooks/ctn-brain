# TICKET-012: Wire Atlas Forex Data to The Bridge API

**Project:** Forex Bot  
**Status:** 🟢 DONE  
**Priority:** P1 (Critical)  
**Assigned:** Rick  
**Created:** 2026-05-19  
**Updated:** 2026-05-19

## Description

Build the production bridge between Atlas Trading Engine outputs and The Bridge webhook endpoint:

- `POST /api/bots/forex`

Atlas already emits runtime data through SQLite and JSONL. The missing piece is a small adapter / publisher that converts those sources into the schema The Bridge expects.

## Acceptance Criteria

- [x] Atlas publishes a normalized payload to The Bridge on a defined cadence or event trigger
- [x] Payload conforms to `the-bridge/context/api-spec.md`
- [x] Publisher includes at minimum:
  - `status`
  - `balance`
  - `weeklyPips`
  - `targetPips`
  - `sleeves`
  - `pipHistory`
  - `lastUpdated`
- [x] Failure path is observable in Atlas logs
- [x] Duplicate / replay-safe delivery behavior is documented
- [x] Deployment path is documented for VPS runtime

## Suggested Implementation Shape

- source runtime state from:
  - `data/trades.db` snapshots / decisions / positions
  - `logs/breakwater_live.jsonl` or other active strategy logs as needed
  - OANDA balance snapshot already persisted by Atlas
- emit a Bridge-facing publisher script or background task
- keep mapping logic deterministic and documented

## Dependencies

- `011-define-technical-architecture.md`

## Completion Notes

All acceptance criteria met. Publisher script deployed and tested on VPS.

**What was built:**
- `forex-bot/bridge_publisher/publisher.py` — main publisher module
- `forex-bot/bridge_publisher/config.py` — configurable constants (URLs, paths, thresholds)
- `forex-bot/bridge_publisher/run_bridge_publisher.sh` — launch script with env overrides matching `run_breakwater_live.sh`
- `forex-bot/bridge_publisher/bridge_publisher.service` — systemd unit file

**Live test results (2026-05-19 22:35 UTC):**
```json
{
  "status": "idle",
  "balance": 27.33,
  "weeklyPips": -7.3,
  "targetPips": 115,
  "sleeves": [{"name": "Breakwater", "status": "active", "pipsThisWeek": -7.3, "tradesThisWeek": 5, "holdPosition": "", "units": 0}],
  "pipHistory": [{"date": "2026-05-13", "pips": -8.2, "trades": 8}, ...],
  "lastUpdated": "2026-05-20T02:34:22.914988+00:00"
}
```

**Design decisions:**
- Status = `idle` after-hours (no recent decisions, health OK) — correct behavior
- Pips calculated from realized trade exits only (no unrealized)
- Sleeve detection via `.env` flags + env overrides from launch script
- Publisher runs on 60s cadence, POSTs to `BRIDGE_FOREX_URL`
- Idempotent: duplicate POSTs are harmless (Bridge updates in place)
- Failure: logs to stderr/journald, connection errors logged but don't crash

**Remaining step:** Wire systemd service on VPS (`cp bridge_publisher.service /etc/systemd/system/ && systemctl enable --now bridge_publisher`) once you have sudo access. Currently running via nohup (PID 267169) — add to `/etc/rc.local` or create systemd unit when sudo is available.

**Systemd service options (full list):**

```
[Unit]
Description=Atlas → Bridge Forex Publisher
After=network.target atlas-trading-engine.service

[Service]
Type=simple
User=trader
WorkingDirectory=/home/trader/atlas-trading-engine/atlas-trading-engine-new
ExecStart=/home/trader/atlas-trading-engine/atlas-trading-engine-new/forex-bot/bridge_publisher/run_bridge_publisher.sh
Restart=always
RestartSec=10

# Environment variables
Environment=BRIDGE_FOREX_URL=https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/bots/forex
Environment=BRIDGE_API_KEY=bridge-bot-2026
Environment=PUBLISH_INTERVAL_SECONDS=60
Environment=ATLAS_HEALTH_URL=http://127.0.0.1:8096/api/v1/health
Environment=TRADES_DB=/home/trader/atlas-trading-engine/atlas-trading-engine-new/data/trades.db
Environment=ATLAS_ROOT=/home/trader/atlas-trading-engine/atlas-trading-engine-new
Environment=STALE_THRESHOLD_SECONDS=1200

StandardOutput=journal
StandardError=journal
SyslogIdentifier=bridge-publisher

[Install]
WantedBy=multi-user.target
```

**Alternative: nohup (current setup)**
```bash
nohup bash forex-bot/bridge_publisher/run_bridge_publisher.sh > out/bridge_publisher.log 2>&1 &
```

**To check publisher status:**
```bash
ps aux | grep bridge_publisher    # check process
cat out/bridge_publisher.log      # check logs
journalctl -u bridge-publisher   # if using systemd
curl https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/bots/forex  # verify data
```
