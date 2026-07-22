import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { sql } from "kysely";
import { db } from "@/lib/db";
import { provisionAdminUser, beginMfaEnrollment, confirmMfaEnrollment } from "five-star-conveyancing-quote-engine/auth/provisioning";
import { createSession } from "five-star-conveyancing-quote-engine/auth/session";
import { TOTP, Secret } from "otpauth";
import { getCurrentAdminUser, isMfaEnabledFor, ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminSession";
import { createMockCookieStore } from "../testUtils/mockCookies";

describe("adminSession helpers", () => {
  const cookieStore = createMockCookieStore();

  beforeEach(async () => {
    cookieStore._jar.clear();
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(cookieStore);
    await sql`truncate table admin_sessions, audit_log, admin_users restart identity cascade`.execute(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe("getCurrentAdminUser", () => {
    it("returns null with no cookie set", async () => {
      expect(await getCurrentAdminUser()).toBeNull();
    });

    it("returns the user for a valid session cookie", async () => {
      const user = await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });
      const session = await createSession(db, user.userId);
      cookieStore.set(ADMIN_SESSION_COOKIE_NAME, session.sessionId);

      const result = await getCurrentAdminUser();
      expect(result?.name).toBe("Alex");
      expect(result?.role).toBe("fee_administrator");
    });

    it("returns null for a garbage cookie value rather than throwing", async () => {
      cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "'; DROP TABLE admin_users; --");
      expect(await getCurrentAdminUser()).toBeNull();
    });
  });

  describe("isMfaEnabledFor", () => {
    it("returns false for an account that has not enrolled", async () => {
      const user = await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });
      expect(await isMfaEnabledFor(user.userId)).toBe(false);
    });

    it("returns false while enrollment is in progress but not yet confirmed", async () => {
      const user = await provisionAdminUser(db, { name: "Rae", email: "rae@fixture.test", role: "compliance_reviewer", password: "a-real-password-123" });
      await beginMfaEnrollment(db, user.userId);
      expect(await isMfaEnabledFor(user.userId)).toBe(false);
    });

    it("returns true once enrollment is confirmed", async () => {
      const user = await provisionAdminUser(db, { name: "Rae", email: "rae@fixture.test", role: "compliance_reviewer", password: "a-real-password-123" });
      const enrollment = await beginMfaEnrollment(db, user.userId);
      const totp = new TOTP({ secret: Secret.fromBase32(enrollment.secret), algorithm: "SHA1", digits: 6, period: 30 });
      await confirmMfaEnrollment(db, user.userId, totp.generate());
      expect(await isMfaEnabledFor(user.userId)).toBe(true);
    });
  });
});
