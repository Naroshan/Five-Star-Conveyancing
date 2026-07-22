import { db } from "@/lib/db";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { confirmMfaEnrollment } from "five-star-conveyancing-quote-engine/auth/provisioning";
import { InvalidCredentialsError } from "five-star-conveyancing-quote-engine/auth/login";

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentAdminUser();
  if (!user) return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401 });

  const { code } = (await request.json()) as { code?: string };
  if (typeof code !== "string") {
    return new Response(JSON.stringify({ error: "A 6-digit code is required." }), { status: 400 });
  }

  try {
    await confirmMfaEnrollment(db, user.userId, code);
    return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (err) {
    const message = err instanceof InvalidCredentialsError ? err.message : "Something went wrong confirming MFA.";
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
