import { HomeIcon, SwapIcon, RefreshIcon, UsersIcon, DocumentExtendIcon, type IconProps } from "@/components/icons";
import { TEAL, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD } from "@/lib/theme";

export interface ServiceType {
  slug: string;
  title: string;
  short: string;
  icon: (props: IconProps) => React.JSX.Element;
  iconBg: string;
  iconColor: string;
  intro: string;
  whatsInvolved: string[];
  whoItsFor: string;
}

const ACCENT = "oklch(0.5 0.22 350)";
const GOLD_ICON = "oklch(0.6 0.14 80)";

export const SERVICE_TYPES: ServiceType[] = [
  {
    slug: "purchase",
    title: "Purchase",
    short: "Buying a property, freehold or leasehold, with or without a mortgage.",
    icon: HomeIcon,
    iconBg: ICON_BADGE_BG,
    iconColor: TEAL,
    intro:
      "Buying a property is usually the most involved of the transaction types, because your conveyancer is acting for you on two fronts at once: protecting your interest in the property itself, and — if you're using a mortgage — satisfying your lender's own legal requirements before they'll release funds.",
    whatsInvolved: [
      "Local authority, water and drainage, and environmental searches on the property",
      "Reviewing the title and raising enquiries with the seller's solicitor",
      "Liaising with your mortgage lender's solicitor (or acting for both of you, where permitted)",
      "Calculating and submitting your Stamp Duty Land Tax (or Land Transaction Tax in Wales) return",
      "Exchanging contracts, then completing and registering your ownership with HM Land Registry",
    ],
    whoItsFor: "First-time buyers, home movers, and anyone buying with or without a mortgage, freehold or leasehold.",
  },
  {
    slug: "sale",
    title: "Sale",
    short: "Selling a property you own.",
    icon: HomeIcon,
    iconBg: ICON_BADGE_BG_ACCENT,
    iconColor: ACCENT,
    intro:
      "Selling is generally more paperwork-driven than buying: most of the work is answering the buyer's questions about the property honestly and promptly, since delays in replying to enquiries are one of the most common reasons a sale slows down.",
    whatsInvolved: [
      "Completing the Property Information and Fittings & Contents forms",
      "Responding to enquiries raised by the buyer's solicitor",
      "Obtaining a redemption statement if you have an existing mortgage to pay off",
      "Approving the contract and transfer deed",
      "Completing and repaying any outstanding mortgage or charge on the property",
    ],
    whoItsFor: "Anyone selling a property they own outright or with a mortgage, whether or not they're buying elsewhere at the same time.",
  },
  {
    slug: "sale-and-purchase",
    title: "Sale and purchase",
    short: "Selling your current property and buying your next one at the same time.",
    icon: SwapIcon,
    iconBg: ICON_BADGE_BG_GOLD,
    iconColor: GOLD_ICON,
    intro:
      "A linked sale and purchase is the most time-sensitive transaction type, because your sale and purchase need to complete on the same day — and every other property in your chain is trying to align its own completion date too.",
    whatsInvolved: [
      "Running your sale and purchase in parallel, rather than one after the other",
      "Coordinating exchange and completion dates with everyone else in the chain",
      "Using the proceeds of your sale towards your purchase, and arranging any bridging if timings slip",
      "Managing search and enquiry replies on both transactions at once",
      "A single moving day: completing your sale and purchase together",
    ],
    whoItsFor: "Anyone moving house who needs to sell their current property to fund the next one.",
  },
  {
    slug: "remortgage",
    title: "Remortgage",
    short: "Switching mortgage lender or deal on a property you already own.",
    icon: RefreshIcon,
    iconBg: ICON_BADGE_BG,
    iconColor: TEAL,
    intro:
      "Remortgaging is usually the quickest transaction type, since there's no chain and you're not changing who owns the property — your conveyancer is mainly confirming the title is clear and handling the switch from your old lender's charge to your new one.",
    whatsInvolved: [
      "Confirming the property's title and ownership are in order for your new lender",
      "Obtaining a redemption statement for your existing mortgage",
      "Registering your new lender's charge and removing the old one at HM Land Registry",
      "A search refresh, depending on how long ago your last searches were done",
    ],
    whoItsFor: "Homeowners switching lender or deal on a property they already own, without moving.",
  },
  {
    slug: "transfer-of-equity",
    title: "Transfer of equity",
    short: "Adding or removing a name from the title of a property.",
    icon: UsersIcon,
    iconBg: ICON_BADGE_BG_ACCENT,
    iconColor: ACCENT,
    intro:
      "A transfer of equity changes who's on the title without a full sale — commonly after marriage, divorce, separation, or simply changing how ownership shares are split between joint owners. If there's a mortgage on the property, your lender's consent is normally needed as part of the process.",
    whatsInvolved: [
      "Preparing and registering the transfer deed with HM Land Registry",
      "Getting your mortgage lender's consent, if there's a mortgage on the property",
      "Working out whether Stamp Duty Land Tax applies to the transfer (it can, depending on any mortgage debt taken on)",
      "Updating the title register to reflect the new ownership split",
    ],
    whoItsFor: "Anyone adding or removing a name from a property's title — for example after marriage, divorce, or a change in ownership share.",
  },
  {
    slug: "lease-extension",
    title: "Lease extension",
    short: "Extending the remaining term of a leasehold property.",
    icon: DocumentExtendIcon,
    iconBg: ICON_BADGE_BG_GOLD,
    iconColor: GOLD_ICON,
    intro:
      "Extending a lease keeps a leasehold property's value up and makes it easier to sell or remortgage later — most lenders are cautious about short leases. You can usually extend informally (negotiating directly with the freeholder) or through the statutory process, which gives qualifying leaseholders a legal right to extend.",
    whatsInvolved: [
      "Checking whether you qualify for the statutory lease extension process",
      "Serving (or responding to) the formal notice that starts the statutory process",
      "Negotiating the premium payable to the freeholder, often alongside a valuer",
      "Registering the new, longer lease at HM Land Registry",
    ],
    whoItsFor: "Leaseholders whose lease term is getting short, or who simply want the security of a longer lease.",
  },
];

export function getServiceType(slug: string): ServiceType | undefined {
  return SERVICE_TYPES.find((s) => s.slug === slug);
}
