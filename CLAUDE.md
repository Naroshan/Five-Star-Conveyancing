# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This is a monorepo with two npm projects as siblings, plus root-level
deploy config:

```
/
  netlify.toml, NETLIFY.md, DEPLOYMENT.md   <- deploy config/guides (see below)
  quote-engine/    <- calculation engine, DB/repository layer, API handlers,
                       admin workflow, auth, results-UI components — packaged
                       as an npm package consumed by five-star-web/
  five-star-web/    <- Next.js 16 / React 19 frontend (public quote flow + admin)
```

`five-star-web/package.json` depends on `quote-engine` via a `file:` path
to a **committed, pre-built tarball**:
`quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz` (built from
`quote-engine/dist/`, also committed). This is deliberate, not an oversight
— see "Why the tarball is committed" below.

## Commands

**`quote-engine/`** (run from inside that directory):
```bash
npm install
npm run build                  # tsc -p tsconfig.build.json -> dist/
npm run typecheck              # tsc --noEmit
npm test                       # unit tests — no database needed
npm run test:integration       # repository/api/admin/auth integration tests — needs DATABASE_URL, run single-threaded
npm run import:ackroyd-legal   # loads real Ackroyd Legal fee data as 'draft' rows — needs DATABASE_URL
npm run verify:draft-safety    # asserts no non-draft real quotes exist yet
```

**`five-star-web/`** (run from inside that directory):
```bash
npm install
npm install ../quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz  # re-run after rebuilding the tarball
npm run dev / build / start
npm run lint
npm test                       # vitest
```

Integration tests need a disposable Postgres database with `schema.sql` applied:
```bash
createdb five_star_test   # or five_star_demo for the seed script
psql -d five_star_test -f quote-engine/schema.sql
DATABASE_URL="postgres://user:pass@localhost:5432/five_star_test" npm run test:integration
```
Integration test files self-skip when `DATABASE_URL` is unset, so the plain
unit-test run must never require a database. **Never point `DATABASE_URL`
at a real/production database** — the integration suites truncate core
tables in `beforeEach`.

To run the whole thing locally end-to-end (build package → install into
web app → seed a demo DB → `npm run dev`), see `DEPLOYMENT.md` Part 1 — it's
been verified end-to-end, unlike Part 2 (Vercel+Neon) and `NETLIFY.md`,
which are documented but not tested against a live deployment from this
environment.

## Architecture

**Domain flow:** `quote-engine/schema.sql` (Postgres) →
`quote-engine/src/db/schema.ts` (Kysely snake_case row types) →
`quote-engine/src/db/repository.ts` (maps rows to camelCase domain types
from `src/types.ts`) → `quote-engine/src/quoteEngine.ts` (eligibility →
base fee → supplements → disbursements → SDLT → VAT → totals → audit
trail) → `quote-engine/src/api/*` (Zod-validated handlers, wired into
`five-star-web/src/app/api/**/route.ts`) → `quote-engine/src/components/QuoteResults/*`
(results UI, re-exported into `five-star-web`).

- **Two type systems, one boundary.** `src/db/schema.ts` types are
  snake_case and match the database exactly; nothing outside `src/db/`
  should import them directly. `src/types.ts` defines the camelCase
  domain types everything else works with. `src/db/repository.ts` is the
  *only* place that translates between the two (see its `map*` functions).
- **Filtering responsibility is split deliberately.** The repository layer
  does *not* filter by `approval_status`, `effective_date`, or
  `expiry_date` when loading fee rules/bands/disbursements — it fetches
  everything on file for a firm+transaction type. That filtering is left to
  the calculation engine, which already does it per-rule. Don't "fix" this
  by adding WHERE clauses to the repository — it would duplicate logic and
  risk the two layers disagreeing.
  - `loadActiveFirmRuleSets` is the exception: it filters at the SQL level
    on `firms.status = 'active'` and `firm_transaction_types.accepted =
    true`, because "suspended firms never appear in results" is meant to
    be enforced at the query level, not just in application logic.
- **`quote_results.eligibility_status`** is `'eligible' | 'excluded_with_reason'`
  — firms are never silently hidden from results; an excluded firm is
  persisted with a reason instead. `saveQuoteResults` writes `null` for
  `legal_fee_subtotal`/`vat_amount`/`disbursements_total` when excluded.
- **`calculation_audit` is a jsonb column**, round-tripped verbatim through
  `saveQuoteResults`/`getQuoteByReference` so any historical quote can be
  reconstructed later.
- **Draft → review → approve workflow.** `fee_value_bands`, `fee_rules`,
  and `disbursement_rules` all carry `approval_status` (`draft →
  pending_review → approved → rejected`). Writes go through
  `quote-engine/src/admin/{feeRuleAdmin,feeValueBandAdmin,disbursementRuleAdmin}.ts`,
  which enforce the state machine and write `quote-engine/src/admin/auditLog.ts`
  entries; the calculation engine only ever reads `approved` rows. The
  Next.js admin screens under `five-star-web/src/app/admin/**` are the UI
  for this.
- **Auth** (`quote-engine/src/auth/*`): bcrypt password hashing, TOTP MFA
  (`otpauth`), revocable server-side sessions (not stateless signed
  cookies — see `session.ts` comments for why). `five-star-web/src/lib/adminSession.ts`
  and the `/admin/login`, `/admin/mfa-setup` routes are the frontend side.
- **Numeric handling:** `src/db/client.ts` overrides `pg`'s default numeric
  type parser (OID 1700) to return JS `number` instead of `string`. This is
  a deliberate simplification, not a production recommendation — a decimal
  library end-to-end would be more correct for money at scale.
- **Dates:** `fee_value_bands`, `fee_rules`, and `disbursement_rules` use
  `date`-only columns; `repository.ts`'s `toDateOnlyString`/
  `toDateOnlyStringOrNull` helpers normalize these to `'YYYY-MM-DD'`
  strings regardless of whether `pg` hands back a `Date` or a string.

## Why the tarball is committed

`five-star-web/package.json` depends on `quote-engine` via
`file:../quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz`.
Both `quote-engine/dist/` (the build output) and that `.tgz` (its packed
form) are **committed, not gitignored** — this is intentional so that a
plain `npm install` in `five-star-web/` resolves the dependency with zero
custom build orchestration, which matters for Netlify's build (see
`netlify.toml` / `NETLIFY.md`). If you change anything under
`quote-engine/src/`, you must rebuild and re-pack before the web app will
see the change:
```bash
cd quote-engine && npm run build && npm pack
cd ../five-star-web && npm install ../quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz
```
Don't add `quote-engine/dist/` or the `.tgz` to `.gitignore` — that would
silently break the web app's install.

## Real data: Ackroyd Legal

`quote-engine/scripts/import-ackroyd-legal.ts` loads Ackroyd Legal's real
published fee scale (SRA 554585) — transcribed from a client-supplied
spreadsheet, not invented. This is the one legitimate exception to "never
invent real data" below: it's genuine real-world data, but it's loaded
entirely as `draft` rows via the same admin workflow as everything else,
and the calculation engine only reads `approved` rows — so it has no
effect on live quotes until a compliance reviewer approves it.
`quote-engine/scripts/verify-no-real-quotes-yet.ts` asserts this hasn't
happened yet. Several items from the source sheet are deliberately *not*
loaded pending clarification — see the comments at the top of the import
script. VAT treatment per item is an assumption (flagged in each row's
`client_facing_explanation`) since the source sheet didn't state it.

## Data integrity rule ("never invent")

Outside of the Ackroyd Legal import above, all firm names, fees,
disbursement amounts, and SDLT/LTT rates anywhere in this repo (schema
comments, test fixtures, seed/demo data, docs) are **fictional test
data** — never substitute real firm names, SRA numbers, or pricing when
writing tests, seed data, or docs.
- `sdlt_ltt_rate_table.source_reference` exists specifically to force a
  citation to an authoritative source (HMRC / Welsh Revenue Authority)
  before real SDLT/LTT rates go in.
- `quote-engine/scripts/seed-demo-database.ts` creates demo admin accounts
  with hardcoded demo-only passwords (`DemoAuthor2026Password` etc.) —
  fine for a disposable local/demo database, never reuse these for
  anything real.

Connection strings must always come from `DATABASE_URL` (or an equivalent
env var) — never hard-code credentials, per `src/db/client.ts`'s own
`createDb` guard, which throws if no connection string is supplied. Real
`.env.local` files are gitignored; only `.env.local.example` (with a
placeholder connection string) is committed.

## Deploy docs

- `DEPLOYMENT.md` — Part 1 (run locally) is verified end-to-end; Part 2
  (Vercel + Neon) is documented but not tested against a live deployment.
- `NETLIFY.md` / `netlify.toml` — Netlify-specific deploy guide (root
  `netlify.toml`, `base = "five-star-web"`, `@netlify/plugin-nextjs`,
  Node 20 pinned). Also not tested against a live Netlify build. If a real
  deploy fails on something these docs didn't anticipate, treat the error
  as authoritative over the docs.
- Both guides are explicit that `DATABASE_URL` must be set in the host's
  own dashboard/environment, never committed, and that any live/shared
  deployment should point at a demo database seeded via
  `seed-demo-database.ts` — not a database containing the real Ackroyd
  Legal import.
