---
name: "Njord (Polymarket Bot)"
description: "Multi-pattern Polymarket trading bot — automates pattern detection, sizing, and execution on prediction markets"
status: "green"
---

# Polymarket Bot (Njord) Project Document

## Basic Info
- **Name**: Njord (Polymarket Trading Bot)
- **Description**: Python trading bot that places binary bets on Polymarket crypto Up/Down markets
- **Parent Organization**: Oakbridge Labs (under Nowotny Holding Group)
- **Status**: Live and operational (as of 2026-05-11)
- **Tech Stack**: Python
- **Goal**: Generate profits through pattern-based betting on cryptocurrency price movements

## Current State (as of 2026-05-11)
Multiple bot processes running:

1. **Shadow bot (data collection only)** - PID 927700
   - Method: harborlight-shadow
   - Symbols: BTC,ETH,SOL,XRP
   - Purpose: Records all state data for backtesting new patterns
   - Capture: data/live_captures/harborlight_shadow_20260505_120343.jsonl (~3GB, growing)

2. **Live bot (main trading)** - PID 2622349
   - Method: late-plus-longbow-plus-drift
   - Symbols: BTC,ETH,SOL,XRP
   - Stake: $2-5/trade (varies by pattern)
   - Kill-switch: 8 consecutive losses, $35 session loss limit
   - Deploy script: deploy/run_late_longbow_drift_production.sh
   - Balance: ~$42 CLOB collateral (from recent log)
   - Session P&L: Shows multiple profitable trades in recent logs

3. **Live bot (experimental)** - PID 2811683
   - Method: last-minute-longshot
   - Symbols: BTC,ETH
   - Stake: $1/trade
   - Kill-switch: 40 consecutive losses, $20 session loss limit
   - Capture: data/live_captures/last_minute_longshot_20260510_213715.jsonl

## Pattern Details

### late_entry_leader (primary)
- Fires at t=240s (4 minutes into a 5m window, 60s before close)
- Requires |spot - window_open| >= threshold (BTC=$35, ETH=$1.60, SOL=$0.10)
- Bets the leader (direction price has already moved)
- Recent params: --late-max-entry-price 0.80 (to avoid negative-EV trades at high ask prices)

### longbow
- Fires at t=120s (2 minutes in)
- Requires momentum: |bps from open| >= min_abs_bps AND same-direction move from t=lookback to t=120s
- Current params: BTC/SOL min 4bps, ETH/XRP disabled in live bot

### early_drift (ACTIVE)
- Fires at t=30s into the window
- Requires t=15s and t=30s to both point the same direction (confirmation)
- Dollar move minimum: BTC=$20, ETH=$999 (effectively disabled), XRP=$0
- Velocity filter: 0.10–0.50 bps/sec (steady drift, not a spike)
- Ask range: 0.60–0.80 only
- Skips 12–16 UTC (US market open kills edge)
- Backtest WR: 78%, EV +$0.20/trade at $2 stake

### last-minute-longshot (experimental live)
- Fires at t=245-275s into the window
- Buys cheap side (underdog) when ask 0.05-0.15
- BTC and ETH only
- High consecutive-loss tolerance (40+) and session loss limit ($20+) needed for this strategy

## Market Structure
- 5m markets: slug format `btc-updown-5m-{epoch}` where epoch = window start unix timestamp
- 15m markets: built but not yet live (validation in progress)
- 1h markets: built in discovery, not deployed
- Uses direct slug lookup in market_discovery.py (critical for performance with 8000+ markets)

## Key Gotchas
- FAK rejections are silent — a FILL FAILED warning means no position was taken (not a loss)
- Min notional $1.00 — bot handles stakes < ask price
- Kill-switch resets on restart — consecutive loss counter is session-only
- Shadow bot must keep running — it's the data collection engine
- First window after restart is skipped if bot starts mid-window with bad seed
- 15m thresholds are estimates — needs calibration

## Monitoring Commands
- Check running: `pgrep -af 'njord.live.runner'`
- Tail live log: `tail -f $(ls -t data/live_captures/late_longbow_drift_restart_*.log | head -1)`
- Check recent trades: `grep 'SETTLE\|FILL' $(ls -t data/live_captures/late_longbow_drift_restart_*.log | head -1) | tail -20`
- Check CLOB balance: `grep 'preflight\|CLOB collateral' $(ls -t data/live_captures/late_longbow_drift_restart_*.log | head -1) | tail -5`

## Recent Performance (from logs)
- Shows regular FILL events and STATE updates
- Multiple patterns active simultaneously
- Bot appears operational and making trades

## Roadmap
1. Enhance existing patterns with improved parameters
2. Deploy and validate 15m markets
3. Develop and test 1h markets
4. Optimize execution and reduce latency
5. Expand to additional cryptocurrencies/symbols
6. Implement advanced risk management
7. Add machine learning components for pattern discovery
8. Create dashboard for real-time monitoring
9. Improve logging and analytics
10. Consider expansion to other prediction markets

## Development Plan to Complete (Focus: 15m Market Deployment)
### Delta Analysis
- **Current State**: 15m markets built but not yet live (validation in progress)
- **Target State**: 15m markets live and generating profits
- **Gap**: Validation, parameter calibration, deployment

### Next Steps
1. Complete validation of 15m market structure
2. Calibrate thresholds for 15m patterns (needs calibration per documentation)
3. Adapt existing patterns (late_entry_leader, longbow, early_drift) for 15m timeframe
4. Test 15m patterns using shadow bot data
5. Deploy 15m trading bot alongside existing 5m bot
6. Monitor performance and adjust parameters
7. Consider 1h market development after 15m stabilization

### Blockers
- Need to complete validation of 15m markets
- Need to calibrate thresholds for 15m patterns (explicitly mentioned as needing calibration)
- Need to adapt pattern timing logic for 15m windows
- Potential need for additional data collection for 15m backtesting

## Additional Notes
- The bot is currently operational and profitable
- Shadow bot provides valuable data for backtesting new patterns
- Multiple patterns running simultaneously provides diversification
- Good foundation exists for expansion to other timeframes and markets