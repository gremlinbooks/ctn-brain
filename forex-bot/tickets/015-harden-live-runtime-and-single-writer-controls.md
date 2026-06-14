# TICKET-015: Harden Live Runtime and Single-Writer Controls

**Project:** Forex Bot  
**Status:** 🟡 OPEN  
**Priority:** P1 (Critical)  
**Assigned:** Rick / Codex  
**Created:** 2026-05-19  
**Updated:** 2026-05-19

## Description

Atlas recently suffered from multi-writer contamination, legacy service interference, and sizing-path confusion. Before the forex dashboard becomes a trusted source, the runtime needs stronger operational guarantees.

## Acceptance Criteria

- [ ] Exactly one documented live writer exists per account
- [ ] Legacy service ownership and disable/enable procedures are documented
- [ ] Active live process exposes enough metadata to prove:
  - active engine
  - branch config
  - sizing mode
  - broker account target
- [ ] Runtime logs clearly distinguish:
  - `NO_CANDIDATE`
  - `BLOCKED_*`
  - actual order submission
- [ ] Position metadata always identifies the responsible engine / branch
- [ ] Live sizing mode is explicit and test-covered

## Context

Recent issues included:

- rogue legacy Atlas runtime on VPS
- fallthrough from Breakwater into base OakBridge path
- wrong trade sizing behavior relative to intended runtime rules

This ticket is the reliability layer behind any Bridge-facing reporting.

## Dependencies

- none strictly, but should land before the forex dashboard is treated as canonical

## Completion Notes

[Fill in when done]
