"""Configuration for the Atlas → Bridge publisher."""

import os

# Bridge API endpoint — override via env var
BRIDGE_FOREX_URL = os.getenv(
    "BRIDGE_FOREX_URL",
    "https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/bots/forex",
)

# Atlas paths — override via env vars if needed
ATLAS_ROOT = os.getenv(
    "ATLAS_ROOT",
    "/home/trader/atlas-trading-engine/atlas-trading-engine-new",
)
TRADES_DB = os.getenv("TRADES_DB", f"{ATLAS_ROOT}/data/trades.db")
ENV_FILE = os.getenv("ATLAS_ENV_FILE", f"{ATLAS_ROOT}/.env")
HEALTH_URL = os.getenv("ATLAS_HEALTH_URL", "http://127.0.0.1:8096/api/v1/health")

# Publishing cadence
PUBLISH_INTERVAL_SECONDS = int(os.getenv("PUBLISH_INTERVAL_SECONDS", "60"))

# Bridge API key — must match BOT_PUSH_TOKEN on Bridge server
BRIDGE_API_KEY = os.getenv("BRIDGE_API_KEY", "bridge-bot-2026")

# Status freshness threshold — no decision in this many seconds = idle
STALE_THRESHOLD_SECONDS = int(os.getenv("STALE_THRESHOLD_SECONDS", "1200"))  # 20 min

# Pip history lookback in days
PIP_HISTORY_DAYS = int(os.getenv("PIP_HISTORY_DAYS", "7"))

# Week start — Monday 00:00 UTC
WEEK_START_DAY = 0  # Monday = 0 in Python's weekday()

# AUD_USD pip size
PIP_SIZE = 0.0001

# Target pips per week (business constant)
TARGET_PIPS = 115