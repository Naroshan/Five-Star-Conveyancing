import { HomeIcon, DocumentExtendIcon, ReceiptIcon, ClockIcon, SearchPostcodeIcon, RefreshIcon, SwapIcon, UsersIcon, BookmarkIcon, type IconProps } from "@/components/icons";
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
  {
    slug: "what-is-a-conveyancing-search",
    title: "What is a conveyancing search?",
    description: "What local authority, water, and environmental searches actually check, and why they can be the slowest part of a purchase.",
    icon: SearchPostcodeIcon,
    iconBg: ICON_BADGE_BG,
    iconColor: TEAL,
    sections: [
      {
        heading: "Why searches happen at all",
        body: "A search is a formal enquiry your conveyancer makes — usually to a local authority, a water company, or a specialist search provider — to uncover things about a property or the land around it that wouldn't show up just from looking at the title deeds. They exist to protect you from buying a property with a hidden problem you'd have no other way of finding out about.",
      },
      {
        heading: "Local authority search",
        body: "Checks things like whether the road outside is publicly maintained, whether there are any planning permissions, building regulation issues, or enforcement notices on record, and whether the property is in a conservation area or subject to a listed building restriction.",
      },
      {
        heading: "Water and drainage search",
        body: "Confirms whether the property is connected to public water and sewerage, where the pipes run relative to the property, and whether there's any risk of the property being affected by a public sewer running underneath it.",
      },
      {
        heading: "Environmental search",
        body: "Covers flood risk, contaminated land history (for example if the site was once industrial), and subsidence risk — increasingly relevant for mortgage lenders, who may require one before releasing funds.",
      },
      {
        heading: "Other searches, depending on the property",
        body: "A mining search (in former coalfield areas), a chancel repair search (historic liability to contribute to church repairs), or a commons registration search (if the property is near registered common land) may apply depending on where the property is — your conveyancer will tell you which ones are relevant to your specific purchase, not run every possible search regardless of location.",
      },
      {
        heading: "Why search fees vary between quotes",
        body: "Because which searches actually apply depends on the property, and providers charge different amounts, search fees are one of the more variable disbursement line items on a conveyancing quote — a proper itemised quote shows them separately rather than folding them into a single bundled figure, so you can see exactly what's being checked and what it costs.",
      },
    ],
  },
  {
    slug: "remortgaging-what-to-expect",
    title: "Remortgaging: what your conveyancer actually does",
    description: "What's involved in the legal side of a remortgage, and why it's usually simpler and quicker than buying or selling.",
    icon: RefreshIcon,
    iconBg: ICON_BADGE_BG_ACCENT,
    iconColor: ACCENT,
    sections: [
      {
        heading: "Why a remortgage still needs a conveyancer",
        body: "Even though you're not buying or selling, moving your mortgage to a new lender means the new lender needs to register a charge against the property, and your existing lender's charge needs to be removed — that's a legal change to the title at HM Land Registry, which is why a conveyancer (rather than just your mortgage broker) has to handle it.",
      },
      {
        heading: "What's checked",
        body: "Your conveyancer confirms you own the property outright (or with whoever else is named on the title), checks for anything already registered against it that the new lender needs to know about, and deals with any conditions the new lender attaches to their mortgage offer.",
      },
      {
        heading: "Why it's usually faster than a purchase",
        body: "There's no chain, no seller's solicitor to coordinate with, and usually no need for fresh local authority or environmental searches if you already have suitable indemnity or recent search results — which is why remortgage conveyancing typically completes in a matter of weeks rather than the months a purchase can take.",
      },
      {
        heading: "What can still slow it down",
        body: "A leasehold property (the new lender may want updated information from the management company), a Help to Buy equity loan that needs redeeming or updating as part of the remortgage, or delays in your existing lender confirming the redemption figure needed to pay off the old mortgage.",
      },
      {
        heading: "Comparing remortgage quotes",
        body: "Remortgage legal fees are usually lower than a full purchase, since there's less work involved — but they're not free, and firms still vary in what they charge and what disbursements they pass on. An itemised quote makes it easy to compare firms on a like-for-like basis rather than guessing from a single headline number.",
      },
    ],
  },
  {
    slug: "transfer-of-equity-explained",
    title: "Transfer of equity, explained",
    description: "What a transfer of equity actually involves — adding or removing someone from the title of a property without a full sale.",
    icon: SwapIcon,
    iconBg: ICON_BADGE_BG_GOLD,
    iconColor: GOLD_ICON,
    sections: [
      {
        heading: "What a transfer of equity is",
        body: "A transfer of equity changes who owns a property without it being fully sold — most commonly adding a partner to the title after marriage or a house move-in, removing an ex-partner after a separation or divorce, or transferring a share of a property as part of estate or family planning.",
      },
      {
        heading: "Why it still needs proper conveyancing",
        body: "Even though the property isn't changing hands to a new, unconnected buyer, the legal ownership at HM Land Registry has to be formally updated, and if there's a mortgage on the property, the lender has to consent to the change and often needs the remaining party (or parties) to be assessed as able to afford the mortgage alone.",
      },
      {
        heading: "Stamp Duty Land Tax can still apply",
        body: "If money or a share of a mortgage changes hands as part of the transfer — for example, one partner effectively taking on the other's share of an existing mortgage — SDLT or LTT can apply to that value, even though no money is being paid to an outside seller. Your conveyancer works out whether it applies to your specific situation.",
      },
      {
        heading: "What your conveyancer checks",
        body: "The existing title and any mortgage or charges registered against it, lender consent where a mortgage is involved, and — if the transfer is happening as part of a divorce or separation — that it's consistent with any court order or agreement covering the property.",
      },
      {
        heading: "Why fees differ from a full purchase",
        body: "A transfer of equity is usually simpler than a full purchase (no chain, often no new searches needed), so legal fees tend to be lower — but the amount of work still varies by firm and by situation, particularly where a mortgage lender needs to be involved. Comparing itemised quotes still applies here, the same as any other transaction type.",
      },
    ],
  },
  {
    slug: "lease-extension-what-to-expect",
    title: "Extending a lease: what to expect",
    description: "Why leaseholders extend their lease, roughly how the process works, and what a conveyancer actually does as part of it.",
    icon: DocumentExtendIcon,
    iconBg: ICON_BADGE_BG,
    iconColor: TEAL,
    sections: [
      {
        heading: "Why leaseholders extend",
        body: "As a lease gets shorter, a property becomes harder to mortgage and more expensive to extend later, and its value can be affected — many leaseholders extend well before their lease runs particularly short, both to protect the property's value and to make it easier to sell or remortgage in future.",
      },
      {
        heading: "The formal (statutory) route",
        body: "Leaseholders who qualify (generally having owned the property for at least two years) have a legal right to extend under statute — typically adding 90 years to a flat's remaining term and reducing the ground rent to a nominal amount. This route has a formal notice process with set timescales.",
      },
      {
        heading: "The informal route",
        body: "Negotiating directly with the freeholder outside the statutory process can sometimes be quicker, but the terms aren't fixed by law in the same way, so it's worth having a conveyancer or specialist adviser involved to make sure the terms are reasonable before you agree to anything.",
      },
      {
        heading: "What a conveyancer does",
        body: "Reviews the existing lease, serves or responds to the relevant statutory notices if you're using that route, deals with the premium (the cost of the extension, usually assessed by a valuer rather than the conveyancer), and registers the new, extended lease at HM Land Registry once it's agreed.",
      },
      {
        heading: "Comparing lease extension quotes",
        body: "Lease extension work is specialised enough that not every firm handles it, and fees vary depending on whether the statutory or informal route is used — an itemised quote makes it clear what's included in the legal fee versus what's a separate disbursement, such as valuation costs or Land Registry fees.",
      },
    ],
  },
  {
    slug: "help-to-buy-and-shared-ownership-conveyancing",
    title: "Help to Buy and Shared Ownership conveyancing",
    description: "How buying through a Help to Buy equity loan or Shared Ownership changes the legal work involved, compared to a standard purchase.",
    icon: UsersIcon,
    iconBg: ICON_BADGE_BG_ACCENT,
    iconColor: ACCENT,
    sections: [
      {
        heading: "Help to Buy equity loans",
        body: "A Help to Buy equity loan (now closed to new applicants in England, though existing loans still need to be redeemed or managed) means a government body holds a second charge on the property alongside your main mortgage. Extra paperwork is needed both when you buy and later, if you remortgage, sell, or repay the equity loan early.",
      },
      {
        heading: "Shared Ownership",
        body: "Shared Ownership means you buy a percentage share of a property (commonly 25–75%) through a mortgage, and pay rent on the remaining share to a housing association, which retains ownership of the rest. The lease itself is structured differently from a standard leasehold purchase to reflect this.",
      },
      {
        heading: "Why the legal work differs",
        body: "Both schemes involve an extra party — the equity loan administrator or the housing association — whose consent and paperwork requirements sit alongside the usual purchase process, and both typically require additional enquiries and sometimes additional Land Registry filings beyond a standard freehold or leasehold purchase.",
      },
      {
        heading: "Staircasing",
        body: "If you later buy a further share of a Shared Ownership property (known as staircasing), that's its own legal transaction with its own valuation and paperwork, similar in some ways to a small additional purchase rather than simply a mortgage top-up.",
      },
      {
        heading: "Why these transactions often cost a bit more",
        body: "Because of the extra party and paperwork involved, many firms charge a supplement on top of their base legal fee for Help to Buy or Shared Ownership purchases, rather than pricing every transaction the same regardless of scheme. A proper itemised quote shows that supplement as its own line, so you can see exactly what the extra work is costing rather than a single bundled figure.",
      },
    ],
  },
  {
    slug: "buying-at-auction-conveyancing",
    title: "Buying at auction: what's different about the conveyancing",
    description: "Why the conveyancing timeline for an auction purchase is compressed compared to buying through an estate agent, and what to prepare in advance.",
    icon: BookmarkIcon,
    iconBg: ICON_BADGE_BG_GOLD,
    iconColor: GOLD_ICON,
    sections: [
      {
        heading: "The key difference: exchange happens on the day",
        body: "In a standard purchase, you exchange contracts only once searches, enquiries, and your mortgage offer are all sorted. At auction, the fall of the hammer is the exchange — you're legally committed to buy the moment you're the winning bidder, before any of that work has been done.",
      },
      {
        heading: "Why you need a conveyancer before you bid, not after",
        body: "Auction houses publish a legal pack (title, searches where available, and special conditions of sale) before the auction, and it's genuinely important to have a conveyancer review it beforehand — once you've won the bid, you can't back out over something the legal pack would have flagged.",
      },
      {
        heading: "Completion is usually fast",
        body: "Most auction contracts require completion within 20–28 days of the auction, which is far faster than the typical 8–12 weeks for a standard purchase — meaning your mortgage (if you're using one) needs to be essentially ready to go before you bid, not arranged afterwards.",
      },
      {
        heading: "The deposit is due immediately",
        body: "You'll typically need to pay a deposit (commonly 10% of the purchase price) on the day, on top of the auction house's own fees — worth having readily available rather than assuming you can arrange it afterwards.",
      },
      {
        heading: "Why a quote in advance still helps",
        body: "Because everything moves faster once you've won a bid, it's worth having a conveyancer already lined up — and an itemised quote in hand — before auction day, rather than trying to instruct a firm and agree fees at the same time as racing through a compressed completion deadline.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
