// Five Star Conveyancing — POST /api/quotes/:reference/email-quote — emails a
// PDF of one firm's quote result directly to the client, used by the "Email
// quote" button.
import { z } from "zod";
import { loadQuoteResultForFirm } from "@/lib/pdf/loadQuoteResult";
import { generateQuotePdf } from "@/lib/pdf/generateQuotePdf";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  firmId: z.string().min(1),
  email: z.string().email(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
): Promise<Response> {
  const { reference } = await params;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: { message: "A valid firmId and email address are required." } }, { status: 400 });
  }

  const loaded = await loadQuoteResultForFirm(reference, body.firmId);
  if ("error" in loaded) {
    return Response.json({ error: { message: loaded.error } }, { status: loaded.status });
  }

  const displayName = loaded.result.firm.tradingName ?? loaded.result.firm.legalEntityName;

  try {
    const pdfBuffer = await generateQuotePdf(loaded.quoteReference, loaded.result);
    await sendEmail({
      to: body.email,
      subject: `Your Five Star Conveyancing quote from ${displayName}`,
      html: `<p>Hi,</p><p>Attached is your conveyancing quote from <strong>${displayName}</strong> (reference ${loaded.quoteReference}).</p><p>This is an estimate, not a binding offer — please confirm final figures with the firm before instructing them.</p><p>Five Star Conveyancing</p>`,
      attachments: [{ filename: `Quote-${loaded.quoteReference}.pdf`, content: pdfBuffer }],
    });
  } catch (err) {
    console.error("email-quote failed", err);
    return Response.json({ error: { message: "Something went wrong sending that email. Please try again." } }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
