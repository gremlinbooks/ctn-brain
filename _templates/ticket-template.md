# LEDGER Ticket Template

Copy this template for every new ticket. File name: `NNN-short-title.md`

---

```markdown
# TICKET-NNN: Short Title

**Project:** [project-name]
**Status:** 🟡 OPEN | 🔵 IN PROGRESS | 🟢 DONE | 🔴 BLOCKED | ⚪ CANCELLED
**Priority:** P1 (Critical) | P2 (High) | P3 (Medium) | P4 (Low)
**Assigned:** [agent-name or Unassigned]
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD

## Description

What needs to be done. Clear, concise, one paragraph. Focus on the *outcome*, not the implementation details.

## Acceptance Criteria

- [ ] Criterion 1 — be specific and testable
- [ ] Criterion 2 — what does "done" look like?
- [ ] Criterion 3 — edge cases or error handling

Every criterion should be verifiable. "Works" is not a criterion. "Returns 200 with valid JSON for GET /api/bots/forex" is.

## Context

Why does this ticket exist? Link to PRD sections, reference related tickets, explain the business or technical motivation. If this ticket is blocked on a decision, say so.

This is where you put the "why" so whoever picks up the ticket doesn't have to guess.

## Technical Notes

Implementation details, constraints, dependencies, data schemas, API contracts. Include:

- File paths or entry points to modify
- Data formats (input/output schemas)
- Edge cases to handle
- Performance considerations
- Security concerns

If there's an existing system being modified, reference the current code or config. If there's a target schema to match, include it.

## Dependencies

- Depends on: TICKET-XXX (if any)
- Blocks: TICKET-XXX (if any)
- Requires input from: [person or agent] (if any)

## Completion Notes

[Fill in when done — what was actually implemented, any deviations from the plan, anything the next person should know.]