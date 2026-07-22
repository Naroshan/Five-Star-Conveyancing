// Shared Kysely instance for the app. DATABASE_URL is required — see
// .env.local.example. Never hard-code a connection string here.
import { createDb } from "five-star-conveyancing-quote-engine/db/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.local.example to .env.local and configure it.");
}

export const db = createDb(connectionString);
