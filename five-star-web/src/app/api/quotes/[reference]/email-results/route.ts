// Five Star Conveyancing — POST /api/quotes/:reference/email-results — emails
// a link back to a visitor's own results page. This is the abandonment-
// recovery mechanism for the quote form: since contact details are no
// longer collected before quotes are shown (see GetAQuoteForm.tsx), someone
// who gets interrupted before selecting a firm would otherwise have no way
// back to their comparison except remembering the URL — this is an optional
// safety net for that, not a required field.
import { z } from "zod";
import { db } from "@/lib/db";
import { getQuoteByReference, setRecoveryEmailIfMissing } from "five-star-conveyancing-quote-engine/db/repository";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({ email: z.string().email() });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export async function POST(request: Request, { params }: { params: Promise<{ reference: string }> }): Promise<Response> {
  const { reference } = await params;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: { message: "A valid email address is required." } }, { status: 400 });
  }

  const quote = await getQuoteByReference(db, reference);
  if (!quote) {
    return Response.json({ error: { message: "No quote was found for that reference." } }, { status: 404 });
  }

  const resultsUrl = `${SITE_URL}/quote/results/${reference}`;

  // Saved before the email send attempt below, deliberately — same
  // reasoning as the SDLT calculator's lead capture (api/sdlt-calculator/
  // email): the whole point of this endpoint is to give a way back to a
  // quote that might otherwise be abandoned, so that shouldn't itself
  // depend on the email provider being up at that exact moment.
  try {
    await setRecoveryEmailIfMissing(db, quote.quoteId, body.email);
  } catch (err) {
    console.error("saving recovery email failed", err);
  }

  try {
    await sendEmail({
      to: body.email,
      subject: "Your conveyancing quote comparison",
      html: `<p>Hi,</p><p>Here's the link back to your quote comparison, in case you get interrupted before you're done:</p><p><a href="${resultsUrl}">${resultsUrl}</a></p><p>It'll stay valid until your quotes expire. Five Star Conveyancing.</p>`,
    });
  } catch (err) {
    console.error("email-results failed", err);
    return Response.json({ error: { message: "Something went wrong sending that email. Please try again." } }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
