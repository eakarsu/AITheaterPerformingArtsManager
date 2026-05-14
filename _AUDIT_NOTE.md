# Audit Note — AITheaterPerformingArtsManager

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_08.md` (section 18).

## Original Recommendations

### Missing AI Counterparts
- AI-driven season planning
- Performance outcome prediction

### Missing Non-AI Features
- Eventbrite/BPT integrations
- Email marketing automation
- Grant database/matching
- Volunteer management
- Patron self-service portal

### Custom Feature Suggestions
- Season planning optimizer
- Performance outcome prediction
- Fundraising campaign planning
- Script recommendation engine
- Community partnership matcher

## Implemented (this round)
1. `POST /api/ai/season-planning` — recommend a season slate based on history/budget/audience.
2. `POST /api/ai/performance-outcome` — predict ticket sales + review sentiment.

Pattern reused: `callOpenRouter` + `parseAIJson` + `persistAIResult` + `aiRateLimiter`. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** Fundraising campaign planning endpoint (donor segmentation).
2. **MECHANICAL** Script recommendation engine endpoint.
3. **NEEDS-CREDS** Eventbrite/BPT integration.
4. **NEEDS-PRODUCT-DECISION** Volunteer management module, patron portal.

## Apply pass 5 (all backlog)

Implemented 5 endpoints in `backend/routes/ai.js` covering all remaining NEEDS-CREDS and NEEDS-PRODUCT-DECISION backlog:

**NEEDS-CREDS** (return 503 with `missing: <ENV>`):
- `POST /api/ai/eventbrite-sync` — `EVENTBRITE_API_KEY`
- `POST /api/ai/bpt-sync` — `BPT_API_KEY`

**PRODUCT-DECISION:**
- `POST /api/ai/volunteer-management` — read-only AI recommender pulling from existing `volunteers` table; matches volunteers to needed roles. Does not write to `volunteers`.
- `POST /api/ai/community-partnership` — community partnership matcher with a 12-archetype built-in list (library, public schools, university, senior living, disability arts, veterans, refugee, LGBTQ+ youth, public radio, indie bookstore, restaurant assoc., faith community).
- `GET /api/ai/patron-portal` — patron self-service feed; aggregates the patron's own tickets and donations by email. Read-only (no profile edit yet).

Reuses existing `callOpenRouter`, `parseAIJson`, `persistAIResult`, `aiRateLimiter`, and a generic `requireEnv` 503 gate. Syntax checked.

Backlog now empty.

## Apply pass 4 (mechanical backlog)

Implemented both mechanical backlog items:

1. **`POST /api/ai/fundraising-campaign`** — donor segmentation + multi-channel campaign plan. Pulls donor and ticket history to ground the AI; outputs segments, week-by-week timeline, channel mix, expected total raised, and risks.
2. **`POST /api/ai/script-recommendation`** — script/play recommendation engine. Considers theme, audience, cast size cap, budget, run length, public-domain-only flag, and excluded titles; recent shows are passed in as duplicate-avoidance context. Outputs 5 candidate plays with rights status, cast size, complexity, and rationale.

Both reuse `callOpenRouter` + `parseAIJson` + `persistAIResult` + `aiRateLimiter`, and a new `requireOpenRouterKey` middleware returns 503 when `OPENROUTER_API_KEY` is missing or a placeholder.

Frontend: added two new entries to `frontend/src/config/features.js` (`fundraising-campaign` and `script-recommendation`). They auto-render through the existing `AIFeaturePage.js` generic AI form, including JWT bearer auth and structured-result rendering.

Smoke-tested live: logged in as `admin@theater.com`; both endpoints correctly returned 503 with the expected error body when the env had a placeholder key, confirming both routing and the no-key guard.

Mechanical backlog is now empty. Remaining items (Eventbrite/BPT integration, volunteer management, patron portal) are NEEDS-CREDS or NEEDS-PRODUCT-DECISION.

## Apply pass 3 (frontend)

**Action:** LEFT-AS-IS — FE already wired.

`frontend/src/pages/AIFeaturePage.js` is a generic AI form driven by feature definitions in `frontend/src/config/features.js`. Both pass-2 additions (`season-planning` at lines 560-575 and `performance-outcome` at lines 577-594) have complete `features.js` entries with form fields and `apiPath` pointing to their backend endpoints — they appear in the dashboard, the form generates correctly, and submissions POST to the right routes.

The full AI Tools category (11 endpoints) is exposed: marketing, casting-calls, grant-narratives, audience-analysis, rehearsal-optimization, subscription-recommendations, script-analysis, ticket-pricing, rehearsal-schedule, season-planning, performance-outcome.

Auth: `Authorization: Bearer <token>` from `localStorage` in `AIFeaturePage.js:9-12`. No FE changes needed.
