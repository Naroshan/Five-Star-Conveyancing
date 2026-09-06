// Five Star Conveyancing — POST /api/firm-recruitment — a conveyancing firm
// applying to join the panel via the "join our panel" page. Saved straight
// to the database, not routed through a third-party form notifier — the
// same "durable record first" principle as sdlt_calculator_leads and the
// main quote leads, so a genuine application is never lost to an email or
// webhook provider being down.
import { z } from "zod";
import { db } from "@/lib/db";
import { saveFirmRecruitmentLead } from "five-star-conveyancing-quote-engine/db/repository";

const bodySchema = z.object({
  contactName: z.string().trim().min(1),
  firmName: z.string().trim().min(1),
  sraOrClcNumber: z.string().trim().min(1).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(5),
  coverageArea: z.string().trim().min(1),
  message: z.string().trim().min(1).optional(),
});

export async function POST(request: Request): Promise<Response> {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json(
      { error: { message: "Please fill in your name, firm name, email, phone number, and coverage area." } },
      { status: 400 }
    );
  }

  try {
    await saveFirmRecruitmentLead(db, body);
  } catch (err) {
    console.error("saving firm-recruitment lead failed", err);
    return Response.json({ error: { message: "Something went wrong submitting your application. Please try again." } }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
