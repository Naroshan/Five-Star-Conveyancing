import { HomeIcon, DocumentExtendIcon, ReceiptIcon, ClockIcon, type IconProps } from "@/components/icons";
import { TEAL, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD } from "@/lib/theme";
import { ENGLAND_FIRST_TIME_BUYER_NIL_RATE_THRESHOLD, ENGLAND_STANDARD_BANDS, WALES_STANDARD_BANDS, formatMoney as money, describeBands } from "@/lib/sdlt";

export interface GuideSection {
  heading: string;
  body: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  icon: (props: IconProps) => React.JSX.Element;
  iconBg: string;
  iconColor: string;
  sections: GuideSection[];
}

const ACCENT = "oklch(0.5 0.22 350)";
const GOLD_ICON = "oklch(0.6 0.14 80)";

export const GUIDES: Guide[] = [
  {
    slug: "first-time-buyer-conveyancing",
    title: "A first-time buyer's guide to conveyancing",
    description: "What conveyancing actually is, and what happens at each stage of buying your first home.",
    icon: HomeIcon,
    iconBg: ICON_BADGE_BG,
    iconColor: TEAL,
    sections: [
      {
        heading: "What conveyancing actually is",
        body: "Conveyancing is the legal process of transferring ownership of a property from the seller to you. A solicitor or licensed conveyancer handles it on your behalf — checking the title is genuine and unencumbered, running searches on the property and area, handling your deposit and mortgage funds, and registering you as the new owner once everything completes.",
      },
      {
        heading: "Before you make an offer",
        body: "It helps to have a conveyancer lined up before you make an offer, not after — some sellers and estate agents ask for proof you're ready to proceed, and having a solicitor already instructed can make your offer look more serious.",
      },
      {
        heading: "After your offer is accepted",
        body: "Your conveyancer requests the draft contract pack from the seller's solicitor, then starts searches (local authority, water and drainage, environmental, and sometimes others depending on the property) and reviews the title. This is usually the slowest part — searches alone can take anywhere from a few days to several weeks depending on the local authority.",
      },
      {
        heading: "Enquiries and mortgage offer",
        body: "Once your conveyancer has the search results and title information, they'll raise enquiries with the seller's solicitor about anything that needs clarifying. In parallel, if you're using a mortgage, your lender needs to issue a formal mortgage offer before you can exchange contracts.",
      },
      {
        heading: "Exchange and completion",
        body: "Exchanging contracts is the point you're legally committed — you'll pay your deposit and agree a completion date. Completion is moving day: the remaining funds transfer, you get the keys, and your conveyancer registers your ownership with HM Land Registry and handles any Stamp Duty Land Tax due.",
      },
      {
        heading: "First-time buyer relief on Stamp Duty Land Tax",
        body: `If this is your first property and it's in England, you may qualify for first-time buyer relief on Stamp Duty Land Tax — currently a nil-rate band on the first ${money(ENGLAND_FIRST_TIME_BUYER_NIL_RATE_THRESHOLD)} of the price, provided the property costs £500,000 or less; above that, standard rates apply to the whole price instead. Wales has no equivalent relief under Land Transaction Tax. Every itemised quote you compare through Five Star shows the legal fee, VAT and disbursements as separate figures, and our free SDLT calculator gives you a rough figure to budget for before you commit to a firm.`,
      },
    ],
  },
  {
    slug: "leasehold-vs-freehold",
    title: "Leasehold vs freehold: what's the difference?",
    description: "What owning a leasehold property actually means compared to freehold, and why it affects your conveyancing.",
    icon: DocumentExtendIcon,
    iconBg: ICON_BADGE_BG_GOLD,
    iconColor: GOLD_ICON,
    sections: [
      {
        heading: "Freehold",
        body: "Owning a freehold property means you own the building and the land it stands on outright, for an unlimited time. Most houses are sold freehold. There's no landlord, no ground rent, and generally no service charge — though you're still responsible for your own maintenance and any shared costs if the property is part of a wider estate with a management company.",
      },
      {
        heading: "Leasehold",
        body: "Owning a leasehold property means you own the right to live there for a fixed number of years, set out in the lease — the land, and often the building itself, is owned by a separate freeholder (sometimes called a landlord). Most flats are sold leasehold. You'll typically pay a service charge towards maintaining shared areas, and possibly ground rent to the freeholder.",
      },
      {
        heading: "Why the remaining lease length matters",
        body: "As a lease gets shorter, the property can become harder to mortgage and sell, and more expensive to extend later. Many mortgage lenders are cautious about leases under 70–80 years remaining. Your conveyancer will check the remaining term as part of buying a leasehold property, and flag it if it looks short.",
      },
      {
        heading: "What your conveyancer checks on a leasehold purchase",
        body: "Beyond the usual searches, a leasehold purchase involves reviewing the lease terms themselves, checking service charge and ground rent history, and raising management-company-specific enquiries — which is generally why leasehold conveyancing takes a bit longer, and sometimes costs a bit more, than an equivalent freehold purchase.",
      },
      {
        heading: "How leasehold affects your quote",
        body: "Because a leasehold purchase involves extra checks — reviewing the lease terms, verifying service charge and ground rent history, and liaising with the management company — many firms charge a separate leasehold supplement on top of their base legal fee, rather than pricing every transaction identically regardless of tenure. On a proper itemised quote, that supplement is shown as its own line item rather than folded into the headline figure, so you can see exactly what the extra leasehold work is costing you before you instruct a firm.",
      },
    ],
  },
  {
    slug: "stamp-duty-land-tax-explained",
    title: "Stamp Duty Land Tax, explained",
    description: "What Stamp Duty Land Tax (and Land Transaction Tax in Wales) is, and how it's worked out — without quoting rates that change.",
    icon: ReceiptIcon,
    iconBg: ICON_BADGE_BG_ACCENT,
    iconColor: ACCENT,
    sections: [
      {
        heading: "What it is",
        body: "Stamp Duty Land Tax (SDLT) is a tax you pay when you buy property or land in England or Northern Ireland over a certain value. Scotland has its own equivalent (Land and Buildings Transaction Tax) and Wales has its own (Land Transaction Tax, LTT) — the underlying idea is the same, but the rates and thresholds are set separately by each government.",
      },
      {
        heading: "Why we don't quote specific rates here",
        body: "SDLT and LTT rates and thresholds change periodically, and can also depend on things specific to your situation — whether it's your only property, whether you're a first-time buyer, and whether it's residential or non-residential land. Rather than publish a number here that could be out of date by the time you read it, we'd rather point you to the current rates directly from HMRC (for SDLT) or the Welsh Revenue Authority (for LTT) — your conveyancer will also confirm the exact figure that applies to your specific purchase.",
      },
      {
        heading: "How it's usually paid",
        body: "Your conveyancer normally calculates the amount due, includes it in your completion statement, and submits the return and payment to HMRC (or the Welsh Revenue Authority) on your behalf shortly after completion — it's one of the disbursements shown separately on a proper conveyancing quote, rather than folded into the legal fee.",
      },
      {
        heading: "Try the SDLT calculator instead of guessing",
        body: `Rather than leave you without any figures at all, we've built a free SDLT calculator using the bands currently published by HMRC and the Welsh Revenue Authority — kept up to date as those rates change, rather than printed once here and left to go stale. As things stand, the standard England bands run ${describeBands(ENGLAND_STANDARD_BANDS)}, and the standard Wales bands run ${describeBands(WALES_STANDARD_BANDS)}. Enter a property price into the calculator and it works out roughly what you'd owe as a standard buyer, a first-time buyer, or on an additional property.`,
      },
    ],
  },
  {
    slug: "how-long-does-conveyancing-take",
    title: "How long does conveyancing take?",
    description: "What actually drives conveyancing timelines, and why the same transaction can take very different amounts of time.",
    icon: ClockIcon,
    iconBg: ICON_BADGE_BG,
    iconColor: TEAL,
    sections: [
      {
        heading: "The honest answer: it varies enormously",
        body: "Conveyancing timelines are often quoted as \"eight to twelve weeks,\" and that's a reasonable rule of thumb for a straightforward purchase — but the real answer depends heavily on your specific chain, lender, and local authority, and can be considerably faster or slower.",
      },
      {
        heading: "What speeds it up",
        body: "No chain (for example buying from a new-build developer or a probate sale with no onward purchase), a mortgage offer already in place, a local authority with fast search turnaround, and both sides' solicitors responding to enquiries promptly.",
      },
      {
        heading: "What slows it down",
        body: "A long chain where every link has to be ready simultaneously, slow search turnaround from some local authorities, leasehold properties (more information to gather from the management company), and delays getting a mortgage offer confirmed.",
      },
      {
        heading: "Why itemised quotes help here",
        body: "A quote that separates legal fee, VAT, and disbursements doesn't just make costs clearer — it also makes it easier to see exactly which searches and checks are included, so you know what your conveyancer is actually waiting on if things take longer than expected.",
      },
      {
        heading: "Comparing quotes doesn't have to slow you down",
        body: "Getting a comparison through Five Star takes about a minute and doesn't commit you to anything — you can request quotes from several SRA or CLC regulated firms, see the legal fee, VAT and disbursements broken out for each one, and instruct the firm you choose directly, without a sales call in between. None of that adds time to your actual conveyancing timeline; if anything, comparing properly upfront means you're less likely to switch firms partway through a transaction, which is one of the more common causes of unnecessary delay.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
