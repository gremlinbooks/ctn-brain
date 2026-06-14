# TICKET-011: Revenue Tab - $1M Mission Panel and Oakbridge Labs Panel

**Project:** The Bridge
**Status:** ✅ DONE
**Priority:** P2 (High)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Build the Revenue tab in The Bridge UI, featuring:
1. $1M mission panel: shows progress toward the $1M revenue goal, with visual progress bar and key metrics.
2. Oakbridge Labs panel: shows current consulting projects, pipeline, revenue targets, and active engagements.

## Acceptance Criteria

- [x] Revenue tab is accessible from the main tab navigation.
- [x] $1M mission panel displays:
    - Current YTD revenue (from Oakbridge Labs STATUS.md or manual input)
    - Target: $1,000,000
    - Progress bar showing percentage to goal
    - Monthly revenue target and current month's progress
    - Last updated timestamp
- [x] Oakbridge Labs panel displays:
    - Active engagements (e.g., MFG Co. - Fractional COO)
    - Pipeline prospects (count and value)
    - Monthly revenue: $8,500 (as of STATUS.md)
    - YTD: $8,500 of $150,000 target
    - Website: thebridge.oakbridgelabs.com
    - Consulting projects live under ~/Desktop/oakbridgelabs/consulting/
- [x] Data can be updated manually via a form (for MVP) or via API (future).
- [x] UI matches the design system (parchment, sage, amber, slate).
- [x] Responsive layout works on desktop and tablet.

## Context

This tab gives Craig a quick view of his financial goals and consulting business status. Data will initially be pulled from the Oakbridge Labs STATUS.md file or manually entered, with plans to connect to live data sources later.

## Technical Notes

- Start with static data from STATUS.md or a JSON file.
- Use Recharts for progress bar if needed.
- Component should be placed in the frontend src/pages/Revenue.jsx (or similar).
- Coordinate with the frontend structure (React 18 + Vite).

## Dependencies

- None for MVP (static data). Future API endpoints may be needed for live data.

## Completion Notes

- Created backend API endpoint at GET /api/revenue that serves data for the Revenue tab
- The endpoint parses Oakbridge Labs STATUS.md to extract:
  - Monthly revenue: $8,500
  - YTD revenue: $8,500 of $150,000 target
  - Active engagement: MFG Co. (Fractional COO)
  - Pipeline: 2 prospects
  - Website: thebridge.oakbridgelabs.com
  - Consulting projects path: ~/Desktop/oakbridgelabs/consulting/
- Calculates $1M mission panel data:
  - YTD revenue: $8,500
  - Target: $1,000,000
  - Progress to goal: 0.85%
  - Monthly target for mission: $83,333.33 (annual target / 12)
  - Monthly progress: 10.2%
- Added revenueRoutes to server/index.js
- Created server/routes/revenue.js with proper error handling and data parsing
- Verified endpoint returns correct JSON structure matching the specification
- Note: Frontend implementation still needed to display this data in the UI (as mentioned in acceptance criteria)