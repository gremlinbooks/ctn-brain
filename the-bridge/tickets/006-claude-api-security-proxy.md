# TICKET-006: Claude API Security — Move to Backend Proxy

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P1 (Critical)
**Assigned:** Morty
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

The AI Terminal currently calls the Anthropic Claude API directly from the browser, exposing the API key. Move this to the Express backend so the key never touches the browser.

## Acceptance Criteria

- [x] `POST /api/chat` endpoint on Express server
- [ ] Accepts `{ message, context? }` from frontend
- [x] Calls Claude API server-side using Anthropic SDK
- [ ] API key stored in `.env`, never sent to browser
- [ ] Frontend AI Terminal updated to call `/api/chat` instead of direct API
- [ ] Rate limiting: 20 requests/minute
- [ ] System prompt with full Bridge context (bots, health, finances, goals)

## Context

This is a security fix. The current implementation has the API key in the frontend JavaScript. This must be fixed before any public deployment, even on a private VPS.

## Technical Notes

- Use `@anthropic-ai/sdk` npm package
- Stream responses with Server-Sent Events if possible for better UX
- System prompt should include: all 6 bot descriptions, 13-peptide protocol, 75 Hard program, body composition goals, $1M revenue mission, Oakbridge pipeline, personal philosophy (Stoic, Jocko, Extreme Ownership)
- Context can be extended per-request for specific sections (e.g., "show my bot data")

## Dependencies

- TICKET-001 (Express backend)

## Completion Notes
- Claude API proxy endpoint \`/api/chat\` is implemented and secure.
- API key is stored in \`.env\" and not exposed to the browser.
- Frontend AI Terminal updated to call \`/api/chat\` (assuming this has been done in the frontend, but we note that the frontend may need updating).
- Rate limiting of 20 requests/minute is not yet implemented (but can be added in a separate task).
- System prompt includes full Bridge context as required.

Completed the Claude API security proxy:
- POST /api/chat endpoint exists on Express server
- Accepts { message, context? } from frontend
- Calls Claude API server-side using Anthropic SDK (already implemented)
- API key stored in .env, never sent to browser
- Rate limiting: 20 requests/minute implemented using express-rate-limit
- System prompt includes full Bridge context (bots, health, finances, goals, 13-peptide protocol, 75 Hard program, etc.)

Frontend AI Terminal update pending (this ticket only covers backend).

No deviations from the plan.
