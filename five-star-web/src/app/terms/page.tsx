import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LegalPageBody, type LegalSection } from "@/components/LegalPageBody";

export const metadata: Metadata = {
  title: "Terms & Conditions — Five Star Conveyancing",
  description: "The terms that apply to using the Five Star Conveyancing comparison service.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Who we are and what these terms cover",
    body: [
      "Five Star Conveyancing is a trading style of The Lead Gen Co LTD (\"we\", \"us\", \"our\"). These terms apply whenever you use fivestarconveyancing.co.uk (\"the site\") to compare, request, or select a conveyancing quote.",
      "By using the site, you agree to these terms. If you don't agree to them, please don't use the site.",
    ],
    callout: "Company registration number and registered office address to be added here once confirmed.",
  },
  {
    heading: "2. What we are — and what we aren't",
    body: [
      "We're a comparison service. We help you compare itemised quotes from conveyancing firms who are regulated by the Solicitors Regulation Authority (SRA) or the Council for Licensed Conveyancers (CLC).",
      "We are not a law firm, we do not carry out conveyancing ourselves, and nothing on this site is legal advice. Once you select a firm, the actual conveyancing work — and the professional relationship, including their own terms of business — is between you and that firm, not us.",
    ],
  },
  {
    heading: "3. Who can use this service",
    body: [
      "The service is for property transactions in England and Wales only — our panel firms and the fee/tax calculations shown are built around England & Wales conveyancing and Stamp Duty Land Tax / Land Transaction Tax, and the site is only available to visitors browsing from within England and Wales.",
      "You must be at least 18 years old to use the site, and the information you give us should be accurate and about a genuine transaction you're considering.",
    ],
  },
  {
    heading: "4. Quotes shown on the site",
    body: [
      "Every quote shows the legal fee, VAT, and disbursements as separate line items, based on the answers you give us. These are estimates from the firms on our panel, calculated from the information you provide — they aren't a guarantee of the final cost, which the firm you instruct will confirm once they have full details of your transaction.",
      "Each line item is marked as either guaranteed or estimated (see our Fees Explained page) so you can see which figures are fixed and which may still vary.",
      "We don't guarantee that any firm will accept your instruction, that your transaction will complete, or that the price shown will be the price you're ultimately charged if the facts of your transaction turn out to differ from what you told us.",
    ],
  },
  {
    heading: "5. Selecting a firm",
    body: [
      "When you select a firm from your comparison, we pass your details to that firm so they can contact you directly. That's the extent of our involvement — from that point, you're dealing with the firm directly, under their own terms of business and their own complaints procedure.",
      "You're free to change your mind and not proceed with a firm you've selected here — selecting a firm through the comparison isn't a binding instruction, and there's no fee for simply not proceeding.",
    ],
  },
  {
    heading: "6. How we're funded",
    body: [
      "The comparison is free for you to use. We may receive a fee or commission from a firm when you go on to instruct them — this doesn't affect the price you pay, and doesn't influence which firms appear in your results, which is based purely on your answers and each firm's own published eligibility and fees.",
    ],
  },
  {
    heading: "7. Your responsibilities",
    body: [
      "You're responsible for giving us accurate information about your transaction, and for your own decision about which firm, if any, to instruct. We're not responsible for advice given by, or the quality of work carried out by, any firm you choose from our comparison.",
    ],
  },
  {
    heading: "8. Intellectual property",
    body: ["The site's content, design, and branding belong to us or our licensors. You may use the site for its intended purpose — comparing and requesting conveyancing quotes — but not copy, reproduce, or reuse our content for other purposes without permission."],
  },
  {
    heading: "9. Liability",
    body: [
      "We provide the site on an \"as is\" basis and don't guarantee it will always be available, error-free, or uninterrupted.",
      "To the extent permitted by law, we exclude liability for losses arising from: the acts, omissions, advice, or work of any conveyancing firm you instruct; inaccuracies in a quote caused by information you provided; or your reliance on figures (including SDLT/LTT calculator results) that are estimates, not confirmed final costs.",
      "Nothing in these terms excludes or limits liability where it would be unlawful to do so — for example, liability for fraud or for death or personal injury caused by our negligence.",
    ],
  },
  {
    heading: "10. Links to other websites",
    body: ["The site may link to third-party websites, including panel firms' own sites and services like LiveChat. We aren't responsible for the content or practices of websites we don't operate."],
  },
  {
    heading: "11. Changes to these terms or the site",
    body: ["We may update these terms, or change or withdraw any part of the site, at any time. The current version of these terms is always the one published on this page."],
  },
  {
    heading: "12. Governing law",
    body: ["These terms are governed by the law of England and Wales, and any dispute relating to them is subject to the exclusive jurisdiction of the courts of England and Wales."],
  },
  {
    heading: "13. Complaints",
    body: ["If something's gone wrong with the comparison service itself, see our Complaints Procedure. If your complaint is about the legal work carried out by a firm you instructed, that firm's own complaints procedure — which every SRA-regulated firm must publish — is the right place to start."],
  },
  {
    heading: "14. Contact us",
    body: ["Questions about these terms are welcome via our Contact page, or by phone."],
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <LegalPageBody eyebrow="Legal" title="Terms & Conditions" intro="The terms that apply when you use our conveyancing comparison service." sections={SECTIONS} />
      <SiteFooter />
    </>
  );
}
