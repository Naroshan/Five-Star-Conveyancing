// Five Star Conveyancing — server-side sessions
// Deliberately DB-backed rather than a stateless signed/encrypted cookie:
// a session here can be individually looked up, expired, and revoked
// (e.g. "sign this admin out everywhere") without needing a secret-rotation
// event to invalidate everything at once. The cookie itself only ever
// holds an opaque session_id — no user data, no claims to trust blindly.

import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser } from '../types.js';

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface CreatedSession {
  sessionId: string;
  expiresAt: Date;
}

export async function createSession(db: Kysely<Database>, userId: string, userAgent?: string): Promise<CreatedSession> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const row = await db
    .insertInto('admin_sessions')
    .values({ user_id: userId, expires_at: expiresAt, user_agent: userAgent ?? null })
    .returning('session_id')
    .executeTakeFirstOrThrow();
  return { sessionId: row.session_id, expiresAt };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function validateSession(db: Kysely<Database>, sessionId: string | undefined | null): Promise<AdminUser | null> {
  // A session id ultimately comes from a cookie value — untrusted input
  // that could be missing, truncated, or tampered with. Postgres throws on
  // a malformed UUID rather than just finding no rows, so this needs to be
  // rejected before it ever reaches a query, not caught as a generic error.
  if (!sessionId || !UUID_PATTERN.test(sessionId)) return null;

  const row = await db
    .selectFrom('admin_sessions')
    .innerJoin('admin_users', 'admin_users.user_id', 'admin_sessions.user_id')
    .select([
      'admin_sessions.expires_at as session_expires_at',
      'admin_users.user_id',
      'admin_users.name',
      'admin_users.email',
      'admin_users.role',
      'admin_users.account_status',
    ])
    .where('session_id', '=', sessionId)
    .executeTakeFirst();

  if (!row) return null;

  if (row.session_expires_at.getTime() < Date.now()) {
    await destroySession(db, sessionId); // lazy cleanup — no cron job required
    return null;
  }
  if (row.account_status !== 'active') return null;

  await db.updateTable('admin_sessions').set({ last_used_at: sql`now()` }).where('session_id', '=', sessionId).execute();

  return { userId: row.user_id, name: row.name, email: row.email, role: row.role };
}

export async function destroySession(db: Kysely<Database>, sessionId: string): Promise<void> {
  await db.deleteFrom('admin_sessions').where('session_id', '=', sessionId).execute();
}

/** Signs out every session for a user — e.g. after a password change or a suspected compromise. */
export async function destroyAllSessionsForUser(db: Kysely<Database>, userId: string): Promise<void> {
  await db.deleteFrom('admin_sessions').where('user_id', '=', userId).execute();
}
