// Five Star Conveyancing — GET /api/quotes/:reference/pdf?firmId=... — returns
// a downloadable PDF of one firm's quote result, used by the "Save quote" button.
import type { NextRequest } from "next/server";
import { loadQuoteResultForFirm } from "@/lib/pdf/loadQuoteResult";
import { generateQuotePdf } from "@/lib/pdf/generateQuotePdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
): Promise<Response> {
  const { reference } = await params;
  const firmId = request.nextUrl.searchParams.get("firmId");
  if (!firmId) {
    return Response.json({ error: { message: "A firmId query parameter is required." } }, { status: 400 });
  }

  const loaded = await loadQuoteResultForFirm(reference, firmId);
  if ("error" in loaded) {
    return Response.json({ error: { message: loaded.error } }, { status: loaded.status });
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateQuotePdf(loaded.quoteReference, loaded.result);
  } catch (err) {
    console.error("PDF generation failed", err);
    return Response.json({ error: { message: "Something went wrong generating that PDF. Please try again." } }, { status: 500 });
  }

  const displayName = loaded.result.firm.tradingName ?? loaded.result.firm.legalEntityName;
  const filename = `Five-Star-Conveyancing-Quote-${loaded.quoteReference}-${displayName.replace(/[^a-z0-9]+/gi, "-")}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
