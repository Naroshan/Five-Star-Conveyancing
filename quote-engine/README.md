# Five Star Conveyancing — Quote engine, repository, API, admin, results UI, real data & authentication (Stage 6, Modules 1-9)

Nine modules of Stage 6 (Development) so far. Modules 1-6 are the
calculation engine, PostgreSQL repository layer, public API handlers, and
the admin approval workflow (all three commercial-rule tables), plus the
results-page React components — all built and tested against **fictional
fixture data only**. Module 7 is different: it's the **first real
commercial data** in the project — Ackroyd Legal's actual fee scale,
supplied by the client — loaded through the real admin workflow into a
database that's kept deliberately separate from the disposable automated
test database. Module 8 adds real password + TOTP MFA authentication
(what the admin UI in the separate `five-star-web` project actually runs
on). Module 9 completes the admin backend for all three rule tables and
documents a genuine discovery made while verifying it against the real
Ackroyd data.

## Module 1 — calculation engine
`schema.sql`, `src/types.ts`, `src/eligibility.ts`, `src/sdltModule.ts`,
`src/quoteEngine.ts`. 14 unit tests.

## Module 2 — database & repository layer
`src/db/schema.ts`, `src/db/client.ts`, `src/db/repository.ts`. 6 integration
tests.

## Module 3 — API handlers
`src/api/schemas.ts`, `src/api/reference.ts`, `src/api/rateLimiter.ts`,
`src/api/createQuote.ts`, `src/api/getQuote.ts`, `src/api/publicResult.ts`.
`nextjs-integration/` shows the route wiring. 12 unit + 7 integration tests.

## Module 4 — admin approval workflow (fee rules)
`src/admin/roles.ts`, `src/admin/auditLog.ts`, `src/admin/feeRuleAdmin.ts` —
the flagship implementation of the draft -> pending_review ->
approved/rejected workflow: segregation of duties, supersession, full audit
trail. 7 unit + 9 integration tests.

## Module 5 — results-page components
`src/components/QuoteResults/` (`FeeBreakdown`, `QuoteResultCard`,
`QuoteResultsList`) + `src/components/theme.ts`. Mobile-collapsed fee
breakdown, a "Fixed fee" badge computed (never asserted) from real line-item
data, excluded firms always shown with a reason, two distinct empty states.
13 component tests using `@testing-library/react` + jsdom.

**Fixed in Module 5's session:** `Firm`/`mapFirm` were silently dropping
`trading_name`/`sra_number` even though both columns exist — the results
page would have had nothing but a bare `firmId` to show. Added
`loadFirmsByIds` and a shared `src/api/publicResult.ts` helper so both API
handlers now return real firm display data, re-verified in the existing
integration tests. Also fixed two bugs caught while writing the component
tests: RTL's auto-cleanup never registered (fixed with `vitest.config.ts` +
`tests/setupTests.ts`), and the SRA number/fixed-fee label were one merged
text run, unqueryable and a screen-reader smell (split into separate spans).

## Module 6 — admin approval workflow, completed for fee value bands and disbursement rules

Module 4 shipped the workflow for `fee_rules` only, with the pattern
documented but not duplicated. This module closes that gap:

- `src/admin/feeValueBandAdmin.ts` and `src/admin/disbursementRuleAdmin.ts`
  — identical shape to `feeRuleAdmin.ts` (create/update/submit/approve/
  reject/list), including segregation of duties and supersession, applied
  to `fee_value_bands` and `disbursement_rules` respectively.
- `src/admin/roles.ts` — the `Permission` type and role matrix were
  refactored from three hand-written fee-rule entries into a small
  generator (`RESOURCES` × actions) covering `fee_rules`, `fee_bands`, and
  `disbursements` uniformly, rather than hand-duplicating the matrix three
  times. Re-verified against the original 7 unit tests before adding new
  ones, to confirm the refactor changed nothing about fee_rules' existing
  behaviour.
- Schema change: `fee_value_bands` and `disbursement_rules` gained
  `created_by`, `last_modified_by`, and `supersedes_*` columns (previously
  only `fee_rules` had them) — needed for the same workflow to apply.
- `tests/admin-bands-disbursements.integration.test.ts` — 11 tests covering
  both tables: full happy path, **genuine** segregation of duties (a
  `super_admin` — who actually holds both create and approve permissions —
  is still blocked from approving their own change; not just a role-level
  permission check, which is a materially weaker property), reject with a
  required reason and resubmission after edit, and the supersession
  expiry-date update.

**A mistake I made and caught while writing this module's tests, not after
shipping them:** my first draft of the segregation-of-duties tests for both
tables only proved that `fee_administrator` lacks approve permission — a
basic role check, not actual segregation of duties (which requires proving
that someone with *both* permissions is still blocked because of *who they
are*, not *what role they have*). Caught before running the suite, fixed by
adding a `super_admin` fixture (who genuinely holds both permissions) and
rewriting both tests to use it — matching the property already proven for
`fee_rules` in Module 4.

**All three admin services now share `InvalidStateError` from
`feeRuleAdmin.ts`** rather than each redefining it — a small thing, but
worth being explicit that it's one class, not three coincidentally-identical
ones.

## Module 7 — first real data: Ackroyd Legal

`scripts/import-ackroyd-legal.ts` loads Ackroyd Legal's actual fee scale
(supplied as a spreadsheet, SRA 554585) through the real admin service
functions from Module 4/6 — not a raw SQL dump. 67 records: 3 base-fee
`fee_rules` + 34 `fee_value_bands` (Purchase, Sale, Remortgage) + 19
supplement `fee_rules` + 11 `disbursement_rules`. Every one lands as
`draft`. `scripts/verify-no-real-quotes-yet.ts` proves the point that
matters: a live `purchase` quote request against this data right now
returns Ackroyd Legal as `excluded_with_reason`, `"This firm has no
published fee for a property of this value"` — because nothing is
`approved` yet. Being in the database is not the same as being usable by
the quote engine, and this is the test that actually confirms the gap
holds, not just an assertion that it should.

**This data lives in a separate `five_star_data` database, not
`five_star_test`.** The automated test suites truncate their tables in
`beforeEach` — real commercial data has no business anywhere near that.
Re-ran the full 79-test suite against `five_star_test` afterward to confirm
the two are properly isolated from each other.

**Deliberately not imported, pending clarification:**
- The "Concessionary" purchase supplement (£50) — meaning unconfirmed.
- Three inconsistent "L&C fee" reduction footnotes (£25 / £40 / £50) in the
  source sheet — unclear what base amount they discount from, and "L&C" may
  refer to a mortgage broker relationship rather than your own fee at all.
- Purchase/Sale bands above £2,000,000 — priced as "0.1 Percent" in the
  source, a formula `fee_value_bands` doesn't support. Left unbanded
  deliberately (see below) rather than approximated.
- No HM Land Registry registration fee appears anywhere in the source
  sheet, which is unusual for a purchase disbursement list — worth
  confirming whether it's bundled into another line or charged separately.

**Assumptions made, flagged in every affected row's `client_facing_explanation` for a reviewer to check:**
- VAT treatment defaults to `standard` for every supplement and
  disbursement — the source sheet states figures are "exc. VAT" but never
  says which items actually attract VAT. The base legal fee is `standard`
  with high confidence (solicitors' fees are standard-rated in the UK);
  the disbursement/supplement defaults are lower-confidence guesses at
  common practice, not confirmed fact.
- "ID Check (PP)" is priced per person in the source but loaded as a flat
  figure — this system doesn't yet support per-person disbursement scaling.
- The combined Help to Buy flag is priced at the ISA rate (£150) per
  instruction; the source data priced Equity Loan cases higher (£250) —
  noted in the row's explanation in case this needs revisiting later.

**Not idempotent** — re-running `import-ackroyd-legal.ts` against a
database that already has this data creates a second full set of
duplicate draft rows rather than updating the first. Documented at the top
of the script itself, not just here.

## Module 8 — authentication: password + TOTP MFA, sessions, provisioning

Everything the `five-star-web` admin UI's login actually runs on lives here,
not in the web app — the app only ever imports it.

- Schema: `admin_users` gained `password_hash`, `mfa_secret`,
  `account_status`, `failed_login_attempts`, `locked_until`. A new
  `admin_sessions` table backs sessions server-side (individually
  revocable — not a stateless signed cookie a leaked secret could forge).
- `src/auth/password.ts` — bcryptjs hashing, plus a precomputed dummy hash
  (`DUMMY_HASH_FOR_TIMING_SAFETY`) so a login attempt against a
  nonexistent email still runs a real bcrypt comparison, keeping response
  timing close to a wrong-password attempt.
- `src/auth/totp.ts` — TOTP generation/verification (otpauth), compatible
  with any standard authenticator app, one 30s step of clock drift
  tolerated either side.
- `src/auth/session.ts` — create/validate/destroy, plus
  `destroyAllSessionsForUser` for a full sign-out-everywhere.
- `src/auth/login.ts` — orchestrates password + account lockout (5
  attempts, 15-minute lock) + MFA into one flow with distinct error types
  (`InvalidCredentialsError`, `AccountLockedError`, `MfaRequiredError`) so
  a caller can respond appropriately without re-implementing the checks.
- `src/auth/provisioning.ts` — account creation and the two-step MFA
  enrollment (`beginMfaEnrollment` issues a secret; `confirmMfaEnrollment`
  only switches MFA on once a real generated code proves the secret
  actually reached an authenticator app). No self-service signup, by
  design — matches the Stage 2 role model.

**A real bug caught while building this, not after**: `validateSession`
originally crashed with a raw Postgres error on a malformed session ID —
the `session_id` column is `uuid`, and Postgres throws rather than
returning no rows for a non-UUID string. A session ID comes straight from
a cookie an attacker could tamper with, so this mattered. Fixed with an
explicit UUID-format check before the value ever reaches a query, and
covered by a dedicated test (`tests/auth.integration.test.ts`).

20 auth tests: 10 unit (`tests/auth.unit.test.ts` — hashing, TOTP
generation/verification, malformed-input handling) and 10 integration
(`tests/auth.integration.test.ts` — full login, lockout down to the exact
attempt count, MFA requirement and rejection of a wrong code, session
lifecycle, suspended-account rejection).

## Module 9 — admin backend completed for all three rule tables, and a real discovery about the Ackroyd data

Two small additions closed a gap the web app's admin UI needed:
`getFeeValueBandById` and `getDisbursementRuleById` (mirroring
`getFeeRuleById` from Module 4 exactly — view-permission checked,
throwing `ForbiddenError` for an unpermitted role), each with a new test.
`tests/admin-bands-disbursements.integration.test.ts` is now 13 tests, up
from 11.

**A genuine discovery, not a planned feature**: while verifying the web
app's new fee-bands/disbursements admin pages against the real Ackroyd
Legal data, the pending-review queues came back empty — not a bug, but a
correct consequence of how Module 7's import script works. Creating a
`draft` and submitting it `for_review` are deliberately separate steps (so
whoever enters data gets a chance to check it before it reaches a
reviewer), and the import script only ever did the first one. All 67 real
Ackroyd records were sitting in `draft`, invisible to any reviewer,
because nobody had submitted them.

`scripts/submit-ackroyd-for-review.ts` performs that second step for every
currently-draft Ackroyd record, running as the same `fee_administrator`
"Data Import" account that created them (so this still respects
segregation of duties — that account still can't approve anything).
Re-ran `verify:draft-safety` afterward to confirm `pending_review` is
still correctly *not* `approved` — the quote engine still refuses to use
it. Then, as genuine end-to-end proof, provisioned a real
`compliance_reviewer` account, enrolled its MFA through the actual
production login flow (not a shortcut), and confirmed via `curl` that the
real fee bands and disbursements — matching the source spreadsheet's
actual figures exactly — are now genuinely visible and actionable through
the real admin UI. Nothing has been approved; that's still a deliberate,
separate act for whoever holds that role for real.

## What's intentionally not real
Firm names, fees, and admin user names/emails throughout are fictional
fixtures.

## What's not yet built
- **Compliance approval of the Ackroyd Legal data.** As of Module 9 it's
  genuinely reviewable (`pending_review`, visible in the real admin UI to
  a real MFA-authenticated reviewer) — but nobody has actually approved
  it. That's still a deliberate, separate act for whoever holds that role.
- Ackroyd Legal fee data for the other three transaction types (sale and
  purchase, transfer of equity, lease extension) — only Purchase, Sale, and
  Remortgage were in the supplied fee scale.
- Fee data for the other four confirmed firms (Beechwood Solicitors, Waller
  and Hart Solicitors, Guillaumes LLP, TP Legal LTD).
- The open roster question from earlier — whether TP Legal LTD replaces
  Hutchins Law or Truemans Solicitors, or the roster has genuinely changed
  to five firms — still unanswered.
- Admin API routes exposing any of the three admin services as a
  standalone API (the `five-star-web` app calls the service functions
  directly from Server Actions/route handlers, which is the more idiomatic
  Next.js pattern — a separate REST-style API for these hasn't been built
  and may not need to be).
- CMS, search, email quotation (the "Email quote" button in the results UI
  is wired to a visible "not wired up yet" message, not silently doing
  nothing), and the saved-quote resume flow's actual email delivery.
- Sorting/filtering by review rating, response time, lender panel, local
  office on the results list (data not yet joined into the API response).
- A web UI for creating new admin accounts — `provisionAdminUser` is real
  and tested, just script-only so far, matching the "no self-service
  signup" design decision.
- Admin CRUD (not just approval) for firms, locations, and lenders — the
  three commercial-rule tables have the full draft/review/approve
  workflow; firm/location/lender records don't have an equivalent yet.

## Running it

```bash
npm install
npm run typecheck                    # tsc --noEmit
npm test                             # unit + component tests — 56 tests, no database needed

# Integration tests need a disposable PostgreSQL database with schema.sql applied:
createdb five_star_test
psql -d five_star_test -f schema.sql
DATABASE_URL="postgres://user:pass@localhost:5432/five_star_test" npm run test:integration   # 46 tests
```

`npm test` runs everywhere with no setup — all five database-backed
integration suites (repository, API, admin fee-rules, admin bands &
disbursements, auth) self-skip if `DATABASE_URL` isn't set.

**102 tests total** (56 unit, 46 integration), all passing as of Module 9.

## How this maps back to earlier stages

- Segregation of duties and supersession are now proven properties of *the
  workflow pattern*, not incidental behaviour of one table — demonstrated
  by applying and re-testing them on two more tables without changing the
  underlying logic in `roles.ts` or `auditLog.ts` at all.
- The `RESOURCES`-based permission matrix means adding a fourth admin
  resource later (e.g. `lender_panel_confirmations`) is a one-line addition
  to `RESOURCES`, not a fourth hand-copied block — directly serving the
  Stage 2 instruction that fee/commercial data must be editable without
  code changes reaching all the way down to how *permissions themselves*
  are maintained.
