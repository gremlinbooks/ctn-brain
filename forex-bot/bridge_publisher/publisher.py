"""Atlas → Bridge Forex payload publisher.

Reads Atlas Trading Engine state from SQLite and the health endpoint,
builds the normalized Bridge payload per Ticket 014 mapping,
and POSTs it to The Bridge API on a configurable cadence.

Usage:
    python -m bridge_publisher          # run forever
    python -m bridge_publisher --once   # single publish and exit
"""

import json
import logging
import os
import sqlite3
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

from .config import (
    ATLAS_ROOT,
    BRIDGE_API_KEY,
    BRIDGE_FOREX_URL,
    ENV_FILE,
    HEALTH_URL,
    PIP_HISTORY_DAYS,
    PIP_SIZE,
    PUBLISH_INTERVAL_SECONDS,
    STALE_THRESHOLD_SECONDS,
    TARGET_PIPS,
    TRADES_DB,
    WEEK_START_DAY,
)

logger = logging.getLogger("bridge_publisher")

# ---------------------------------------------------------------------------
# Sleeve engine mapping: .env flag → canonical Bridge sleeve name
# ---------------------------------------------------------------------------
SLEEVE_FLAGS = {
    "STRATEGY_ENABLED": "OakBridge",
    "HARBOR_SHARK_V3_LIVE_ENABLED": "HarborShark",
    "HARBOR_APEX_LIVE_ENABLED": "HarborApex",
    "BREAKWATER_LIVE_ENABLED": "Breakwater",
}

# Launch script overrides can flip flags; we detect actual running state
# by checking recent decisions + positions, not just .env.


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _week_start_utc() -> datetime:
    """Return Monday 00:00 UTC of the current trading week."""
    now = _utc_now()
    days_since_monday = now.weekday()  # Monday=0
    monday = now - timedelta(days=days_since_monday)
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


# ---------------------------------------------------------------------------
# Health / Status
# ---------------------------------------------------------------------------

def get_status() -> str:
    """Derive bot status from evaluator freshness + health endpoint.

    - recent decision (< STALE_THRESHOLD_SECONDS) + health 200 → "running"
    - health 200 but stale decisions → "idle"
    - health endpoint down → "error"
    """
    # 1. Check health endpoint
    try:
        resp = requests.get(HEALTH_URL, timeout=5)
        health_ok = resp.status_code == 200
    except Exception:
        # Health endpoint unreachable → error
        return "error"

    if not health_ok:
        return "error"

    # 2. Check decision freshness
    try:
        conn = sqlite3.connect(TRADES_DB)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT MAX(ts) as latest FROM decisions WHERE symbol = 'AUD_USD'")
        row = cur.fetchone()
        conn.close()

        if row and row["latest"]:
            latest_ts = datetime.fromisoformat(row["latest"])
            if latest_ts.tzinfo is None:
                latest_ts = latest_ts.replace(tzinfo=timezone.utc)
            age_seconds = (_utc_now() - latest_ts).total_seconds()
            if age_seconds < STALE_THRESHOLD_SECONDS:
                return "running"

        return "idle"
    except Exception as e:
        logger.warning(f"Could not check decision freshness: {e}")
        return "idle"


# ---------------------------------------------------------------------------
# Balance
# ---------------------------------------------------------------------------

def get_balance() -> tuple[float, str]:
    """Return (balance, lastUpdated_iso) from the latest snapshot."""
    conn = sqlite3.connect(TRADES_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT balance, ts FROM snapshots ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    conn.close()

    if row:
        return row["balance"], row["ts"]
    return 0.0, _utc_now().isoformat()


# ---------------------------------------------------------------------------
# Weekly Pips
# ---------------------------------------------------------------------------

def get_weekly_pips() -> float:
    """Calculate realized pips from closed trades in the current trading week.

    Parses trade_intents EXIT fills for realizedPL and converts to pips.
    Falls back to entry/exit price delta if realizedPL is not available.
    """
    week_start = _week_start_utc().isoformat()
    conn = sqlite3.connect(TRADES_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get EXIT intents this week with their fill data
    cur.execute(
        """
        SELECT id, created_at, requested_json, response_json
        FROM trade_intents
        WHERE side = 'EXIT'
          AND status = 'SUBMITTED'
          AND created_at >= ?
        ORDER BY created_at ASC
        """,
        (week_start,),
    )
    exit_rows = cur.fetchall()

    total_pips = 0.0
    for row in exit_rows:
        pips = _pips_from_exit(cur, row, conn)
        total_pips += pips

    conn.close()
    return round(total_pips, 1)


def _pips_from_exit(cur, exit_row, conn) -> float:
    """Extract pips from a single EXIT trade intent.

    Strategy:
    1. Try parsing realizedPL from response_json.orderFillTransaction.tradesClosed
    2. Convert to pips using (realizedPL / units / pipSize)
    3. Fall back to entry-vs-exit price delta if realizedPL unavailable
    """
    try:
        resp = json.loads(exit_row["response_json"])
        fill = resp.get("orderFillTransaction", {})

        # Get the original entry intent to find entry price and side
        entry_price, entry_side, units = _find_entry_for_exit(cur, exit_row, conn)

        # Try realizedPL from tradesClosed
        trades_closed = fill.get("tradesClosed", [])
        if trades_closed:
            realized_pl = float(trades_closed[0].get("realizedPL", 0))
            if units and units > 0 and entry_price and entry_price > 0:
                # pips = realizedPL / (units * pipSize) — for AUD_USD pipSize=0.0001
                pip_value = units * PIP_SIZE
                if pip_value > 0:
                    pips = realized_pl / pip_value
                    return pips

        # Fallback: use entry/exit price delta
        exit_price = float(fill.get("price", 0))
        if entry_price and exit_price and entry_side and units:
            if entry_side == "LONG":
                pips = (exit_price - entry_price) / PIP_SIZE
            else:
                pips = (entry_price - exit_price) / PIP_SIZE
            return pips

    except Exception as e:
        logger.warning(f"Failed to parse pips from exit {exit_row['id']}: {e}")

    return 0.0


def _find_entry_for_exit(cur, exit_row, conn) -> tuple:
    """Find the entry intent that this EXIT closes.

    Returns (entry_price, entry_side, units) or (None, None, None).
    """
    try:
        req = json.loads(exit_row["requested_json"])
        # EXIT signals include the candle_ts which we can use to find the preceding entry
        candle_ts = req.get("candle_ts", "")

        # Look for the most recent LONG/SHORT intent before this EXIT
        cur.execute(
            """
            SELECT id, side, requested_json, response_json
            FROM trade_intents
            WHERE side IN ('LONG', 'SHORT')
              AND status = 'SUBMITTED'
              AND created_at < ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (exit_row["created_at"],),
        )
        entry_row = cur.fetchone()
        if entry_row:
            entry_resp = json.loads(entry_row["response_json"])
            entry_fill = entry_resp.get("orderFillTransaction", {})
            entry_price = float(entry_fill.get("price", 0))
            entry_side = entry_row["side"]
            # Get units from the entry fill
            trade_opened = entry_fill.get("tradeOpened", {})
            units = float(trade_opened.get("units", entry_fill.get("units", 0)))
            if units == 0:
                units = abs(float(entry_fill.get("units", 0)))
            return entry_price, entry_side, abs(units)
    except Exception as e:
        logger.warning(f"Could not find entry for exit {exit_row['id']}: {e}")

    return None, None, None


# ---------------------------------------------------------------------------
# Sleeves
# ---------------------------------------------------------------------------

def get_sleeves() -> list[dict]:
    """Determine active sleeves from .env flags + recent decisions + positions."""
    env_flags = _parse_env_flags()
    conn = sqlite3.connect(TRADES_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    sleeves = []
    cutoff = (_utc_now() - timedelta(hours=24)).isoformat()

    for flag, sleeve_name in SLEEVE_FLAGS.items():
        # Check if engine is enabled (from .env or launch script)
        is_enabled = env_flags.get(flag, "false").lower() == "true"

        # Check for recent decisions from this engine
        # (In v1, all decisions route through whichever engine is active)
        cur.execute(
            "SELECT COUNT(*) as cnt FROM decisions WHERE ts >= ?",
            (cutoff,),
        )
        decision_row = cur.fetchone()
        decision_count = decision_row["cnt"] if decision_row else 0

        # Check for held position
        cur.execute("SELECT side, units FROM positions WHERE symbol = 'AUD_USD' LIMIT 1")
        pos_row = cur.fetchone()
        hold_position = None
        units = 0

        if is_enabled:
            # Determine status based on activity
            if pos_row:
                hold_position = pos_row["side"]
                units = pos_row["units"]
                status = "active"
            elif decision_count > 0:
                status = "active"
            else:
                status = "idle"

            # Get weekly pip contribution for this sleeve
            # In v1, all pips belong to the single active sleeve
            sleeve_pips = get_weekly_pips() if (hold_position or decision_count > 0) else 0

            # Get weekly trade count
            week_start = _week_start_utc().isoformat()
            cur.execute(
                """
                SELECT COUNT(*) as cnt FROM trade_intents
                WHERE side = 'EXIT' AND status = 'SUBMITTED' AND created_at >= ?
                """,
                (week_start,),
            )
            trade_row = cur.fetchone()
            trades_this_week = trade_row["cnt"] if trade_row else 0

            sleeves.append({
                "name": sleeve_name,
                "status": status,
                "pipsThisWeek": round(sleeve_pips, 1),
                "tradesThisWeek": trades_this_week,
                "holdPosition": hold_position or "",
                "units": int(units) if units else 0,
            })

    conn.close()
    return sleeves


def _parse_env_flags() -> dict[str, str]:
    """Parse .env file into a dict. Launch script overrides are NOT in the .env file,
    so we also check for overrides from the running process's environment."""
    flags = {}
    env_path = Path(ENV_FILE)
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, _, value = line.partition("=")
                flags[key.strip()] = value.strip()

    # Environment variables override .env (launch script sets these)
    for flag in SLEEVE_FLAGS:
        env_val = os.environ.get(flag)
        if env_val is not None:
            flags[flag] = env_val

    return flags


# ---------------------------------------------------------------------------
# Pip History
# ---------------------------------------------------------------------------

def get_pip_history() -> list[dict]:
    """Get daily pip totals for the last PIP_HISTORY_DAYS days."""
    history_start = (_utc_now() - timedelta(days=PIP_HISTORY_DAYS)).isoformat()
    week_start = _week_start_utc().isoformat()

    conn = sqlite3.connect(TRADES_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute(
        """
        SELECT created_at, response_json, requested_json
        FROM trade_intents
        WHERE side = 'EXIT'
          AND status = 'SUBMITTED'
          AND created_at >= ?
        ORDER BY created_at ASC
        """,
        (history_start,),
    )
    exit_rows = cur.fetchall()

    # Group by date
    daily: dict[str, dict] = {}
    for row in exit_rows:
        try:
            ts = datetime.fromisoformat(row["created_at"])
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            date_key = ts.strftime("%Y-%m-%d")

            if date_key not in daily:
                daily[date_key] = {"date": date_key, "pips": 0.0, "trades": 0}

            pips = _pips_from_exit(cur, row, conn)
            daily[date_key]["pips"] += pips
            daily[date_key]["trades"] += 1
        except Exception as e:
            logger.warning(f"Error processing pip history entry: {e}")
            continue

    conn.close()

    # Round pips and sort by date
    result = []
    for date_key in sorted(daily.keys()):
        entry = daily[date_key]
        entry["pips"] = round(entry["pips"], 1)
        result.append(entry)

    return result


# ---------------------------------------------------------------------------
# Build Full Payload
# ---------------------------------------------------------------------------

def build_payload() -> dict:
    """Build the complete Bridge forex payload per Ticket 014 mapping."""
    status = get_status()
    balance, last_updated = get_balance()
    weekly_pips = get_weekly_pips()
    sleeves = get_sleeves()
    pip_history = get_pip_history()

    return {
        "status": status,
        "balance": round(balance, 2),
        "weeklyPips": weekly_pips,
        "targetPips": TARGET_PIPS,
        "sleeves": sleeves,
        "pipHistory": pip_history,
        "lastUpdated": last_updated,
    }


# ---------------------------------------------------------------------------
# Publish
# ---------------------------------------------------------------------------

def publish(payload: dict) -> bool:
    """POST payload to The Bridge. Returns True on success."""
    headers = {"Content-Type": "application/json"}
    if BRIDGE_API_KEY:
        headers["Authorization"] = f"Bearer {BRIDGE_API_KEY}"

    try:
        resp = requests.post(
            BRIDGE_FOREX_URL,
            json=payload,
            headers=headers,
            timeout=10,
        )
        if resp.status_code in (200, 201, 204):
            logger.info(
                f"Published to Bridge: status={payload['status']} "
                f"balance={payload['balance']} pips={payload['weeklyPips']}"
            )
            return True
        else:
            logger.warning(
                f"Bridge responded {resp.status_code}: {resp.text[:200]}"
            )
            return False
    except requests.exceptions.ConnectionError:
        logger.error(f"Connection refused by Bridge at {BRIDGE_FOREX_URL}")
        return False
    except Exception as e:
        logger.error(f"Publish error: {e}")
        return False


def publish_once() -> bool:
    """Build payload and publish a single time. Returns True on success."""
    payload = build_payload()
    logger.info(f"Built payload: {json.dumps(payload, indent=2, default=str)}")
    return publish(payload)


def run_forever():
    """Publish on a cadence forever."""
    logger.info(f"Bridge publisher starting — interval={PUBLISH_INTERVAL_SECONDS}s")
    logger.info(f"  Bridge URL: {BRIDGE_FOREX_URL}")
    logger.info(f"  Trades DB: {TRADES_DB}")
    logger.info(f"  Health URL: {HEALTH_URL}")

    while True:
        try:
            publish_once()
        except Exception as e:
            logger.error(f"Unexpected error in publish loop: {e}", exc_info=True)
        time.sleep(PUBLISH_INTERVAL_SECONDS)


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    once = "--once" in sys.argv

    if once:
        success = publish_once()
        sys.exit(0 if success else 1)
    else:
        run_forever()