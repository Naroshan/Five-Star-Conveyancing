# Deploying to Netlify

Same honesty note as `DEPLOYMENT.md`: I can't reach Netlify from this
sandbox to test this myself. This is my best guidance based on how
Netlify's Next.js Runtime works — the repo structure and database steps
I've verified directly; the exact wording of Netlify's UI, I haven't.

## What's already done for you
- `@netlify/plugin-nextjs` is installed in `five-star-web/package.json`
  and `package-lock.json` (real install, not just typed in by hand).
- `netlify.toml` is ready — put it at the root of your Git repository.
- `quote-engine/dist/` and the packed `.tgz` are already built (in the
  files I've given you) — commit them rather than gitignoring them, same
  reasoning as the Vercel guide: it means Netlify's standard `npm install`
  just finds and extracts the tarball via the existing `file:` dependency
  in `five-star-web/package.json`, no custom build orchestration needed.

## Repository structure required

```
your-repo/
├── netlify.toml              ← at the root, not inside either project
├── quote-engine/
│   ├── dist/                 ← commit this
│   ├── five-star-conveyancing-quote-engine-0.2.1.tgz   ← commit this
│   └── ...
└── five-star-web/
    └── ...
```

## Steps

1. **Get the code into a Git repo** with the structure above (see
   `DEPLOYMENT.md` Step 1 for the exact `git init`/push commands — same
   process regardless of which host you deploy to).

2. **Set up the database on a managed Postgres provider.** Netlify doesn't
   host Postgres itself, so you still need something like Neon or
   Supabase (both free to start) — see `DEPLOYMENT.md` Step 2 for the
   schema-init and seed-script commands. Same database works with either
   Netlify or Vercel; it's independent of which app host you pick.

3. **Create the Netlify site:**
   - netlify.com → "Add new site" → "Import an existing project" → connect
     GitHub → pick the repository.
   - Netlify should detect `netlify.toml` automatically and pre-fill the
     base directory, build command, and publish directory from it. If it
     shows a manual config screen instead, set: **Base directory**
     `five-star-web`, **Build command** `npm run build`, **Publish
     directory** `five-star-web/.next`.

4. **Add the environment variable.** Site configuration → Environment
   variables → add `DATABASE_URL` with your Neon/Supabase connection
   string. This is the one step that has to happen in Netlify's dashboard,
   not in any file — never commit a real connection string to the repo.

5. **Deploy.** Netlify builds and gives you a `https://<something>.netlify.app`
   URL.

## If the build fails

- **Can't resolve `five-star-conveyancing-quote-engine`** — almost
  certainly means the `.tgz` file wasn't actually committed to the repo
  (check `git status` in `quote-engine/` — build artifacts are often
  gitignored by default, so double-check `dist/` and the `.tgz` aren't
  being excluded).
- **Node version errors** — `netlify.toml` pins Node 20 explicitly
  (`NODE_VERSION = "20"`); if Netlify's using something older, check
  nothing in the site's own dashboard settings is overriding it.
- **Database connection errors at runtime** (build succeeds, but pages
  error) — check the `DATABASE_URL` environment variable is actually set
  in the Netlify dashboard and that your Postgres provider allows
  connections from Netlify's IP ranges (Neon and Supabase both allow
  external connections by default, but it's worth checking if this is the
  specific failure).

## Same caution as before

Point this at a fresh demo database (via `seed-demo-database.ts`), not
`five_star_data` — the real Ackroyd Legal data has no business being
reachable from a public URL, and none of it is approved yet regardless of
who can see it.
