import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { destroySession } from "five-star-conveyancing-quote-engine/auth/session";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminSession";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (sessionId) await destroySession(db, sessionId);
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
  return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { "content-type": "application/json" } });
}
