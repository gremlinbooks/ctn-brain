# TICKET-029: Recurring Expenses Section Should Be for One-Time Expenses Only

**Project:** The Bridge
**Status:** 🟡 OPEN
**Priority:** P2 (High)
**Assigned:** Morty
**Created:** 2026-05-24
**Updated:** 2026-05-24

## Description

The Recurring expenses section currently contains recurring expenses, which is confusing. According to the design, recurring expenses should be managed in the Budget section (with recurrence rules), and the Recurring expenses section should be reserved for one-time, non-recurring expenses. This ticket aims to clarify and implement that distinction.

## Acceptance Criteria

- [ ] Rename or reframe the "Recurring expenses" section to "One-Time Expenses" or similar.
- [ ] Move any truly recurring expenses (those with a repeating pattern) out of this section and into the Budget.
- [ ] The Recurring expenses / One-Time Expenses section should only accept expenses that do not repeat on a regular schedule.
- [ ] Update any related UI labels, helper text, and documentation to reflect this change.
- [ ] Ensure that data entered in this section is stored as one-time expenses (no recurrence rule).

## Context

Craig noted that the Recurring expenses section is currently being used for recurring expenses, which overlaps with the Budget's purpose. To reduce confusion, we should enforce that the Budget handles recurring items (with frequency, end date, etc.), and the Recurring expenses section is for irregular, one-time expenses (e.g., a car repair, a gift, a medical bill).

## Technical Notes

- Likely changes:
  - Frontend component that renders the Recurring expenses section (rename label, adjust validation).
  - Backend API for saving one-time expenses (ensure no recurrence field is saved).
  - Possibly a migration script to move existing recurring entries from this section to the Budget (if any exist).
  - Update any tests that reference this section.

## Dependencies

- TICKET-028 (Budget recurring persistence) may be helpful to have in place first, but not strictly required.

## Completion Notes

[To be filled upon completion]