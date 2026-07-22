# Deploying to Netlify

## Repo layout this config assumes

```
/                     <- repo root (this file and netlify.toml live here)
  netlify.toml
  NETLIFY.md
  quote-engine/        <- database schema + repository layer (this repo's current content)
  five-star-web/        <- Next.js frontend that consumes quote-engine (NOT YET PRESENT in this repo)
```

`netlify.toml` sits at the repo root as a sibling to both `quote-engine/`
and `five-star-web/` — not inside either one. Netlify always checks out the
whole repo (unlike some other platforms, there's no "include outside root
directory" toggle to worry about), so `base = "five-star-web"` tells it
where to run the build from.

## Status

**`five-star-web/` does not exist in this repo yet.** This `netlify.toml`
and this guide are scaffolded ahead of that hand-over, per the brief. Once
`five-star-web/` is added:

- Its `package.json` needs `@netlify/plugin-nextjs` installed (`npm install
  --save-dev @netlify/plugin-nextjs` from inside `five-star-web/`) so the
  lockfile and `package.json` are accurate — don't hand-edit the plugin
  version into `package.json` without running the install.
- If `five-star-web/` depends on `quote-engine/` as a package (e.g. via a
  packed `.tgz`), that tarball needs to be **committed**, not gitignored —
  Netlify's plain `npm install` has no custom build command to rebuild it
  on the fly, so the tarball must already be sitting in the repo for
  `npm install` to resolve the dependency.

## Steps once five-star-web/ is in place

1. Confirm `five-star-web/package.json` lists `@netlify/plugin-nextjs` as a
   dependency (installed via npm, not hand-typed) and that its lockfile is
   committed.
2. Confirm the `quote-engine` dependency (if consumed as a package) points
   at the committed `.tgz`, and that the `.tgz` is fresh — rebuild and
   recommit it if `quote-engine/` changed since it was last packed.
3. Push to the branch Netlify is watching, or connect the repo in the
   Netlify UI: Add new site → Import an existing project → pick this repo.
   Netlify will read `netlify.toml` from the root automatically.
4. Set any required environment variables (e.g. `DATABASE_URL` for
   server-side rendering that hits the database) in Netlify's Site
   settings → Environment variables — never commit them to `netlify.toml`
   or the repo.
5. Trigger a deploy and check the build log. `base = "five-star-web"`
   means all build commands run with that directory as the working
   directory, so paths in `package.json` scripts should be relative to
   `five-star-web/`, not the repo root.

## Troubleshooting

- **"Module not found: quote-engine"** — the `.tgz` either isn't committed
  or is stale relative to `package.json`'s reference to it. Rebuild the
  tarball from `quote-engine/` and commit the new one.
- **Build succeeds but `@netlify/plugin-nextjs` isn't applied** — check
  that the plugin is declared both in `five-star-web/package.json`
  (installed as a dependency) and in this root `netlify.toml`'s
  `[[plugins]]` block; Netlify needs the package resolvable from
  `base = "five-star-web"`.
- **Netlify can't find `netlify.toml`** — it must be at the repo root, not
  inside `quote-engine/` or `five-star-web/`.

## Caveat

This guide documents the intended structure and Netlify's documented
build behavior — it has not been verified against an actual live Netlify
build from this repo, since `five-star-web/` isn't present yet to test
against. If the real build fails on something once `five-star-web/` is
added, paste the error and it'll get fixed from what's actually happening
rather than guessed at again.
