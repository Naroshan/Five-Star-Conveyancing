# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo is a monorepo root. `netlify.toml` and `NETLIFY.md` live at the
root as siblings to `quote-engine/` and (once it's added) `five-star-web/`
— see `NETLIFY.md` for the full deploy setup and why the layout matters
(Netlify's `base` build setting, the committed dependency tarball, etc.).
`five-star-web/` (the Next.js frontend) **is not present in this repo
yet** — it's referenced by `netlify.toml`/`NETLIFY.md` ahead of its
hand-over.

```
/                      <- repo root: netlify.toml, NETLIFY.md, CLAUDE.md
  quote-engine/         <- Module 2 (database & repository layer), documented below
  five-star-web/        <- Next.js frontend (NOT YET PRESENT)
```

## What's actually in `quote-engine/` right now

This directory currently contains only **Module 2 (database & repository layer)** of
a larger "Stage 6" quote-engine project, plus the schema it's built on:

- `quote-engine/schema.sql` — PostgreSQL 16 DDL (structural only, no real
  firm/fee/lender data — see "Never invent real data" below).
- `quote-engine/src/db/schema.ts` — Kysely table types mirroring
  `schema.sql` exactly (snake_case, matching real DB columns 1:1).
- `quote-engine/src/db/client.ts` — Kysely/`pg` connection factory (`createDb`).
- `quote-engine/src/db/repository.ts` — the repository functions: `loadFirmRuleSet`,
  `loadActiveFirmRuleSets`, `saveQuote`, `saveQuoteResults`,
  `getQuoteByReference`.
- `quote-engine/tests/repository.integration.test.ts` — integration tests that run
  against a real Postgres instance.

**Module 1 (the calculation engine)** — `src/types.ts`, `src/eligibility.ts`,
`src/sdltModule.ts`, `src/quoteEngine.ts`, `tests/quoteEngine.test.ts` (all
under `quote-engine/`) — is described in `quote-engine/README.md` and is
imported by both `repository.ts` (`../types.js`) and the integration test
(`calculateQuoteForFirm` from `../src/quoteEngine.js`), but **those files
are not present in this repo yet**. There is also no `package.json`,
`tsconfig.json`, or lockfile checked in under `quote-engine/`. Any of these
missing pieces will need to be created/restored before `npm install`, `npm
run typecheck`, or either test command in `quote-engine/README.md` will
actually run. Check with the user before assuming these are simply "not
written yet" vs. lost — `README.md`'s own file inventory expects them to
exist.

## Commands (per quote-engine/README.md — verify they work once package.json exists)

Run from inside `quote-engine/`:

```bash
npm install
npm run typecheck              # tsc --noEmit
npm test                       # unit tests only (Module 1) — no database needed
npm run test:integration       # repository.integration.test.ts — needs DATABASE_URL
```

Integration tests need a disposable Postgres database with `schema.sql` applied:

```bash
createdb five_star_test
psql -d five_star_test -f quote-engine/schema.sql
DATABASE_URL="postgres://user:pass@localhost:5432/five_star_test" npm run test:integration
```

`tests/repository.integration.test.ts` self-skips (`describe.skip`) whenever
`DATABASE_URL` is unset, so the plain unit-test run must never require a
database. **Never point `DATABASE_URL` at a real/production database** — the
integration suite truncates `quote_results, quotes, disbursement_rules,
fee_rules, fee_value_bands, firm_restrictions, firm_transaction_types, firms`
in `beforeEach`.

For the Netlify deploy of `five-star-web/` (once present), see `NETLIFY.md`.

## Architecture

**Domain flow:** `quote-engine/schema.sql` (Postgres) →
`quote-engine/src/db/schema.ts` (Kysely snake_case row types) →
`quote-engine/src/db/repository.ts` (maps rows to camelCase domain types
from `src/types.ts`) → quote calculation engine (Module 1, not yet
present) → `repository.ts` again to persist `QuoteResult[]`.

- **Two type systems, one boundary.** `src/db/schema.ts` types are
  snake_case and match the database exactly; nothing outside `src/db/`
  should import them directly. `src/types.ts` (Module 1, not present)
  defines the camelCase domain types the calculation engine works with.
  `src/db/repository.ts` is the *only* place that translates between the
  two (see its `map*` functions at the bottom of the file).
- **Filtering responsibility is split deliberately.** The repository layer
  does *not* filter by `approval_status`, `effective_date`, or
  `expiry_date` when loading fee rules/bands/disbursements — it fetches
  everything on file for a firm+transaction type. That filtering is left to
  the calculation engine, which already does it per-rule. Don't "fix" this
  by adding WHERE clauses to the repository — it would duplicate logic and
  risk the two layers disagreeing.
  - `loadActiveFirmRuleSets` is the exception: it does filter at the SQL
    level on `firms.status = 'active'` and
    `firm_transaction_types.accepted = true`, because "suspended firms
    never appear in results" is meant to be enforced at the query level,
    not just in application logic.
- **`quote_results.eligibility_status`** is `'eligible' | 'excluded_with_reason'`
  — firms are never silently hidden from results; an excluded firm is
  persisted with a reason instead. When `eligibilityStatus` is
  `excluded_with_reason`, `saveQuoteResults` writes `null` for
  `legal_fee_subtotal`/`vat_amount`/`disbursements_total`.
- **`calculation_audit` is a jsonb column**, round-tripped verbatim through
  `saveQuoteResults`/`getQuoteByReference` so any historical quote can be
  reconstructed later — this is a hard acceptance criterion carried over
  from an earlier project stage, not incidental behavior.
- **Numeric handling:** `src/db/client.ts` overrides `pg`'s default numeric
  type parser (OID 1700) to return JS `number` instead of `string`, so
  values line up with the calculation engine's `number`-based types. This
  is a deliberate simplification, not a production recommendation — a
  decimal library end-to-end would be more correct for money at scale.
- **Dates:** `fee_value_bands`, `fee_rules`, and `disbursement_rules` use
  `date`-only columns; `repository.ts`'s `toDateOnlyString`/
  `toDateOnlyStringOrNull` helpers normalize these to `'YYYY-MM-DD'`
  strings for the domain layer regardless of whether `pg` hands back a
  `Date` or a string.
- **`approval_status`** (`draft → pending_review → approved → rejected`) on
  `fee_value_bands`, `fee_rules`, and `disbursement_rules` exists to
  support an admin-portal draft/review workflow described in `README.md`
  as not-yet-built — the schema and repository already accommodate it.

## Data integrity rule ("never invent")

All firm names, fees, disbursement amounts, and SDLT/LTT rates anywhere in
this repo (schema comments, test fixtures, docs) are **fictional test
data**, per a "never invent real data" rule inherited from an earlier
project stage. In particular:
- `sdlt_ltt_rate_table.source_reference` exists specifically to force a
  citation to an authoritative source (HMRC / Welsh Revenue Authority)
  before real SDLT/LTT rates go in — do not populate real rates without one.
- Test fixtures use names like `"Test Firm A (fixture)"` — never substitute
  real firm names, SRA numbers, or pricing when writing tests or seed data.

Connection strings must always come from `DATABASE_URL` (or an equivalent
env var) — never hard-code credentials, per `src/db/client.ts`'s own
`createDb` guard, which throws if no connection string is supplied.
