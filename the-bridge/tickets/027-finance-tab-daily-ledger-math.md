# TICKET-027: Finance Tab Daily Ledger Math Incorrect

**Project:** The Bridge
**Status:** 🟡 OPEN
**Priority:** P1 (Critical)
**Assigned:** Morty
**Created:** 2026-05-24
**Updated:** 2026-05-24

## Description

The daily ledger in the Finance tab shows incorrect balance calculations. With one bill and one income entry, the displayed balance does not match the expected sum. Need to review the live version at https://the-bridge-oakbridge-c722e469caec.herokuapp.com/ and fix the calculation logic.

## Acceptance Criteria

- [ ] Review live site and identify the math error in the daily ledger section.
- [ ] Fix the calculation so that balance = sum(income) - sum(expenses) (or however the ledger is defined).
- [ ] Ensure the fix works with single and multiple entries.
- [ ] Add unit tests if applicable.
- [ ] Update any relevant documentation.

## Context

The Finance tab is meant to show a daily ledger of income and expenses, with a running balance. Craig reported that with one bill and one income entry, the balance is incorrect, suggesting a bug in the aggregation or sign handling.

## Technical Notes

- Likely location: frontend/src/components/FinanceTab.js or similar, or backend API that serves ledger data.
- Check the API endpoint that returns ledger data (GET /api/finance/daily-ledger?).
- Examine the calculation logic for summing income and expenses.
- Ensure that expenses are treated as negative (or income as positive) consistently.

## Dependencies

- None

## Completion Notes

[To be filled upon completion]