# LEDGER PRD Template

Copy this template for every new project PRD.

---

```markdown
# PRD: [Project Name]

**Author:** [who wrote this — agent name, human name, or both]
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD
**Status:** Draft | Approved | In Progress | Live | Active Architecture Handoff

## Vision

One sentence. What is this thing and why does it exist?

## Problem Statement

What pain or opportunity does this address? Be specific about the *current gap*, not just the ideal state.

## Goals

1. Primary goal
2. Secondary goal
3. ...

## Non-Goals

What this is explicitly NOT doing (yet). Be honest about scope boundaries.

## Users

Who uses this? Name them and their role, even if it's just Craig.

| User | Role |
|------|------|
| Craig | Owner, direction, oversight |
| Rick | Runtime / deployment |
| Willow | Reporting, dashboard consumer |
| etc. | ... |

## Product Scope

Describe what this project actually IS right now. Not what it should be — what exists today.

- Is it a working system, a prototype, or a plan?
- What components exist and what state are they in?
- What's the current operational reality?

This section prevents "inventing from scratch" when something already exists. If Codex or Rick has been working on it for months, say so. If it's running on a VPS somewhere, document that.

## Current Reality

### Platform
- Where does it run? (VPS, local machine, cloud, Pi?) Include hostnames/paths if known.
- What's the service model? (systemd, PM2, docker, screen, ad hoc?)

### Language / Framework
- What language, runtime, and frameworks?
- What Python/Node version?

### Integrations
- What external APIs does it connect to? (Broker, exchange, data provider, etc.)
- Auth method? (API key, OAuth, etc.)

### Current Account / Balance / State
- If this is a trading bot, what's the current account balance?
- If this is a service, how many users/requests?
- Snapshot date and source.

### Who Manages It
- Runtime / deployment owner
- Direction / product owner
- Reporting / dashboard consumer

### Existing Code
- Repo path or URL
- Key entry points (main files, config, etc.)

### Data Delivery
- How does data currently flow out? (API, webhooks, files, logs, database)
- What's NOT connected yet?

This section is critical. Fill it with facts, not aspirations. If you don't know something, mark it ⚠️ and assign someone to find out. A PRD with real gaps is better than a PRD with fake certainty.

## Features

### Must Have (MVP)
- Feature 1

### Should Have (V2)
- Feature 2

### Nice to Have (Later)
- Feature 3

## Technical Architecture

Not just "React + Express" — the real architecture. Include:

- Application layer (main entry points, how it starts)
- API surface (endpoints, methods, auth)
- Storage model (database, files, caches, schemas)
- Configuration system (env vars, config files, how many settings?)
- Data flow diagrams if helpful

If the system has sub-systems, strategies, or research surfaces, document them here. Codex's Atlas PRD worked because it documented Harbor Shark v2/v3, Breakwater, and the learning pipeline — not just "it's a bot."

## Strategy / Logic Architecture

If this project has strategy, decision-making, or branching logic:

- What are the main strategies/paths/sleeves?
- How are they activated? (manual config? automatic? conditions?)
- What's the current active configuration?
- What's the research/validation pipeline?

Skip this section if the project doesn't have strategy logic.

## Data Sources

| Data | Source | Integration Method | Status |
|------|--------|-------------------|--------|
| e.g., Trade data | Broker API | REST v20 | ✅ Working |
| e.g., Dashboard metrics | Bot → Bridge | POST webhook | ❌ Not built |

Include status so it's clear what's real vs. planned.

## Data Model for Integration

If this project needs to push data to another system (like The Bridge), define the target schema explicitly:

```json
{
  "field": "type",
  "field": "type"
}
```

Then explain which internal sources map to which fields. This is what ticket 014 did for Atlas → Bridge and it's what makes the next ticket actually buildable.

## Design / UX

Visual language, key interactions, reference mockups. Link to design-system.md if it exists.

## Success Metrics

How do we know it's working? Specific, measurable targets. Not "it works" — "115 pips/week over a 4-week rolling average" or "zero emotional trades."

## Open Questions

⚠️ Mark anything uncertain. A PRD with honest gaps is better than one with fake certainty.

- Question 1?
- Question 2?

Assign owners to each question if possible.

## Next Product Work

Ordered list of what should happen next, based on current reality. Not a wishlist — the actual critical path.

1. First thing that unblocks everything else
2. Second thing
3. ...

## Ticket Breakdown

Link to tickets in the /tickets/ directory. Mark status with emoji.

## Timeline

Milestone-based, not date-based (unless there's a hard deadline). Tie milestones to ticket completion.