# TICKET-028: Budget Values Should Persist Month-to-Month with Recurring Options

**Project:** The Bridge
**Status:** 🟡 OPEN
**Priority:** P2 (High)
**Assigned:** Morty
**Created:** 2026-05-24
**Updated:** 2026-05-24

## Description

Currently, budget entries do not persist from month to month. Users should be able to set up recurring budget items (like a Lexus Payment on the 14th) that automatically appear in future months, or specify how many months the recurrence should last.

## Acceptance Criteria

- [ ] Budget entries can be marked as recurring with options:
  - Recur monthly indefinitely
  - Recur for a specific number of months
  - Recur on a specific day of the month (e.g., 14th)
- [ ] When viewing a future month, recurring budget items from past months are shown (grayed out or marked as recurring).
- [ ] Users can edit or delete a recurring series (with options to edit just this instance or the entire series).
- [ ] The UI clearly indicates which budget items are recurring vs. one-time.
- [ ] Data persistence: recurring rules are stored and survive page reloads.

## Context

Craig wants budget planning to be more useful for recurring expenses. Instead of re-entering the same Lexus payment every month, the system should remember it and project it forward. This reduces data entry and improves forecasting accuracy.

## Technical Notes

- Likely involves changes to:
  - Budget data schema (add recurrence rules: frequency, end date, or count)
  - Backend API for budget CRUD endpoints
  - Frontend budget component to display and edit recurring items
  - Possibly a background job to generate future instances (or compute on-the-fly when loading a month)
- Consider storing a "budget template" that gets instantiated for each month, or store each instance with a reference to a template ID.
- Ensure that editing a recurring item properly propagates or allows breaking the series.

## Dependencies

- May depend on the budget API endpoints (if not already built).

## Completion Notes

[To be filled upon completion]