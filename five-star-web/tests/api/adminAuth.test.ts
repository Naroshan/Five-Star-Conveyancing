import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { sql } from "kysely";
import { TOTP, Secret } from "otpauth";
import { db } from "@/lib/db";
import { provisionAdminUser } from "five-star-conveyancing-quote-engine/auth/provisioning";
import { createSession, validateSession } from "five-star-conveyancing-quote-engine/auth/session";
import { POST as logoutRoute } from "@/app/api/admin/logout/route";
import { POST as mfaBeginRoute } from "@/app/api/admin/mfa/begin/route";
import { POST as mfaConfirmRoute } from "@/app/api/admin/mfa/confirm/route";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminSession";
import { createMockCookieStore } from "../testUtils/mockCookies";

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

describe("admin auth routes: logout and MFA enrollment", () => {
  const cookieStore = createMockCookieStore();

  beforeEach(async () => {
    cookieStore._jar.clear();
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(cookieStore);
    await sql`truncate table admin_sessions, audit_log, admin_users restart identity cascade`.execute(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe("POST /api/admin/logout", () => {
    it("destroys the session server-side and clears the cookie", async () => {
      const user = await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });
      const session = await createSession(db, user.userId);
      cookieStore.set(ADMIN_SESSION_COOKIE_NAME, session.sessionId);

      const response = await logoutRoute();
      expect(response.status).toBe(200);
      expect(cookieStore._jar.has(ADMIN_SESSION_COOKIE_NAME)).toBe(false);

      // The session itself must actually be gone, not just the cookie forgotten.
      expect(await validateSession(db, session.sessionId)).toBeNull();
    });

    it("is safe to call with no active session", async () => {
      const response = await logoutRoute();
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/mfa/begin and /confirm", () => {
    it("rejects begin/confirm when not signed in", async () => {
      expect((await mfaBeginRoute()).status).toBe(401);
      expect((await mfaConfirmRoute(jsonRequest("https://example.invalid/api/admin/mfa/confirm", { code: "123456" }))).status).toBe(401);
    });

    it("issues a real usable secret, then rejects a wrong code before accepting a correct one", async () => {
      const user = await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });
      const session = await createSession(db, user.userId);
      cookieStore.set(ADMIN_SESSION_COOKIE_NAME, session.sessionId);

      const beginResponse = await mfaBeginRoute();
      const beginBody = await beginResponse.json();
      expect(beginResponse.status).toBe(200);
      expect(beginBody.secret).toBeDefined();
      expect(beginBody.otpauthUri).toContain("otpauth://totp/");

      const wrongCodeResponse = await mfaConfirmRoute(jsonRequest("https://example.invalid/api/admin/mfa/confirm", { code: "000000" }));
      expect(wrongCodeResponse.status).toBe(400);

      const totp = new TOTP({ secret: Secret.fromBase32(beginBody.secret), algorithm: "SHA1", digits: 6, period: 30 });
      const correctResponse = await mfaConfirmRoute(jsonRequest("https://example.invalid/api/admin/mfa/confirm", { code: totp.generate() }));
      expect(correctResponse.status).toBe(200);

      const row = await db.selectFrom("admin_users").select("mfa_enabled").where("user_id", "=", user.userId).executeTakeFirstOrThrow();
      expect(row.mfa_enabled).toBe(true);
    });
  });
});
