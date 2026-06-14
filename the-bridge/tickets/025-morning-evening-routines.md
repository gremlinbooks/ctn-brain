# Ticket 025: Morning & Evening Routine Section

**Priority:** High
**Status:** 🔵 IN PROGRESS
**Tab:** Overview
**Assigned:** Morty

## Context / Why

No dedicated section for morning and evening routines on the Overview page. Craig has specific routines tied to his daily check-ins (6:30am morning, 8pm evening). These are core to the 75 Hard lifestyle protocol and daily accountability.

## Acceptance Criteria

- [ ] New "Routines" section on Overview page, positioned near Must Do's and Gratitude
- [ ] Two panels: Morning Routine (amber accent) and Evening Routine (sage accent)
- [ ] Each routine is a checklist of items (checkboxes, same pattern as 75 Hard tasks)
- [ ] Routines are editable — user can add/remove/reorder items
- [ ] Routines persist to API (`GET/POST /api/routines`)
- [ ] Morning routine shows time label "6:30 AM"
- [ ] Evening routine shows time label "8:00 PM"
- [ ] Completed items show green check, uncompleted show empty checkbox
- [ ] Daily reset — completed state resets each new day
- [ ] UI matches The Bridge design system

## Technical Notes

- New route: `server/routes/routines.js`
- New API methods in `src/api.js`: `getRoutines()`, `saveRoutines(type, items)`, `completeRoutineItem(id)`
- Add `routines` to persist.js ENV_MAP
- Model: `{ id, type: "morning"|"evening", text, order, created_at }`
- Daily reset: store completion state keyed by date (e.g., `routine-completions` in persist)

## Suggested Default Routines

**Morning (6:30 AM):**
1. Weigh in + progress photo
2. 75 Hard reading (10 pages)
3. Peptides (AM stack)
4. Must Do's review
5. Check emails + calendar

**Evening (8:00 PM):**
1. Workout 2 check
2. Water check (1 gallon?)
3. Gratitude journal
4. Must Do's review — tomorrow's prep
5. Wind down

## Design Notes

- Side by side panels on desktop (2-column grid within Overview)
- Morning panel: `T.amber` accent, "6:30 AM" label
- Evening panel: `T.sage` accent, "8:00 PM" label
- Compact — each item is a single line with checkbox, same feel as 75 Hard checklist
- "Edit" mode button to add/remove/reorder items