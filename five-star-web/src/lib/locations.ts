import { ShieldCheckIcon, PoundCoinIcon, ClockIcon } from "@/components/icons";
import { TEAL, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD } from "@/lib/theme";
import { GENERATED_LOCATIONS } from "./locationsGenerated";
import { COUNTY_BLURBS } from "./countyBlurbs";
import { TOWN_CHARACTER } from "./townCharacter";

export interface Location {
  slug: string;
  city: string;
  jurisdiction: "England" | "Wales";
  taxName: string; // "Stamp Duty Land Tax" | "Land Transaction Tax"
  intro: string;
  county?: string;
}

// Shape produced by scripts/generate-locations.mjs from the researched
// real-town CSV — deliberately minimal (no intro yet, that's built below
// from the county blurb so it isn't 964 copies of the same paragraph).
export interface GeneratedLocation {
  slug: string;
  city: string;
  county: string;
  jurisdiction: "England" | "Wales";
}

const ACCENT = "oklch(0.5 0.22 350)";
const GOLD_ICON = "oklch(0.6 0.14 80)";

export const LOCATION_ICONS = [
  { icon: ShieldCheckIcon, bg: ICON_BADGE_BG, color: TEAL, label: "SRA-regulated firms only", body: "Every firm on the comparison is regulated by the Solicitors Regulation Authority, wherever in the country they're based." },
  { icon: PoundCoinIcon, bg: ICON_BADGE_BG_ACCENT, color: ACCENT, label: "Itemised fees", body: "Legal fee, VAT and disbursements shown separately for every quote, not folded into one bundled number." },
  { icon: ClockIcon, bg: ICON_BADGE_BG_GOLD, color: GOLD_ICON, label: "Free to compare", body: "Comparing quotes never costs you anything, however many firms you look at." },
];

export const LOCATIONS: Location[] = [
  {
    slug: "london",
    city: "London",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Buying or selling in London usually means a leasehold flat is at least as likely as a freehold house, and higher property values mean Stamp Duty Land Tax is a bigger part of your budget than in most of the country — both good reasons to see the full itemised breakdown before you commit to a firm.",
  },
  {
    slug: "manchester",
    city: "Manchester",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Manchester's mix of new-build apartments, Victorian terraces, and everything in between means the searches and enquiries involved in a purchase can vary a lot from one property to the next — comparing itemised quotes helps you see exactly what's included before you instruct a firm.",
  },
  {
    slug: "birmingham",
    city: "Birmingham",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Whether you're buying your first home in Birmingham or moving within a chain, a genuine itemised quote — legal fee, VAT and disbursements shown separately — makes it far easier to compare firms on a like-for-like basis than a single bundled figure.",
  },
  {
    slug: "leeds",
    city: "Leeds",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "From city-centre leasehold apartments to freehold houses further out, conveyancing in Leeds covers the full range of transaction types — comparing quotes side by side helps you see what each firm actually charges for the specific move you're making.",
  },
  {
    slug: "cardiff",
    city: "Cardiff",
    jurisdiction: "Wales",
    taxName: "Land Transaction Tax",
    intro:
      "Property transactions in Cardiff — and the rest of Wales — are taxed under Land Transaction Tax (LTT) rather than the Stamp Duty Land Tax charged in England, set and collected by the Welsh Revenue Authority. Make sure any quote you're comparing reflects LTT, not SDLT, disbursements.",
  },
  {
    slug: "bristol",
    city: "Bristol",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Bristol's property mix runs from Georgian and Victorian conversions to newer waterfront developments, and leasehold flats are common enough that lease-length and service-charge checks come up often during a purchase — an itemised quote makes it clear whether a firm's fee already accounts for that extra work.",
  },
  {
    slug: "liverpool",
    city: "Liverpool",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "From city-centre apartments to family houses across the wider Merseyside area, conveyancing in Liverpool spans a broad range of property types and price points — comparing itemised quotes side by side helps you see what's actually included before you commit to a firm.",
  },
  {
    slug: "sheffield",
    city: "Sheffield",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Sheffield's terraced streets, student-let conversions, and newer developments each bring slightly different conveyancing considerations — a genuine itemised breakdown, rather than one bundled figure, makes it easier to see exactly what a firm is charging for and why.",
  },
  {
    slug: "newcastle",
    city: "Newcastle upon Tyne",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Whether you're buying in the city centre or further out toward the coast, Newcastle conveyancing covers everything from Tyneside flats to freehold houses — comparing quotes lets you see the legal fee, VAT, and disbursements for your specific transaction rather than a generic estimate.",
  },
  {
    slug: "nottingham",
    city: "Nottingham",
    jurisdiction: "England",
    taxName: "Stamp Duty Land Tax",
    intro:
      "Nottingham's mix of established suburbs and city-centre new-builds means the searches and enquiries a purchase needs can differ significantly from one property to the next — an itemised quote helps you compare firms on exactly what they'll do for your transaction, not just a headline price.",
  },
  {
    slug: "swansea",
    city: "Swansea",
    jurisdiction: "Wales",
    taxName: "Land Transaction Tax",
    intro:
      "As in the rest of Wales, property transactions in Swansea are taxed under Land Transaction Tax (LTT), collected by the Welsh Revenue Authority rather than HM Revenue & Customs. If you're comparing quotes from firms based outside Wales, it's worth double-checking they've quoted LTT rather than the English SDLT by mistake.",
  },
];

// Genuinely town-specific content (a real landmark, industry, or history —
// or an honest general descriptor where no specific fact is confidently
// known) from townCharacter.ts, one sentence per town. countyBlurbs.ts is
// kept only as a fallback for a town added later without matching content
// here — it should never actually fire against the current town list, since
// every current slug has an entry in TOWN_CHARACTER.
function buildIntro(slug: string, city: string, county: string, jurisdiction: "England" | "Wales"): string {
  const taxName = jurisdiction === "Wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax";
  const jurisdictionNote =
    jurisdiction === "Wales"
      ? ` Property transactions in ${city} are taxed under ${taxName} rather than the Stamp Duty Land Tax charged in England, so make sure any quote you compare reflects that.`
      : "";
  const comparisonSentence = `Comparing itemised quotes for a move in ${city} makes it easier to see exactly what a firm is charging for, rather than one bundled figure.`;

  const character = TOWN_CHARACTER[slug];
  if (character) return `${character} ${comparisonSentence}${jurisdictionNote}`;

  const countyBlurb = COUNTY_BLURBS[county];
  return countyBlurb
    ? `${county} ${countyBlurb} ${comparisonSentence}${jurisdictionNote}`
    : `${comparisonSentence}${jurisdictionNote}`;
}

const GENERATED_WITH_INTRO: Location[] = GENERATED_LOCATIONS.map((g) => ({
  slug: g.slug,
  city: g.city,
  jurisdiction: g.jurisdiction,
  taxName: g.jurisdiction === "Wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax",
  county: g.county,
  intro: buildIntro(g.slug, g.city, g.county, g.jurisdiction),
}));

export const ALL_LOCATIONS: Location[] = [...LOCATIONS, ...GENERATED_WITH_INTRO];

export function getLocation(slug: string): Location | undefined {
  return ALL_LOCATIONS.find((l) => l.slug === slug);
}

// Other real towns in the same county, for genuine (not fabricated)
// internal linking between location pages — capped so the list stays
// readable rather than dumping dozens of links on one page.
export function getNearbyLocations(location: Location, limit = 8): Location[] {
  if (!location.county) return [];
  return ALL_LOCATIONS.filter((l) => l.county === location.county && l.slug !== location.slug).slice(0, limit);
}
