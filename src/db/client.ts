// Five Star Conveyancing — database client factory
//
// Connection string always comes from the environment — never hard-code
// credentials here. This is the one place NUMERIC columns are configured
// to parse as JS numbers (pg's default is string, to avoid silent precision
// loss). For a production system handling money at scale, consider a
// decimal library (e.g. decimal.js) end-to-end instead of floats; this
// module keeps plain numbers for consistency with the calculation engine
// built in Module 1.

import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.js';

pg.types.setTypeParser(1700, (value: string) => parseFloat(value)); // numeric -> number

export function createDb(connectionString: string): Kysely<Database> {
  if (!connectionString) {
    throw new Error(
      'A database connection string is required. Set DATABASE_URL — never hard-code credentials in source.'
    );
  }
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString }),
    }),
  });
}
