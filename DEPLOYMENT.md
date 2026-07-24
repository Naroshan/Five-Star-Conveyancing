# Deploying Five Star Conveyancing — a guide, not a done deal

I can't deploy this myself — this sandbox has no network access to any
hosting provider, only package registries. Everything below requires you
to actually do the account-creation and click-deploy steps. What I've done
is prepare it so those steps are as few and as clear as possible.

**Important honesty note:** Part 1 (running locally) is something I've
built and verified myself, repeatedly, end to end. Part 2 (Vercel + Neon)
is my best guidance based on how these platforms work — I have *not* been
able to test it against a real Vercel deployment from this sandbox, since
I can't reach it. Treat the exact settings as a strong starting point, not
a guarantee; if something doesn't match Vercel's current UI exactly, the
underlying idea (get both projects' code available, build the package
first, then build the app) is what matters.

---

## Part 1 — run it yourself, right now (fastest way to actually click through it)

You'll need Node.js 20+ and PostgreSQL installed locally.

```bash
# 1. Build the quote-engine package and pack it into an installable tarball
cd quote-engine
npm install
npm run build
npm pack

# 2. Install it into the web app
cd ../five-star-web
npm install
npm install ../quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz

# 3. Set up a database with demo data (never point this at anything you'd call "real")
createdb five_star_demo
psql -d five_star_demo -f ../quote-engine/schema.sql
cp .env.local.example .env.local
# edit .env.local: DATABASE_URL=postgres://<you>@localhost:5432/five_star_demo
DATABASE_URL="postgres://<you>@localhost:5432/five_star_demo" \
  npx tsx ../quote-engine/scripts/seed-demo-database.ts

# 4. Run it
npm run dev
```

Then visit `http://localhost:3000`. The seed script prints demo login
credentials for the admin area, including an MFA secret for the account
that has it enrolled — see both READMEs for details.

---

## Part 2 — a real shareable link (Vercel + Neon, both free to start)

### Why this combination
Vercel is built by the Next.js team and has the best support for this
exact framework. Neon is a managed Postgres provider with a genuinely free
tier and no credit card required to start. Neither requires you to give me
any credentials — you create both accounts yourself.

### Step 1 — get the code into a Git repository
Both `quote-engine/` and `five-star-web/` need to sit as sibling folders in
the *same* repository (Vercel deploys from Git, and the web app's
dependency on the package needs both present at build time). If you don't
already have this in a repo:

```bash
mkdir five-star-conveyancing && cd five-star-conveyancing
mv /path/to/quote-engine .
mv /path/to/five-star-web .
git init
git add .
git commit -m "Initial commit"
```

Push this to a new GitHub repository (create it empty on github.com first,
then `git remote add origin <url> && git push -u origin main`).

**One deliberate exception to normal practice:** commit the built
`quote-engine/dist/` folder and the packed
`quote-engine/five-star-conveyancing-quote-engine-0.2.1.tgz` file, even
though build output is usually gitignored. This means Vercel's default
`npm install` step just finds the tarball already there and extracts it —
no custom build command needed. The tradeoff: if you change
`quote-engine`'s source later, you need to re-run `npm run build && npm
pack` there and commit the results again before redeploying. Worth it for
how much simpler it makes the Vercel side.

### Step 2 — set up the database on Neon
1. Create a free account at neon.tech, create a new project.
2. In Neon's SQL editor, paste and run the entire contents of
   `quote-engine/schema.sql`.
3. Copy the connection string Neon gives you (starts `postgres://...`).
4. From your own machine (needs Node.js locally for this one-time step),
   run the demo seed script against it:
   ```bash
   cd quote-engine
   DATABASE_URL="<your Neon connection string>" npx tsx scripts/seed-demo-database.ts
   ```

### Step 3 — create the Vercel project
1. Create a free account at vercel.com, connect your GitHub account.
2. "Add New Project" → select the repository from Step 1.
3. **Root Directory**: set this to `five-star-web` (not the repo root —
   this is where `next.config.ts` lives).
4. Framework Preset should auto-detect as Next.js. Leave Build/Install
   commands as default.
5. **Environment Variables**: add `DATABASE_URL` with the Neon connection
   string from Step 2.
6. Deploy.

If the build fails specifically on resolving
`five-star-conveyancing-quote-engine`, the most likely cause is Vercel not
including the sibling `quote-engine/` folder in the build context — look
for a "Root Directory" setting called something like "Include files outside
the Root Directory" and enable it. This is the one step I'm least certain
about the exact current wording for, since I can't see Vercel's live UI.

### What you'll get
A real `https://<something>.vercel.app` URL, showing the same demo data
(clearly labeled "(DEMO)") you've already seen in this conversation —
genuinely running, genuinely clickable, on infrastructure that persists
after this conversation ends (unlike everything in this sandbox).

**Do not point this deployment at the real Ackroyd Legal data** by using
the `five_star_data` database instead of a fresh demo one — that data has
no business being reachable from a public URL with no real access control
in front of it beyond the admin login itself, and nothing on it is
approved yet regardless.

---

## After that — developing from a real deployment

Once you have a live URL, the natural loop is: I keep building/fixing
locally in this sandbox exactly as before, you pull and redeploy (or I can
walk you through connecting Vercel to auto-deploy on every push to your
GitHub repo, which is one checkbox in its settings) to see changes reflected
on the real URL. Let me know if you'd like me to set up that tighter loop,
or if you hit anything in Part 2 that doesn't match what Vercel actually
shows you — happy to troubleshoot from what you're seeing.
