// Five Star Conveyancing — a second, genuinely substantive paragraph for
// every location page, on top of the county-specific intro in locations.ts.
// Deliberately built from the same real, verified SDLT/LTT band data behind
// the SDLT calculator (src/lib/sdlt.ts) rather than a second hardcoded copy
// of the same figures, so the two can't drift out of sync if HMRC or the
// Welsh Revenue Authority change the rates.
import { ENGLAND_STANDARD_BANDS, ENGLAND_FIRST_TIME_BUYER_NIL_RATE_THRESHOLD, WALES_STANDARD_BANDS, type Band } from "./sdlt";

function money(n: number): string {
  return `£${n.toLocaleString("en-GB")}`;
}

function describeBands(bands: readonly Band[]): string {
  const parts = bands.map((b) => (b.max === null ? `${b.rate}% above that` : `${b.rate}% up to ${money(b.max)}`));
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}` : parts[0];
}

export function buildExtendedContent(city: string, jurisdiction: "England" | "Wales"): string {
  const intro = `When you compare quotes for a move in ${city}, every firm on the panel shows its legal fee, VAT and disbursements as separate line items — never folded into one bundled number — so you can see exactly what you're paying for before you instruct anyone.`;

  const taxParagraph =
    jurisdiction === "Wales"
      ? `If Land Transaction Tax applies to your purchase, the Welsh Revenue Authority's current bands are ${describeBands(WALES_STANDARD_BANDS)}. Wales has no first-time buyer relief, so these rates apply regardless of buyer type.`
      : `If Stamp Duty Land Tax applies to your purchase, the current HMRC bands are ${describeBands(ENGLAND_STANDARD_BANDS)}, with a separate first-time buyer nil-rate band up to ${money(ENGLAND_FIRST_TIME_BUYER_NIL_RATE_THRESHOLD)}.`;

  const closing = `Whether you're buying, selling, doing both at once, or remortgaging in ${city}, the same itemised comparison applies — and the free ${jurisdiction === "Wales" ? "LTT" : "SDLT"} calculator can give you a rough figure to budget for before you commit to a firm, with no obligation to instruct anyone.`;

  return `${intro} ${taxParagraph} ${closing}`;
}
