import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { login, InvalidCredentialsError, AccountLockedError, MfaRequiredError } from "five-star-conveyancing-quote-engine/auth/login";
import { RateLimiter } from "five-star-conveyancing-quote-engine/api/rateLimiter";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminSession";

// Deliberately stricter than the public quote rate limiter — this endpoint
// verifies passwords, so it's the obvious target for a brute-force attempt.
const loginRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function POST(request: Request): Promise<Response> {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!loginRateLimiter.checkLimit(key)) {
    return jsonResponse({ error: "Too many attempts. Please wait a moment and try again." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Malformed request." }, 400);
  }
  const { email, password, totpCode } = (body ?? {}) as { email?: string; password?: string; totpCode?: string };
  if (typeof email !== "string" || typeof password !== "string") {
    return jsonResponse({ error: "Email and password are required." }, 400);
  }

  try {
    const result = await login(db, email, password, totpCode || undefined, request.headers.get("user-agent") ?? undefined);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: result.expiresAt,
    });
    return jsonResponse({ status: "ok", user: { name: result.user.name, role: result.user.role } }, 200);
  } catch (err) {
    if (err instanceof MfaRequiredError) {
      return jsonResponse({ status: "mfa_required" }, 200);
    }
    if (err instanceof AccountLockedError) {
      return jsonResponse({ error: err.message }, 423);
    }
    if (err instanceof InvalidCredentialsError) {
      return jsonResponse({ error: err.message }, 401);
    }
    console.error("login failed", err);
    return jsonResponse({ error: "Something went wrong signing you in." }, 500);
  }
}
