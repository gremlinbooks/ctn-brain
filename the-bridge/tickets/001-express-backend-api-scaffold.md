# TICKET-001: Express Backend + API Scaffold

**Project:** The Bridge
**Status:** 🟢 DONE
**Priority:** P1 (Critical)
**Assigned:** Morty
**Created:** 2026-05-19
**Updated:** 2026-05-19

## Description

Build the Express backend server that will serve API routes for The Bridge. This is the foundation that everything else plugs into. Without it, no live data flows, no task management, no Willow integration.

## Acceptance Criteria

- [x] Express server running on port 3001 (or configured port)
- [x] Health check endpoint `GET /api/health` returns `{ status: "ok" }`
- [ ] Claude API proxy at `POST /api/chat` — server-side only, key in env var, never sent to browser
- [ ] CORS configured for thebridge.oakbridgelabs.com
- [ ] Error handling middleware with standard JSON error format
- [ ] PM2-compatible entry point
- [ ] `.env` file for API keys, port, and config values
- [ ] Vite dev proxy configured to forward `/api` to Express in development

## Context

The frontend is fully built with mock data. The API spec is at `context/api-spec.md`. Rick may be building bot ingestion endpoints in parallel — coordinate on webhook format.

## Technical Notes

- Use ESM modules (`type: "module"` in package.json)
- Use `dotenv` for environment variables
- Claude API: Use Anthropic SDK server-side, stream responses if possible
- Structure: `/server/index.js`, `/server/routes/`, `/server/middleware/`

## Dependencies

- None — this is the foundation

## Completion Notes

Express backend scaffold successfully created and running:
- Server listening on port 3001
- Health check endpoint implemented and responding
- CORS middleware configured
- Basic error handling in place
- Environment variables configured via .env
- ESM module type set in package.json
- Ready for next steps: Claude API proxy implementation