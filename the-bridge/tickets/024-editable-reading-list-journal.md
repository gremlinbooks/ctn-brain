# Ticket 024: Editable Reading List + Reading Journal

**Priority:** High
**Status:** 🔵 IN PROGRESS
**Tab:** Lifestyle
**Assigned:** Morty

## Context / Why

The 75 Hard reading schedule is hardcoded in App.jsx. Craig can't reorder books, add new ones, or journal daily reflections on what he read. The reading tracker is one of the most-used Lifestyle features — it needs to be flexible and personal.

## Acceptance Criteria

- [ ] Reading list is loaded from API (`GET /api/reading/list`), not hardcoded in App.jsx
- [ ] User can add a new book (title, author, start day, end day)
- [ ] User can reorder books (move up/down arrows, day numbers auto-adjust)
- [ ] User can mark the "currently reading" book (active flag toggle)
- [ ] Each book entry has a "Journal" button that opens a text area for daily reflection
- [ ] Journal entries saved to API with date, book_id, and text
- [ ] Journal entries visible per-book (click book → see all entries for that book)
- [ ] UI matches The Bridge design system (T tokens, Panel, Tag components from App.jsx)

## Technical Notes

- Reading route already exists: `server/routes/reading.js` — extend it
- Add journal endpoints: `GET /api/reading/journal/:bookId`, `POST /api/reading/journal`
- Journal model: `{ id, book_id, date, text, created_at }`
- Add `reading-logs` to persist.js ENV_MAP
- Frontend: Update `ReadingTracker` component in App.jsx (~line 2100+)
- Keep the existing `api.js` methods (`addBook`, `updateBook`, etc.)

## Design Notes

- "Add Book" button at bottom of the reading schedule
- Reorder via up/down arrow buttons on each book row
- Journal section: text area below active book, date stamp, save button
- Use `T.serif` for book titles, `T.mono` for data, `T.sans` for body
- Tag for "now" on active book (existing pattern)