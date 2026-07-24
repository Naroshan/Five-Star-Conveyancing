# Five Star Conveyancing — web app

The first real, browsable site (Stage 6, Module 8). A production Next.js
16 App Router application consuming `five-star-conveyancing-quote-engine`
as a real npm package dependency (packed and installed from the sibling
`quote-engine` project — not copy-pasted source, not a symlink; see "A
build issue I hit" below for why).

**Verified working end-to-end**, not just "it compiles": `npm run build`
succeeds (6 routes, 2 static + 4 dynamic), and I ran the actual production
server and hit it with real HTTP requests — `POST /api/quotes` correctly
calculated and persisted a two-firm comparison, and the results page's raw
server-rendered HTML (fetched with `curl`, no JavaScript executed) contains
the real firm names and prices, confirming this isn't only working when a
browser runs client JS.

## Pages

- `/` — homepage
- `/get-a-quote` — purchase quote form (client component; universal fields
  plus a subset of the supplement flags the demo/real data actually uses)
- `/api/quotes` (POST) — wraps `createQuoteHandler` from the package
- `/api/quotes/[reference]` (GET) — wraps `getQuoteHandler`
- `/quote/results/[reference]` — **Server Component**, not client-fetched.
  Calls `getQuoteHandler` directly as a function (no self-HTTP-call — this
  app already runs server-side) so firm data is in the initial HTML.
  Interactivity (sort, filter, expand, the action buttons) lives in a small
  client-component wrapper, `ResultsInteractive.tsx`, kept as thin as
  possible around the actual `QuoteResultsList` from the package.
- `/quote/results/[reference]` for an unknown reference calls Next's
  `notFound()` and renders a branded 404 page — not the framework default.
- `/admin` — redirects based on real auth state (login, MFA setup, or the
  fee-rules queue) — see Module 9 below, not a fake picker anymore.
- `/admin/login`, `/admin/mfa-setup` — real password + TOTP sign-in and
  enrollment. Module 9, below.
- `/admin/fee-rules`, `/admin/fee-bands`, `/admin/disbursements` —
  pending-review queues for all three commercial-rule tables (Module 11),
  each using the real, tested `listPending*Approvals` functions from the
  package. A user without approve permission sees a clear "your role
  doesn't include this" message rather than an empty list or a crash.
- `/admin/fee-rules/[id]`, `/admin/fee-bands/[id]`,
  `/admin/disbursements/[id]` — detail views with real Approve/Reject
  actions (Next.js Server Actions calling the package's approve/reject
  functions directly), plus the full audit history for that record.

## Real authentication (Module 9)

The dev-only identity picker described in earlier drafts of this README is
gone. `/admin` now requires a real password, and MFA (TOTP, any
authenticator app) is enforced — not just available — before the admin area
is reachable at all.

- `admin_users` gained `password_hash` (bcrypt), `mfa_secret`,
  `account_status`, `failed_login_attempts`, and `locked_until`. A new
  `admin_sessions` table backs sessions server-side (individually
  revocable, not a stateless signed cookie).
- `five-star-conveyancing-quote-engine/auth/*` — `password.ts` (bcryptjs
  hashing, plus a precomputed dummy hash so a nonexistent-email login
  takes roughly the same time as a wrong-password one), `totp.ts`
  (otpauth-based TOTP generation/verification), `session.ts`
  (create/validate/destroy, with a UUID-format check before ever querying
  — see the bug note below), `login.ts` (orchestrates password + lockout +
  MFA into one flow with distinct error types), `provisioning.ts` (account
  creation and MFA enrollment — no self-service signup by design).
- `/admin/login` — real email/password form, reveals an MFA code field
  when the API reports one is needed.
- `/admin/mfa-setup` — enrollment flow: generates a secret, shows it for
  manual entry into an authenticator app (no QR rendering here), requires
  a real generated code before switching MFA on.
- Every protected admin page checks both "is there a valid session" *and*
  "does this account have MFA enabled" — an account without MFA is
  redirected to enrollment before it can reach anything, not just nagged.
- Account lockout after 5 failed attempts (15 minutes), verified via
  `curl` down to the exact attempt count (4× 401, 5th flips to 423, and a
  *correct* password is then also rejected with 423 until it clears).

**A real bug caught while building this, not after**: `validateSession`
originally crashed with a raw Postgres error on a malformed session ID
(the column is `uuid`, and Postgres throws rather than returning no rows
for a non-UUID string) — a real risk given a session ID comes straight
from a cookie an attacker could tamper with. Fixed with an explicit
UUID-format check before the value ever reaches a query, and covered by a
dedicated test.

**One nuance worth knowing, not a bug**: enabling MFA doesn't retroactively
invalidate an *already-open* session from before enrollment — MFA is
checked at login time, not on every request. Standard behaviour for
session-based auth, but worth being deliberate about rather than
discovering by surprise.

**Verified with real HTTP requests against a real running server** (unlike
the Approve/Reject buttons in Module 8, this was fully testable — login is
a plain API route, not a Server Action): wrong password → 401; unauthenticated
access to `/admin/fee-rules` → 307 to login; correct password with no MFA
enrolled → login succeeds but every admin page then redirects to
`/admin/mfa-setup` instead of granting access; MFA enrollment (wrong code
rejected with 400, then a real TOTP code generated from the returned
secret correctly confirms it); full password+TOTP login for an
MFA-enrolled account, using a genuinely generated code, reaching the real
pending-approval queue; logout, then confirming the same session cookie no
longer works (307 again); and the full 5-attempt lockout sequence.

## What's demo vs. real, now including credentials

Demo Author (`demo-author@fixture.test` / `DemoAuthor2026Password`, no MFA
— demonstrates the enrollment-required path) and Demo Reviewer
(`demo-reviewer@fixture.test` / `DemoReviewer2026Password`, MFA already
enrolled) are seeded by `scripts/seed-demo-database.ts`, which prints the
Reviewer's MFA secret to the console so it can be added to a real
authenticator app. **These are fictional demo credentials, safe to share,
never to be reused for anything real** — the same "(DEMO)" labeling
principle as the firm data applies to the accounts too.

## What I could verify vs. what I'm reporting on trust

The Approve/Reject buttons on the fee-rule detail page are still Next.js
Server Actions and still couldn't be clicked through `curl` for the same
reason as before (their wire protocol, no real browser available here) —
see Module 8's notes, unchanged by this module. Login, logout, and MFA
enrollment are now fully `curl`-verified, which the identity-picker version
never could be.

## A bug I found and fixed while building this, not after

The results page was originally a **client** component that fetched data
in a `useEffect` after mount. That worked, but it meant the initial
server-rendered HTML only ever contained "Loading your comparison..." — no
firm names, no prices, nothing a search engine or a no-JS request would
ever see. Refactored to a Server Component that fetches before rendering.
Re-verified with `curl` against the raw HTML (not just "the build passed")
that real data is actually present without executing any JavaScript.

**A second bug, found by deliberately testing the unhappy path**: my first
version of the results page checked `response.status === 404` from the
handler and conditionally rendered "not found" text — but that still
returned an HTTP 200. In the Next.js App Router, a Server Component page
returns 200 by default no matter what JSX it renders; only calling
`notFound()` (from `next/navigation`) actually sets the status. Caught by
literally curling an unknown reference and checking the status code, not
by assuming the conditional was sufficient because it compiled.

## A build issue I hit — worth understanding if you touch this later

The first attempt used `"five-star-conveyancing-quote-engine": "file:../quote-engine"` as
a dependency, which npm installs as a **symlink**. `node` and `tsc` both
resolved the package's subpath `exports` (e.g.
`five-star-conveyancing-quote-engine/api/rateLimiter`) through that symlink
correctly — but Next.js's bundler (Turbopack/webpack) did not, failing
with `Module not found` for every subpath import despite the files
genuinely existing on disk. Adding `transpilePackages` to `next.config.ts`
didn't fix it either. The fix: `npm pack` the quote-engine package into a
real `.tgz` and install *that* instead of the symlinked path — npm then
copies the package into `node_modules` rather than symlinking it, which
sidesteps the whole issue. This is also more realistic for how a real
deployment would consume this package (a built artifact, not a live
symlink into a sibling working directory).

## What's demo data vs. real data vs. not built at all

- **Demo data**: two fictional, fully **approved** firms — "Meridian
  Property Law (DEMO)" and "Northgate Conveyancing (DEMO)" — seeded by
  `scripts/seed-demo-database.ts` in the quote-engine package, which
  refuses to run unless `DATABASE_URL` contains `five_star_demo`. This is
  what `.env.local` points at by default so the app has something to show.
  **Neither firm is real. Both names say "(DEMO)" on purpose, everywhere,
  including in the raw API response.**
- **Real data**: Ackroyd Legal's actual fee scale, sitting in the separate
  `five_star_data` database — still in `draft` status, not approved, so it
  won't appear in any comparison from this app until a compliance reviewer
  approves it through the admin workflow (Module 4/6/7 in the quote-engine
  package).
- **Not built**: admin UI for `fee_value_bands` and `disbursement_rules`
  (the pattern is proven on `fee_rules` — same story as the backend
  service layer itself: build one deeply, document the extension), a web
  UI for creating new admin accounts (provisioning is real and tested, but
  currently script-only, by design — no self-service signup), password
  reset (blocked on no email provider existing yet), email delivery for
  clients (the "Email quote"/"Save quote" buttons show a visible "not
  wired up yet" message rather than silently doing nothing), client user
  accounts (none — by design, per the earlier "email-link only" decision),
  and every page from the Stage 3 sitemap other than the ones listed above
  (no firm profiles, location pages, lender pages, knowledge hub).

## Running it

```bash
# 1. Build the quote-engine package and pack it
cd quote-engine
npm install && npm run build
npm pack

# 2. Install it into the web app
cd ../five-star-web
npm install
npm install ../quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz

# 3. Configure and seed a database
cp .env.local.example .env.local   # edit DATABASE_URL
createdb five_star_demo
psql -d five_star_demo -f ../quote-engine/schema.sql
DATABASE_URL="postgres://user:pass@localhost:5432/five_star_demo" \
  npx tsx ../quote-engine/scripts/seed-demo-database.ts

# 4. Run it
npm run dev      # http://localhost:3000
# or
npm run build && npm run start
```

To run this app's own test suite (needs a Postgres database — `five_star_test` works fine, same one the package uses):

```bash
DATABASE_URL="postgres://user:pass@localhost:5432/five_star_test" npm test
```

To try the admin review flow: visit `/admin/login` and sign in as Demo
Reviewer (`demo-reviewer@fixture.test` / `DemoReviewer2026Password`) — the
seed script prints her MFA secret to the console, so add it to an
authenticator app first, or generate a code from it directly:
`npx tsx -e "import {TOTP,Secret} from 'otpauth'; console.log(new TOTP({secret:Secret.fromBase32('<secret>'),algorithm:'SHA1',digits:6,period:30}).generate())"`.
Once signed in, `/admin/fee-rules` has one supplement rule genuinely
pending — something real to approve or reject.

## Module 10 — automated tests for this app itself

Everything up to now was verified by hand, with real `curl` requests
against a real running server — genuinely verified, but not repeatable
without me (or you) re-running a long sequence of commands every time
something changes. This module adds a real, automated test suite for the
app's own code (not the underlying package, which already had 100 tests):

- `vitest.config.ts` + `tests/testUtils/setup.ts` — mocks `next/headers`'s
  `cookies()`, which requires the App Router's request-scoped async context
  and throws outside a real request. Standard practice for testing Next.js
  route handlers without a running server; each test swaps in its own
  in-memory cookie jar (`tests/testUtils/mockCookies.ts`).
- `tests/api/adminLogin.test.ts` — 8 tests: malformed/missing input,
  successful login (and the cookie is actually set, not just a 200),
  wrong password (and the cookie is *not* set), `mfa_required` returned
  correctly with no cookie, a full login with a real generated TOTP code,
  lockout at the same threshold as the package's own tests, and the login
  rate limiter actually returning 429.
- `tests/api/adminAuth.test.ts` — 4 tests: logout destroys the session
  server-side (not just clears the cookie — re-validated against the
  database, not assumed), logout is safe to call with nothing to log out
  of, MFA begin/confirm reject an unauthenticated caller, and the full
  enrollment sequence (wrong code rejected, real generated code accepted).
- `tests/lib/adminSession.test.ts` — 6 tests on `getCurrentAdminUser` and
  `isMfaEnabledFor` directly, including a garbage cookie value (a SQL
  injection attempt string, specifically) returning `null` rather than
  throwing — exercising the same UUID-format guard fixed in the package's
  `validateSession`, now proven at this app's own integration point too.

**18 tests, all passing on the first full run** — this is real coverage
of the app-specific logic (cookie handling, route wiring, error-status
mapping) that the package's own tests couldn't reach, since that logic
doesn't exist until it's wired into Next.js route handlers.

**Shared test database, worth knowing**: these tests use `five_star_test`
— the same disposable database the `quote-engine` package's own integration
tests use, truncated in each suite's `beforeEach`. Fine run sequentially
(as done here); if this ever runs in CI alongside the package's own tests
in parallel, they'd need to either serialize or point at separate
databases to avoid racing on the same truncated tables.

## Module 11 — admin review UI completed for all three rule tables

Module 8 (in the `quote-engine` package) shipped `getFeeValueBandById` and
`getDisbursementRuleById`; this module is what actually uses them.
`/admin/fee-bands` and `/admin/disbursements` mirror `/admin/fee-rules`
exactly — same list/detail/approve/reject/audit-history shape — plus a
shared `AdminNav` component so moving between all three queues doesn't
require going back through `/admin`.

**A real test-isolation bug caught by running the suite together, not one
file at a time**: the login route's rate limiter is a module-level
singleton, so every test hitting `/api/admin/login` without an explicit
IP shared the same "unknown" bucket. In isolation, `adminLogin.test.ts`
passed cleanly; run as part of the full suite, the lockout test started
failing intermittently — an earlier test's attempts had already eaten into
its rate-limit budget, so it hit 429 instead of the 423 it was testing
for. Fixed by giving every request a unique IP by default (a module-level
counter), which doesn't weaken the lockout test at all — account lockout
in `login()` is keyed by email, not IP. Verified deterministic across 3
repeated full-suite runs afterward, not assumed fixed from one green run.

**The actual point of building this, verified against real data, not just
demo data**: provisioned a real `compliance_reviewer` account against the
real `five_star_data` database, enrolled its MFA through the actual
production login flow, submitted Ackroyd Legal's 67 draft records for
review (see Module 9 in the `quote-engine` README — they'd been sitting in
`draft`, invisible to any queue, since creating a draft and submitting it
are deliberately separate steps), and confirmed via `curl` that
`/admin/fee-bands` and `/admin/disbursements` now show the real value
bands and disbursements — matching the source spreadsheet's actual
figures (£1,000, £1,200, £1,300... exactly) — genuinely reviewable through
the real UI. Nothing has been approved; that's still a separate, deliberate
act for whoever holds that role for real.

18 tests still pass (no new app-level tests added in this module — the
new pages reuse already-tested package functions; the valuable new
coverage was the bug fix to the existing suite, not new test files).

## What's next

- Admin user-management UI (create/suspend accounts, force MFA
  re-enrollment) — provisioning exists and is tested, just not exposed in
  the UI yet.
- Move the login rate limiter to shared infrastructure (Redis/Upstash) —
  same in-memory caveat as the public quote rate limiter, more important
  here since this endpoint verifies passwords.
- Wire the remaining quote-flow fields (the full Stage 1 question set, not
  just the subset implemented here).
- Admin capabilities from Stage 2 not yet covered by any of the three
  review queues: firm CRUD, location/lender content management.
- Firm profile, location, lender, and knowledge-hub pages.
- Real email delivery for "Email quote", the saved-quote resume flow, and
  password reset.
- Tests for the remaining pages/components in this app not yet covered
  (the quote flow form, the results page, the fee-rule/fee-band/
  disbursement review UIs themselves — Module 10 covers the auth surface
  specifically, not everything).
