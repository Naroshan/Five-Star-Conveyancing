// Five Star Conveyancing — shared DATABASE_URL safety check for go-live scripts
//
// Not an allowlist of one exact production name — managed Postgres
// providers (Netlify DB, Neon, Supabase) assign their own database names,
// so a real production connection string won't reliably contain any fixed
// string like 'five_star_data'. Instead this refuses anything that looks
// like a local/demo/test database, which is the actual mistake this guard
// exists to prevent: running an approval/submission/deactivation script
// against the wrong database by accident.

const UNSAFE_DATABASE_URL_PATTERNS = ['five_star_demo', 'five_star_test', 'dryrun', 'localhost', '127.0.0.1'];

export function assertLooksLikeProductionDatabase(connectionString: string | undefined): asserts connectionString is string {
  if (!connectionString) {
    throw new Error('Set DATABASE_URL before running this script.');
  }
  const lower = connectionString.toLowerCase();
  const matched = UNSAFE_DATABASE_URL_PATTERNS.find((p) => lower.includes(p));
  if (matched) {
    throw new Error(`Refusing to run: DATABASE_URL looks like a demo/test database (matched "${matched}"), not production.`);
  }
}
