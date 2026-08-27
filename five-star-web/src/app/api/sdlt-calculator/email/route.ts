// Five Star Conveyancing — POST /api/sdlt-calculator/email — emails a client
// their full SDLT/LTT breakdown. The figure is always recomputed server-side
// from price/jurisdiction/buyerType rather than trusting a client-sent total,
// same reasoning as every other server-side recalculation in this app.
import { z } from "zod";
import { calculateSdlt, type BuyerType, type Jurisdiction } from "@/lib/sdlt";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  email: z.string().email(),
  price: z.number().positive(),
  jurisdiction: z.enum(["england", "wales"]),
  buyerType: z.enum(["standard", "first_time_buyer", "additional_property"]),
});

function formatMoney(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function buyerTypeLabel(buyerType: BuyerType): string {
  switch (buyerType) {
    case "first_time_buyer":
      return "First-time buyer";
    case "additional_property":
      return "Additional property";
    default:
      return "Standard";
  }
}

function buildEmailHtml(price: number, jurisdiction: Jurisdiction, buyerType: BuyerType): string {
  const taxName = jurisdiction === "wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax";
  const result = calculateSdlt(price, jurisdiction, buyerType);
  const rows = result.bands
    .map(
      (b) =>
        `<tr><td style="padding:6px 0;color:#5c5670;">${formatMoney(b.min)} – ${b.max ? formatMoney(b.max) : "and above"} at ${b.rate}%</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#2b2640;">${formatMoney(b.taxForBand)}</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:480px;">
      <p>Hi,</p>
      <p>Here's your ${taxName} estimate for a ${formatMoney(price)} property in ${jurisdiction === "wales" ? "Wales" : "England"} (${buyerTypeLabel(buyerType).toLowerCase()}):</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <p style="font-size:18px;font-weight:800;color:#2b2640;margin-top:12px;">Total: ${formatMoney(result.total)}</p>
      <p style="font-size:12px;color:#7a7590;">Estimate only, based on published HMRC / Welsh Revenue Authority rates. It doesn't account for every relief or exemption — always confirm the exact figure with your solicitor before exchange.</p>
      <p>Ready to compare conveyancing quotes? <a href="https://fivestarconveyancing.co.uk/get-a-quote">Get your quote here</a>.</p>
      <p>Five Star Conveyancing</p>
    </div>
  `;
}

export async function POST(request: Request): Promise<Response> {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: { message: "A valid email, price, jurisdiction and buyer type are required." } }, { status: 400 });
  }

  try {
    await sendEmail({
      to: body.email,
      subject: `Your ${body.jurisdiction === "wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax"} estimate`,
      html: buildEmailHtml(body.price, body.jurisdiction, body.buyerType),
    });
  } catch (err) {
    console.error("sdlt-calculator email failed", err);
    return Response.json({ error: { message: "Something went wrong sending that email. Please try again." } }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
