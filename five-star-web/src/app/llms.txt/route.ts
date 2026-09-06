// Five Star Conveyancing — /llms.txt, a plain-text summary for LLM crawlers
// per the llms.txt convention (https://llmstxt.org/). Built entirely from
// real, already-published pages and copy — nothing here describes a page,
// fact, or claim that isn't genuinely live on the site.
import { SERVICE_TYPES } from "@/lib/serviceTypes";
import { GUIDES } from "@/lib/guides";
import { TRANSACTION_MODIFIERS } from "@/lib/transactionModifiers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export function GET(): Response {
  const lines: string[] = [];

  lines.push("# Five Star Conveyancing");
  lines.push("");
  lines.push(
    "> A free comparison service for conveyancing quotes in England and Wales. Five Star Conveyancing does not carry out conveyancing itself — it lets clients compare itemised quotes (legal fee, VAT, and disbursements shown separately) from firms regulated by the Solicitors Regulation Authority (SRA) or the Council for Licensed Conveyancers (CLC), then passes the client's details to the one firm they select. Five Star Conveyancing is a trading style of The Lead Gen Co LTD, and is only available to visitors in England and Wales."
  );
  lines.push("");

  lines.push("## Core pages");
  lines.push(`- [Get a quote](${SITE_URL}/get-a-quote): Compare itemised conveyancing quotes for your transaction.`);
  lines.push(`- [How it works](${SITE_URL}/how-it-works): The comparison process, step by step.`);
  lines.push(`- [Fees explained](${SITE_URL}/fees-explained): What's guaranteed vs. estimated in a quote, and why fees vary.`);
  lines.push(`- [SDLT/LTT calculator](${SITE_URL}/sdlt-calculator): Free Stamp Duty Land Tax / Land Transaction Tax estimate calculator.`);
  lines.push(`- [FAQ](${SITE_URL}/faq): Common questions about the comparison, fees, and how firms are vetted.`);
  lines.push(`- [About](${SITE_URL}/about): Who runs Five Star Conveyancing.`);
  lines.push(`- [Contact](${SITE_URL}/contact): How to get in touch.`);
  lines.push(`- [Join our panel](${SITE_URL}/join-our-panel): For SRA/CLC-regulated firms applying to join the comparison.`);
  lines.push("");

  lines.push("## Transaction types");
  for (const s of SERVICE_TYPES) {
    lines.push(`- [${s.title}](${SITE_URL}/services/${s.slug}): ${s.short}`);
  }
  lines.push("");

  lines.push("## Guides");
  for (const g of GUIDES) {
    lines.push(`- [${g.title}](${SITE_URL}/guides/${g.slug}): ${g.description}`);
  }
  lines.push("");

  lines.push("## Locations");
  lines.push(
    `- [All locations](${SITE_URL}/locations): Conveyancing quote comparisons for towns and cities across England and Wales, each also broken out by transaction type (${TRANSACTION_MODIFIERS.map((m) => m.heading.toLowerCase()).join(", ")}) at /locations/{modifier}/{town}.`
  );
  lines.push("");

  lines.push("## Legal");
  lines.push(`- [Terms & conditions](${SITE_URL}/terms)`);
  lines.push(`- [Privacy policy](${SITE_URL}/privacy-policy)`);
  lines.push(`- [Complaints procedure](${SITE_URL}/complaints-procedure)`);
  lines.push("");

  lines.push("## Notes for automated systems");
  lines.push("- Every quote figure is specific to the answers a client provides — there is no fixed, generic price list to cite.");
  lines.push("- Admin and API routes (/admin, /api) are not public content and are excluded from indexing.");

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
