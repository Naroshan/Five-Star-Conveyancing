// Shared Kysely instance for the app.
//
// The connection string is read lazily, on first actual database use — NOT at
// module-load time. Next.js imports every route/page module during the
// "Collecting page data" build phase; throwing here at import time would fail
// the whole build on hosts (e.g. Netlify) that don't expose the database
// connection string to the build step. By deferring until the first query, the
// build can collect page data without a database, and the connection is only
// required at request time in the deployed function.
//
// Resolution order: DATABASE_URL (local/self-hosted, see .env.local.example)
// then NETLIFY_DATABASE_URL (injected automatically by Netlify's managed
// Postgres). Never hard-code a connection string here.
import { createDb } from "five-star-conveyancing-quote-engine/db/client";

let instance: ReturnType<typeof createDb> | null = null;

function getDb(): ReturnType<typeof createDb> {
  if (instance) return instance;
  const connectionString = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL (copy .env.local.example to .env.local) or provision a Netlify Database, which sets NETLIFY_DATABASE_URL automatically.",
    );
  }
  instance = createDb(connectionString);
  return instance;
}

// A Proxy so the public API is still a plain `db` value, while the underlying
// Kysely instance is created on first property access. Methods are bound to the
// real instance so Kysely's internal `this` continues to work.
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
