// Five Star Conveyancing — the "transaction type" axis of the location-page
// matrix (six modifiers x every town in locations.ts = one page per
// combination). Every fact used here is reused, not invented: intros and
// "what's involved" bullets come straight from serviceTypes.ts, and FAQ
// answers are paraphrased from the already-published, verified guides in
// guides.ts. Nothing town-specific is asserted here — the town-specific
// half of each page's content is TOWN_CHARACTER (via locations.ts), kept
// completely separate so the two axes combine without either one lying.
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";
import { SERVICE_TYPES } from "./serviceTypes";

export interface ModifierFaq {
  question: string;
  answer: string;
}

export interface TransactionModifier {
  slug: string;
  transactionType: TransactionType;
  /** Short verb phrase used mid-sentence, e.g. "buying a property" */
  activity: string;
  /** Page <h1> fragment, e.g. "Buying a property" */
  heading: string;
  intro: string;
  whatsInvolved: string[];
  faqs: ModifierFaq[];
}

function serviceType(slug: string) {
  const s = SERVICE_TYPES.find((s) => s.slug === slug);
  if (!s) throw new Error(`Missing service type: ${slug}`);
  return s;
}

export const TRANSACTION_MODIFIERS: TransactionModifier[] = [
  {
    slug: "purchase",
    transactionType: "purchase",
    activity: "buying a property",
    heading: "Buying a property",
    intro: serviceType("purchase").intro,
    whatsInvolved: serviceType("purchase").whatsInvolved,
    faqs: [
      {
        question: "What does a conveyancer actually do when I'm buying a property?",
        answer:
          "Your conveyancer runs local authority, water and drainage, and environmental searches on the property, reviews the title and raises enquiries with the seller's solicitor, liaises with your mortgage lender if you're using one, calculates and submits your Stamp Duty Land Tax or Land Transaction Tax return, then handles exchange, completion, and registering your ownership at HM Land Registry.",
      },
      {
        question: "How long does buying a property usually take?",
        answer:
          "\"Eight to twelve weeks\" is a reasonable rule of thumb for a straightforward purchase, but the real answer depends on your chain, your lender, and how quickly the local authority turns searches around — it can be considerably faster with no chain and a mortgage offer already in place, or slower with a long chain or a leasehold property.",
      },
      {
        question: "What searches will my conveyancer run before I complete?",
        answer:
          "Typically a local authority search (planning, building regulations, road adoption), a water and drainage search, and an environmental search covering flood and contamination risk — plus a mining, chancel repair, or commons registration search where the property's location makes one of those relevant.",
      },
      {
        question: "Is there a first-time buyer discount on the tax I'll pay?",
        answer:
          "In England, first-time buyers can qualify for a Stamp Duty Land Tax nil-rate band on part of the price, provided the property costs £500,000 or less. Wales has no equivalent relief under Land Transaction Tax — standard LTT rates apply regardless of buyer type. Our free SDLT/LTT calculator gives a rough figure either way before you commit to a firm.",
      },
    ],
  },
  {
    slug: "sale",
    transactionType: "sale",
    activity: "selling a property",
    heading: "Selling a property",
    intro: serviceType("sale").intro,
    whatsInvolved: serviceType("sale").whatsInvolved,
    faqs: [
      {
        question: "What's involved in selling a property?",
        answer:
          "Your conveyancer completes the Property Information and Fittings & Contents forms, responds to enquiries raised by the buyer's solicitor, obtains a redemption statement if you have an existing mortgage, approves the contract and transfer deed, and repays any outstanding mortgage or charge on completion.",
      },
      {
        question: "Why do sales sometimes get delayed?",
        answer:
          "Selling is generally more paperwork-driven than buying — most of the work is answering the buyer's questions honestly and promptly, and delays in replying to enquiries are one of the most common reasons a sale slows down.",
      },
      {
        question: "Do I need a redemption statement to sell?",
        answer:
          "If there's an existing mortgage or charge on the property, yes — your conveyancer obtains a redemption statement from your lender showing exactly what's owed, so the mortgage can be repaid in full from the sale proceeds on completion.",
      },
      {
        question: "Can I sell without buying somewhere else at the same time?",
        answer:
          "Yes — a straightforward sale works whether or not you're buying elsewhere. If you are moving on to a new purchase at the same time, that's priced and handled as a linked sale and purchase instead, since the two need to complete together.",
      },
    ],
  },
  {
    slug: "sale-and-purchase",
    transactionType: "sale_and_purchase",
    activity: "selling and buying at the same time",
    heading: "Selling and buying at the same time",
    intro: serviceType("sale-and-purchase").intro,
    whatsInvolved: serviceType("sale-and-purchase").whatsInvolved,
    faqs: [
      {
        question: "Can I sell and buy on the same day?",
        answer:
          "That's the goal of a linked sale and purchase — your conveyancer runs both transactions in parallel and coordinates exchange and completion dates so they land on the same day, using the proceeds of your sale towards your onward purchase.",
      },
      {
        question: "What happens if the rest of my chain isn't ready to complete together?",
        answer:
          "Every other property in the chain is trying to align its own completion date too, which is what makes a linked move the most time-sensitive transaction type — your conveyancer manages search and enquiry replies on both sides at once to keep your end of the chain from being the one holding things up.",
      },
      {
        question: "Do I need bridging finance for a linked move?",
        answer:
          "Only if timings slip and you need to complete your purchase before your sale funds come through — your conveyancer can flag early if that risk applies to your specific chain, so you're not arranging it at the last minute.",
      },
      {
        question: "How does Stamp Duty or Land Transaction Tax work on a linked move?",
        answer:
          "The tax due is calculated on your purchase separately from your sale — selling a property doesn't reduce or offset the SDLT or LTT owed on the one you're buying. Our free calculator can give you a rough figure for the purchase side to budget for.",
      },
    ],
  },
  {
    slug: "remortgage",
    transactionType: "remortgage",
    activity: "remortgaging",
    heading: "Remortgaging",
    intro: serviceType("remortgage").intro,
    whatsInvolved: serviceType("remortgage").whatsInvolved,
    faqs: [
      {
        question: "Why do I need a conveyancer to remortgage?",
        answer:
          "Moving your mortgage to a new lender means the new lender needs to register a charge against the property and your existing lender's charge needs to be removed — a legal change to the title at HM Land Registry that a conveyancer has to handle, not just your mortgage broker.",
      },
      {
        question: "How long does a remortgage take?",
        answer:
          "Usually a matter of weeks rather than months, since there's no chain, no seller's solicitor to coordinate with, and often no need for fresh searches if you already have suitable indemnity or recent search results.",
      },
      {
        question: "What can slow a remortgage down?",
        answer:
          "A leasehold property where the new lender wants updated information from the management company, a Help to Buy equity loan that needs redeeming or updating, or delays in your existing lender confirming the redemption figure.",
      },
      {
        question: "Are remortgage legal fees cheaper than buying?",
        answer:
          "Usually, yes — there's less work involved than a full purchase, but firms still vary in what they charge and which disbursements they pass on, so it's still worth comparing itemised quotes rather than assuming a headline figure covers everything.",
      },
    ],
  },
  {
    slug: "transfer-of-equity",
    transactionType: "transfer_of_equity",
    activity: "a transfer of equity",
    heading: "Transfer of equity",
    intro: serviceType("transfer-of-equity").intro,
    whatsInvolved: serviceType("transfer-of-equity").whatsInvolved,
    faqs: [
      {
        question: "What is a transfer of equity?",
        answer:
          "It's a change to who owns a property without a full sale — commonly adding a partner to the title, removing an ex-partner after a separation or divorce, or transferring a share of a property as part of family or estate planning.",
      },
      {
        question: "Do I need my lender's consent to transfer equity?",
        answer:
          "If there's a mortgage on the property, yes — the lender has to consent to the change, and often needs the remaining party (or parties) to be assessed as able to afford the mortgage alone.",
      },
      {
        question: "Will I pay Stamp Duty or Land Transaction Tax on a transfer of equity?",
        answer:
          "It can apply if money or a share of a mortgage changes hands as part of the transfer — for example, one partner effectively taking on the other's share of an existing mortgage — even though no money is paid to an outside seller. Your conveyancer works out whether it applies to your specific situation.",
      },
      {
        question: "Why does a transfer of equity usually cost less than a full purchase?",
        answer:
          "It's usually simpler — no chain, often no new searches needed — so legal fees tend to be lower, though the amount of work still varies by firm and by situation, particularly where a mortgage lender needs to be involved.",
      },
    ],
  },
  {
    slug: "lease-extension",
    transactionType: "lease_extension",
    activity: "extending a lease",
    heading: "Extending a lease",
    intro: serviceType("lease-extension").intro,
    whatsInvolved: serviceType("lease-extension").whatsInvolved,
    faqs: [
      {
        question: "Why extend a lease?",
        answer:
          "As a lease gets shorter, a property becomes harder to mortgage and more expensive to extend later, and its value can be affected — many leaseholders extend well before their lease runs particularly short, to protect the property's value and make it easier to sell or remortgage in future.",
      },
      {
        question: "What's the difference between the statutory and informal route?",
        answer:
          "Qualifying leaseholders (generally having owned the property at least two years) have a legal right to extend under the statutory process, typically adding 90 years and reducing ground rent to a nominal amount, with set timescales. Negotiating informally with the freeholder can be quicker, but the terms aren't fixed by law in the same way.",
      },
      {
        question: "What does a conveyancer do during a lease extension?",
        answer:
          "Reviews the existing lease, serves or responds to the relevant statutory notices if that route is used, deals with the premium (usually assessed by a valuer rather than the conveyancer), and registers the new, extended lease at HM Land Registry once it's agreed.",
      },
      {
        question: "Will lease extension fees vary between firms?",
        answer:
          "Yes — it's specialised enough that not every firm handles it, and fees vary depending on whether the statutory or informal route is used, so an itemised quote helps show what's included in the legal fee versus what's a separate disbursement, such as valuation or Land Registry costs.",
      },
    ],
  },
];

export function getTransactionModifier(slug: string): TransactionModifier | undefined {
  return TRANSACTION_MODIFIERS.find((m) => m.slug === slug);
}
