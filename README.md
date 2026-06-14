# The LEDGER

*Source of truth for the Oakbridge Labs portfolio.*

Endure. Rise. Create.

---

## What Is This

The LEDGER is the shared brain for every bot and agent in the Oakbridge ecosystem. Every project has its PRD, its tickets, its context, and its current status — all in one place. Any bot can read the LEDGER, pick up a ticket, and know exactly what to do.

No context fragmentation. No "what were we working on?" The LEDGER is the context.

## Principles

1. **PRD-first** — No work starts without a Product Requirements Document. The PRD defines what the thing IS.
2. **Tickets are atomic** — Each ticket is a self-contained unit of work. Pick it up, do the work, mark it done.
3. **STATUS.md is the heartbeat** — Every project has a STATUS.md: what's working, what's broken, what's next, what's blocked.
4. **Context lives here** — Not in bot memory, not in someone's head. If it matters, it's in the LEDGER.
5. **Any bot can pick up any ticket** — Willow, Rick, Morty, Claude Code, Codex — all read from the same source.

## Portfolio

| Project | Status | Description |
|---------|--------|-------------|
| [The Bridge](./the-bridge/) | 🟡 In Development | Personal command center — single pane of glass for all projects |
| [WalletHunter](./wallet-hunter/) | 🔴 Planning | Whale alert scraping — Telegram subscription service |
| [Forex Bot](./forex-bot/) | 🟡 Running | AUDUSD trading bot — 115 pips/week target, 4 sleeves, stage ladder |
| [Polymarket Bot](./polymarket-bot/) | 🟡 Running | Bitcoin/crypto 5-min yes/no market bot |
| [Oakbridge Labs](./oakbridge-labs/) | 🟢 Active | Craig's consulting company — fractional COO, project management |
| [Bulldozer](./bulldozer/) | 🔴 Planning | Operation Bulldozer — details TBD |

## Agent Responsibilities

| Agent | Role |
|-------|------|
| **Willow** | Executive assistant, second brain. Creates PRDs, manages tasks, daily check-ins, life tracking. Direct line to Craig. |
| **Rick** | Bot orchestrator. Runs Morty, manages trading bots, handles runtime automation. |
| **Morty** | Worker bot. Picks up LEDGER tickets, executes code, deploys. Runs on Raspberry Pi. |
| **Claude Code** | Deep coding agent. Builds features from tickets. |
| **Codex** | Alternative coding agent. Parallel work or backup. |

## Workflow

```
Craig → Willow (idea/direction)
  ↓
Willow writes PRD + tickets → LEDGER
  ↓
Craig approves/adjusts priorities
  ↓
Bot picks up ticket → reads context → does work
  ↓
Bot updates STATUS.md → marks ticket complete
  ↓
Willow sees update → informs Craig
```

## Ticket States

- `🟡 OPEN` — Ready to be picked up
- `🔵 IN PROGRESS` — Assigned and being worked on
- `🟢 DONE` — Completed and verified
- `🔴 BLOCKED` — Waiting on something
- `⚪ CANCELLED` — No longer needed

## Version

LEDGER v1.0 — May 19, 2026

*Nowotny Holding Group · Oakbridge Labs*