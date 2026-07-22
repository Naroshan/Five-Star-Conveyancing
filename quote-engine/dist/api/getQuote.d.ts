import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
export declare function getQuoteHandler(reference: string, db: Kysely<Database>): Promise<Response>;
