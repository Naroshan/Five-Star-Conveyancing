import { Kysely } from 'kysely';
import type { Database } from './schema.js';
export declare function createDb(connectionString: string): Kysely<Database>;
