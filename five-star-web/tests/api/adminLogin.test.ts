import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { sql } from "kysely";
import { db } from "@/lib/db";
import { provisionAdminUser, beginMfaEnrollment, confirmMfaEnrollment } from "five-star-conveyancing-quote-engine/auth/provisioning";
import { TOTP, Secret } from "otpauth";
import { POST as loginRoute } from "@/app/api/admin/login/route";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminSession";
import { createMockCookieStore } from "../testUtils/mockCookies";

// The login route's rate limiter is a module-level singleton keyed by
// x-forwarded-for, so it persists across every test in a run — including
// across files, since ES modules are cached per process. Giving every
// request its own IP by default (rather than sharing the "unknown"
// fallback) means no test's attempts count against another's budget.
// Doesn't weaken the lockout test: account lockout is keyed by email in
// login(), not by IP, so varying the IP across those 5 attempts is fine.
let ipCounter = 0;
function uniqueIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

function jsonRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://example.invalid/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": uniqueIp(), ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  const cookieStore = createMockCookieStore();

  beforeEach(async () => {
    cookieStore._jar.clear();
    (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(cookieStore);
    await sql`truncate table admin_sessions, audit_log, admin_users restart identity cascade`.execute(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it("rejects a malformed JSON body with 400", async () => {
    const request = new Request("https://example.invalid/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not valid",
    });
    const response = await loginRoute(request);
    expect(response.status).toBe(400);
  });

  it("rejects a request missing email or password with 400", async () => {
    const response = await loginRoute(jsonRequest({ email: "a@fixture.test" }));
    expect(response.status).toBe(400);
  });

  it("logs in successfully and sets the session cookie for an account without MFA", async () => {
    await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });

    const response = await loginRoute(jsonRequest({ email: "alex@fixture.test", password: "a-real-password-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.user.name).toBe("Alex");
    expect(cookieStore._jar.get(ADMIN_SESSION_COOKIE_NAME)).toBeDefined();
  });

  it("returns 401 and does not set a cookie for a wrong password", async () => {
    await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });

    const response = await loginRoute(jsonRequest({ email: "alex@fixture.test", password: "wrong" }));
    expect(response.status).toBe(401);
    expect(cookieStore._jar.has(ADMIN_SESSION_COOKIE_NAME)).toBe(false);
  });

  it("returns mfa_required (200, no cookie) when the password is right but no code was given", async () => {
    const user = await provisionAdminUser(db, { name: "Rae", email: "rae@fixture.test", role: "compliance_reviewer", password: "a-real-password-123" });
    const enrollment = await beginMfaEnrollment(db, user.userId);
    const totp = new TOTP({ secret: Secret.fromBase32(enrollment.secret), algorithm: "SHA1", digits: 6, period: 30 });
    await confirmMfaEnrollment(db, user.userId, totp.generate());

    const response = await loginRoute(jsonRequest({ email: "rae@fixture.test", password: "a-real-password-123" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("mfa_required");
    expect(cookieStore._jar.has(ADMIN_SESSION_COOKIE_NAME)).toBe(false);
  });

  it("logs in successfully with a real generated TOTP code", async () => {
    const user = await provisionAdminUser(db, { name: "Rae", email: "rae@fixture.test", role: "compliance_reviewer", password: "a-real-password-123" });
    const enrollment = await beginMfaEnrollment(db, user.userId);
    const totp = new TOTP({ secret: Secret.fromBase32(enrollment.secret), algorithm: "SHA1", digits: 6, period: 30 });
    await confirmMfaEnrollment(db, user.userId, totp.generate());

    const response = await loginRoute(jsonRequest({ email: "rae@fixture.test", password: "a-real-password-123", totpCode: totp.generate() }));
    expect(response.status).toBe(200);
    expect(cookieStore._jar.has(ADMIN_SESSION_COOKIE_NAME)).toBe(true);
  });

  it("returns 423 once locked out, matching the package's lockout threshold", async () => {
    await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });

    for (let i = 0; i < 4; i++) {
      const r = await loginRoute(jsonRequest({ email: "alex@fixture.test", password: "wrong" }));
      expect(r.status).toBe(401);
    }
    const fifth = await loginRoute(jsonRequest({ email: "alex@fixture.test", password: "wrong" }));
    expect(fifth.status).toBe(423);
  });

  it("rate-limits repeated attempts from the same source", async () => {
    await provisionAdminUser(db, { name: "Alex", email: "alex@fixture.test", role: "fee_administrator", password: "a-real-password-123" });
    const headers = { "x-forwarded-for": "203.0.113.9" };

    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const r = await loginRoute(jsonRequest({ email: "alex@fixture.test", password: "wrong" }, headers));
      lastStatus = r.status;
    }
    expect(lastStatus).toBe(429);
  });
});
