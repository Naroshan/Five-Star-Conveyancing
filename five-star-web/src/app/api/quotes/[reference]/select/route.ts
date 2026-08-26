import { after } from "next/server";
import { selectFirmHandler } from "five-star-conveyancing-quote-engine/api/selectFirm";
import { db } from "@/lib/db";
import { loadQuoteResultForFirm } from "@/lib/pdf/loadQuoteResult";
import { generateQuotePdf } from "@/lib/pdf/generateQuotePdf";
import { sendEmail } from "@/lib/email";

// Confirmed with the client as the inbox to receive instructed-firm quote
// PDFs — not a secret, so a plain constant (same convention as
// LEAD_NOTIFY_FORM_ID / PHONE_NUMBER_DISPLAY elsewhere in this app).
const INTERNAL_QUOTE_RECIPIENT = "info@fivestarconveyancing.co.uk";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
): Promise<Response> {
  const { reference } = await params;

  // selectFirmHandler consumes the request body via request.json() — clone
  // it first so we can also read firmId here without racing that call.
  const firmId = await request
    .clone()
    .json()
    .then((body: { firmId?: unknown }) => (typeof body.firmId === "string" ? body.firmId : null))
    .catch(() => null);

  const response = await selectFirmHandler(reference, request, db);

  if (response.ok && firmId) {
    // Best-effort: the client's selection is already recorded by this point
    // (the response above already succeeded), so a failure here shouldn't
    // surface as an error to the client — it's an internal notification, not
    // part of what the client's action promised them. after() keeps this
    // running past the response being sent, instead of racing serverless
    // function teardown like a bare fire-and-forget promise would.
    after(async () => {
      try {
        const loaded = await loadQuoteResultForFirm(reference, firmId);
        if ("error" in loaded) return;
        const pdfBuffer = await generateQuotePdf(loaded.quoteReference, loaded.result);
        const displayName = loaded.result.firm.tradingName ?? loaded.result.firm.legalEntityName;
        await sendEmail({
          to: INTERNAL_QUOTE_RECIPIENT,
          subject: `New instruction: ${displayName} — quote ${loaded.quoteReference}`,
          html: `<p>A client has instructed <strong>${displayName}</strong> from quote ${loaded.quoteReference}.</p><p>Their contact details were sent separately via the lead notification form.</p>`,
          attachments: [{ filename: `Quote-${loaded.quoteReference}.pdf`, content: pdfBuffer }],
        });
      } catch (err) {
        console.error("Internal instruction-PDF email failed", err);
      }
    });
  }

  return response;
}
