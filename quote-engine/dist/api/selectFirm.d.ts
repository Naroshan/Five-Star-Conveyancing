import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
export declare function selectFirmHandler(reference: string, request: Request, db: Kysely<Database>): Promise<Response>;
