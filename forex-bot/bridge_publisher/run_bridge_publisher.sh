#!/usr/bin/env bash
# run_bridge_publisher.sh — Start the Atlas → Bridge forex publisher
#
# This script sets env overrides matching the live Breakwater launch config
# and starts the publisher on a 60-second cadence.
#
# Usage:
#   ./run_bridge_publisher.sh           # run forever
#   ./run_bridge_publisher.sh --once    # single publish and exit
#
# For systemd, see bridge_publisher.service

set -euo pipefail

ATLAS_ROOT="/home/trader/atlas-trading-engine/atlas-trading-engine-new"
cd "$ATLAS_ROOT"

# Atlas environment overrides (must match run_breakwater_live.sh)
export DRY_RUN=false
export SYMBOLS=AUD_USD
export TIMEFRAME=M15
export STRATEGY_ENABLED=false
export HARBOR_SHARK_V3_LIVE_ENABLED=false
export HARBOR_APEX_LIVE_ENABLED=false
export BREAKWATER_LIVE_ENABLED=true

# Bridge publisher config
export ATLAS_ROOT="$ATLAS_ROOT"
export TRADES_DB="$ATLAS_ROOT/data/trades.db"
export ATLAS_HEALTH_URL="http://127.0.0.1:8096/api/v1/health"
export BRIDGE_FOREX_URL="${BRIDGE_FOREX_URL:-https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/bots/forex}"
export BRIDGE_API_KEY="${BRIDGE_API_KEY:-bridge-bot-2026}"
export PUBLISH_INTERVAL_SECONDS="${PUBLISH_INTERVAL_SECONDS:-60}"
export STALE_THRESHOLD_SECONDS="${STALE_THRESHOLD_SECONDS:-1200}"

# Python binary — use the Atlas venv
PYTHON_BIN="$ATLAS_ROOT/.venv/bin/python"
if [[ ! -x "$PYTHON_BIN" ]]; then
    echo "ERROR: Python venv not found at $PYTHON_BIN"
    exit 1
fi

# Add forex-bot to Python path so bridge_publisher module is found
export PYTHONPATH="$ATLAS_ROOT/forex-bot${PYTHONPATH:+:$PYTHONPATH}"

echo "[$(date -Iseconds)] Bridge publisher starting..."
echo "  Atlas Root:  $ATLAS_ROOT"
echo "  Bridge URL:  $BRIDGE_FOREX_URL"
echo "  Trades DB:   $TRADES_DB"
echo "  Health URL:   $ATLAS_HEALTH_URL"
echo "  API Key:     ${BRIDGE_API_KEY:0:8}..."
echo "  Interval:    ${PUBLISH_INTERVAL_SECONDS}s"

exec "$PYTHON_BIN" -m bridge_publisher "$@"