# TICKET-010: Google OAuth + Gmail Integration

**Project:** The Bridge
**Status:** 🟡 OPEN — Backend done, awaiting Google Client Secret + one-time OAuth auth
**Priority:** P2 (High)
**Assigned:** Unassigned
**Created:** 2026-05-19
**Updated:** 2026-05-20

## Description

Connect Google Gmail so The Bridge can show recent emails in the Overview and Communications tabs. Requires OAuth2 authorization from Craig (one-time setup).

**Scope change:** Originally included Google Calendar, but Calendar API is deferred to v2. This ticket is Gmail only. iCloud email (cnowotny@mac.com) is also deferred — IMAP integration can be added later if needed.

## Acceptance Criteria

- [x] Google OAuth2 flow — Craig authorizes once, tokens refresh automatically
- [x] `GET /api/mail/recent` — returns last 10 emails with sender, subject, time, category tag
- [ ] Frontend Overview tab Recent Mail section pulls from live data
- [ ] Frontend Communications tab shows email list
- [x] Email auto-categorization: work, fx, peptides, oakbridge, dev, personal based on sender/subject rules
- [x] Token storage secure on server (Heroku config vars, refresh token in data/google-tokens.json)
- [x] Redirect URI: `https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/auth/google/callback`

## Google Cloud Setup (COMPLETE)

- **Project:** thebridge-496904
- **Client ID:** 956186268043-0821tfi2sachnltbqbudvud8u7rraee5.apps.googleusercontent.com
- **Client Secret:** Store in Heroku config vars (DO NOT commit to repo)
- **Redirect URI:** `https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/auth/google/callback`
- **APIs enabled:** Gmail API, Google Calendar API (Calendar deferred to v2 but already enabled)
- **OAuth scopes needed:** `https://www.googleapis.com/auth/gmail.readonly`
- **Auth URI:** `https://accounts.google.com/o/oauth2/auth`
- **Token URI:** `https://oauth2.googleapis.com/token`
- **One-time auth:** Craig visits auth URL, clicks allow, callback stores refresh token

## Technical Notes

- Use Gmail API v1 (`users.messages.list` + `users.messages.get`)
- OAuth2 scope: `gmail.readonly`
- Store refresh token securely — this is Craig's personal Google account
- Email categorization rules:
  - **work**: sender domain matches Sunesis, Big Advisors, or subject contains "invoice", "proposal", "contract"
  - **fx**: subject contains "forex", "AUDUSD", "pip", "OANDA", "trade"
  - **peptides**: subject contains "peptide", "BPC", "GHK", "semaglutide", "tesamorelin"
  - **oakbridge**: sender domain matches oakbridgelabs or subject contains "bridge", "ledger", "bot"
  - **dev**: subject contains "deploy", "PR", "commit", "build", "error"
  - **personal**: everything else
- Cache emails: refresh every 5 minutes, store last 50 in memory/JSON
- Calendar integration deferred to v2
- iCloud email (cnowotny@mac.com) deferred — no simple API, would need IMAP + app-specific password

## Dependencies

- ✅ TICKET-001 (Express backend)
- ✅ Craig has completed Google Cloud setup and added redirect URI
- ⏳ Craig needs to do one-time OAuth authorization (visit URL, click allow) once the flow is built

## Completion Notes

Backend fully implemented and deployed (Heroku v18).

**Routes built:**
- `GET /api/auth/google` — starts OAuth2 flow (redirects to Google consent screen)
- `GET /api/auth/google/callback` — exchanges auth code for tokens, saves refresh token, redirects to `/?auth=success`
- `GET /api/auth/google/status` — returns `{authenticated, hasAccessToken, scope}`
- `DELETE /api/auth/google` — revokes tokens
- `GET /api/auth/mail/recent?limit=10` — returns last 10 emails with auto-categorization, 5-min cache

**Auto-categorization rules:**
- work: Sunesis/Big Advisors/HCA domains, invoice/proposal/contract subjects
- fx: OANDA/forex domains, forex/AUDUSD/pip/trade subjects
- peptides: BPC/GHK/semaglutide/tesamorelin subjects
- oakbridge: oakbridgelabs domains, bridge/ledger/bot subjects
- dev: GitHub/Heroku domains, deploy/PR/commit/build subjects
- personal: everything else

**Blocking:** Need Craig's actual Google Client Secret from Google Cloud Console. Currently set to placeholder. Set it with:
```
heroku config:set GOOGLE_CLIENT_SECRET=<actual-secret> --app the-bridge-oakbridge
```

Then Craig visits `https://the-bridge-oakbridge-c722e469caec.herokuapp.com/api/auth/google` to authorize.

**Remaining:** Frontend wiring for Overview tab and Communications tab.