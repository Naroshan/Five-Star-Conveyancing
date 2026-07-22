// Real session lookup — replaces the earlier dev-only identity picker.
// The cookie holds an opaque session_id only; validateSession looks it up
// against admin_sessions server-side (expiry, account status, malformed
// input all handled there — see the package's own tests for that).
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { validateSession } from "five-star-conveyancing-quote-engine/auth/session";
import type { AdminUser } from "five-star-conveyancing-quote-engine/types";

const COOKIE_NAME = "admin_session_id";

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  return validateSession(db, sessionId);
}

/** Stage 1 requires MFA for every admin role — this checks it's actually turned on, not just theoretically available. */
export async function isMfaEnabledFor(userId: string): Promise<boolean> {
  const row = await db.selectFrom("admin_users").select("mfa_enabled").where("user_id", "=", userId).executeTakeFirst();
  return row?.mfa_enabled ?? false;
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE_NAME };
