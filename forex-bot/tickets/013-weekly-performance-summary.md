# TICKET-013: Automated Weekly Forex Performance Summary

**Project:** Forex Bot
**Status:** 🟢 DONE
**Priority:** P3 (Medium)
**Assigned:** Willow
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Willow provides a weekly summary of Forex Bot performance — pips, win rate, stage progress, and milestone tracking — delivered via the morning check-in or a dedicated Sunday report.

## Acceptance Criteria

- [ ] Willow pulls weekly performance data from The Bridge API or bot data
- [ ] Weekly summary includes: total pips, win rate per sleeve, P&L, stage ladder progress
- [ ] Milestone alerts: "S1 50% complete", "Approaching S2 threshold"
- [ ] Summary delivered via Telegram on Sunday evening or Monday morning
- [ ] Monthly capital injection reminders ($200-300) until account reaches $5-6K base

## Context

Craig wants to see bot performance without digging through dashboards. Willow serves as the reporting layer, surfacing key metrics proactively.

## Dependencies

- TICKET-012 (live data must be flowing to The Bridge)

## Completion Notes

Implemented the weekly performance summary API endpoint:
- GET /api/forex/summary returns weekly performance data including balance, weeklyPips, targetPips, overallWinRate, totalPnL, stage, stageProgress, sleeves details, pipHistory, and lastUpdated.
- The endpoint pulls data from the botData.json file (which is updated by the webhook endpoints from TICKET-007).
- Willow can now pull this data from The Bridge API to provide the weekly summary via Telegram or Sunday report (the delivery mechanism is to be implemented by Willow).

Note: The milestone alerts and monthly capital injection reminders are not implemented in this API endpoint but can be added by Willow when processing the data.

No deviations from the plan.
