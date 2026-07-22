# Five Star Conveyancing — Quote engine & repository layer (Stage 6, Modules 1-2)

This covers the first two modules of Stage 6 (Development): the
database-driven quote calculation engine (Module 1) and the PostgreSQL
repository layer that feeds it real data (Module 2). Everything here is
**real, working, tested TypeScript** — not pseudocode — and the repository
layer has been verified against an actual local PostgreSQL 16 instance, not
just mocks. All firm names, fees, disbursements, and SDLT rates used in
tests are **fictional fixtures**; nothing here is real commercial or
regulatory data, per the "never invent" rule from Stage 1.

## Module 1 — calculation engine

- `schema.sql` — the subset of the Stage 4 schema this module reads from.
- `src/types.ts` — domain types mirroring the schema.
- `src/eligibility.ts` — eligibility filter, returning `excluded_with_reason`
  rather than hiding a firm, per your confirmed decision.
- `src/sdltModule.ts` — a generic marginal-band tax calculator, deliberately
  isolated from the fee engine. **`PLACEHOLDER_TEST_RATES` are fictional —
  do not use in production.** Real SDLT/LTT bands must come from HMRC / the
  Welsh Revenue Authority before this switches on for real quotes.
- `src/quoteEngine.ts` — the full pipeline: eligibility -> base fee (value
  band, explicit inclusive-boundary rule) -> supplements (trigger-key driven)
  -> disbursements -> SDLT (optional, injected) -> VAT per line -> totals ->
  full calculation audit trail.
- `tests/quoteEngine.test.ts` — 14 unit tests (boundaries, supplements, VAT,
  exclusion, regression isolation, SDLT, audit trail).

## Module 2 — database & repository layer

- `src/db/schema.ts` — Kysely table types matching `schema.sql` exactly
  (snake_case, matching the actual database columns).
- `src/db/client.ts` — connection factory. Connection string always comes
  from `DATABASE_URL` — never hard-coded. Also configures the `pg` driver to
  parse `numeric` columns as JS numbers rather than strings, so they line up
  with the calculation engine's `number`-based types.
- `src/db/repository.ts` — `loadFirmRuleSet`, `loadActiveFirmRuleSets`,
  `saveQuote`, `saveQuoteResults`, `getQuoteByReference`. Maps snake_case
  database rows onto the camelCase domain types Module 1 works with.
  Approval-status and effective/expiry-date filtering is left to the
  calculation engine, which already does it per rule — the repository's job
  is to fetch what's currently on file, nothing more.
- `tests/repository.integration.test.ts` — 6 tests run against a **real
  PostgreSQL database**: confirms dates and numeric columns convert
  correctly, confirms `loadActiveFirmRuleSets` correctly excludes a
  suspended firm, feeds a real database load straight into the calculation
  engine, and round-trips a full quote (including the jsonb audit trail)
  through save -> retrieve.

## What's intentionally not real

- Firm names, fees, disbursement amounts, and SDLT rates are all fictional
  test fixtures — not your six participating firms or real pricing.
- No lender-panel eligibility check yet — a small addition once the lender
  dataset is confirmed.

## What's not yet built (later Stage 6 modules)

- The API route(s) exposing this as `POST /api/quotes` and `GET
  /api/quotes/:reference`.
- The admin portal CRUD screens for editing fee rules with the
  draft -> pending_review -> approved workflow (the schema and
  `approval_status` field are ready for this; the UI and mutation
  endpoints are not built yet).
- The results-page frontend component consuming `QuoteResult[]`.
- CMS, search, email quotation, saved-quote resume flow.

## Running it

```bash
npm install
npm run typecheck              # tsc --noEmit
npm test                       # unit tests only — 14 tests, no database needed

# Integration tests need a disposable PostgreSQL database with schema.sql applied:
createdb five_star_test
psql -d five_star_test -f schema.sql
DATABASE_URL="postgres://user:pass@localhost:5432/five_star_test" npm run test:integration
```

`npm test` runs everywhere with no setup — the integration suite self-skips
if `DATABASE_URL` isn't set, so CI without a database attached still passes
cleanly rather than failing on a missing connection.

## How this maps back to earlier stages

- Every monetary figure comes from the database, not hard-coded — verified
  end-to-end in the "feeds a real database load straight into the
  calculation engine" integration test.
- `calculationAudit` is persisted as jsonb and round-trips correctly,
  satisfying the Stage 2 "any historical quote can be reproduced" acceptance
  criterion.
- `eligibilityStatus: 'excluded_with_reason'` is tested through the full
  stack — engine, save, and retrieve — not just the calculation layer.
- `loadActiveFirmRuleSets` enforces "suspended firms never appear in
  results" at the query level, not just in application logic.
