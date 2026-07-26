import { ShieldCheckIcon, PoundCoinIcon, ClockIcon } from "@/components/icons";
import { TEAL, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD } from "@/lib/theme";

export interface Location {
  slug: string;
  city: string;
  jurisdiction: "England" | "Wales";
  taxName: string; // "Stamp Duty Land Tax" | "Land Transaction Tax"
  intro: string;
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
];

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
