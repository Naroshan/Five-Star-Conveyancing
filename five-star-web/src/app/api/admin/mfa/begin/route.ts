import { db } from "@/lib/db";
import { getCurrentAdminUser } from "@/lib/adminSession";
import { beginMfaEnrollment } from "five-star-conveyancing-quote-engine/auth/provisioning";

export async function POST(): Promise<Response> {
  const user = await getCurrentAdminUser();
  if (!user) return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401 });
  const enrollment = await beginMfaEnrollment(db, user.userId);
  return new Response(JSON.stringify(enrollment), { status: 200, headers: { "content-type": "application/json" } });
}
