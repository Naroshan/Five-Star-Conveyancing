import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, CREAM, TEXT_BODY, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import { FaqAccordion } from "@/components/FaqAccordion";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = {
  title: "FAQ — Five Star Conveyancing",
  description: "Common questions about comparing conveyancing quotes with Five Star Conveyancing.",
};

const FAQS = [
  {
    q: "Is the comparison free to use?",
    a: "Yes, completely. There's no charge at any point for getting a quote, comparing firms side by side, or selecting the one you want to instruct. We don't ask for payment details, and we never will — the only thing we ask for is enough information about your transaction and your contact details, so the firm you choose can get in touch with you directly. If a firm ever asks you to pay just to receive their fee quote, that's not how this service works and you should treat it as a red flag.",
  },
  {
    q: "Are the firms regulated?",
    a: "Yes. Every firm shown in a comparison is regulated by the Solicitors Regulation Authority (SRA), the body that oversees solicitors and law firms in England and Wales. We don't list unregulated 'conveyancing providers' or claims-management-style middlemen — every result you see is a genuine SRA-regulated firm, and their SRA number is shown on the results page so you can look them up independently if you want to.",
  },
  {
    q: "How long does a quote stay valid?",
    a: "It varies by firm — each participating firm sets its own quote validity period when they publish their fees, and the results page shows the specific expiry date that applies to your quote. In general, a conveyancing quote is only ever an estimate based on the answers you gave at the time; if something about the transaction changes materially (for example the agreed price moves, or a legal complication comes to light once searches are back), the actual firm handling your case may need to revise their fee, in the same way any solicitor would.",
  },
  {
    q: "What happens after I select a firm?",
    a: "We pass your name, contact details, and the answers you gave about your transaction to that firm, so they can get in touch with you directly to start the process. Selecting a firm through the comparison isn't a binding contract with them or with us — you're free to change your mind and instruct a different firm at any point before you've formally engaged one, and there's no cancellation fee for simply not proceeding with a firm you selected here.",
  },
  {
    q: "Why are fees shown as legal fee, VAT, and disbursements separately, rather than one total?",
    a: "Because a single bundled number hides how it's actually made up, and makes it hard to compare firms fairly — one firm's 'all-in' figure might include disbursements that another firm charges separately, so a lower headline total isn't always the cheaper option once you look closely. Showing legal fee, VAT, and disbursements as distinct lines means you can see exactly what you're paying for and to whom before you commit to anyone. See our fees explained page for a full walkthrough of each term.",
  },
  {
    q: "What information do I need to get a quote?",
    a: "At minimum: what you're doing (buying, selling, remortgaging, and so on), the property's postcode, its approximate value, whether it's freehold or leasehold, and whether a mortgage is involved. A handful of situations — buy-to-let, shared ownership, Help to Buy, Right to Buy, Islamic finance arrangements, the Building Safety Act, or an unregistered title — can affect the fee, so the form asks about those too where they're relevant to your transaction type. None of it is used for anything beyond generating your comparison and, if you choose to proceed, introducing you to the firm you pick.",
  },
  {
    q: "Do the quotes include Stamp Duty Land Tax (or Land Transaction Tax in Wales)?",
    a: "Where SDLT or LTT applies, we show an indicative estimate alongside the legal fee, VAT, and disbursements, calculated from the property value and transaction details you provide. It's clearly labelled as indicative because the exact amount can depend on factors a short online form can't always capture in full — for example additional-property surcharges, first-time buyer relief, or multiple dwellings relief. Your conveyancer will confirm the exact figure once they have the complete picture of your transaction.",
  },
  {
    q: "What's the difference between a guaranteed fee and an estimated one?",
    a: "A guaranteed fee is one the firm has committed to for your transaction as described — it shouldn't change unless the transaction itself changes materially. An estimated fee (disbursements are the most common example, since some third-party costs like search fees can vary slightly by area or provider) is the firm's best current figure, but isn't fixed the way a guaranteed fee is. Each line item on your results page is labelled with which one it is, so there's no guesswork about which numbers are locked in.",
  },
  {
    q: "What if no firms show up for my quote?",
    a: "If a firm doesn't cover your transaction type, doesn't currently publish a fee for a property at your value, or has a restriction that rules your transaction out, they simply won't appear in your results rather than showing an inaccurate price — we'd rather show you fewer, accurate results than pad the list with numbers that don't actually apply to you. If your comparison comes back empty, try adjusting the details (for example, double-checking the property value) or get in touch and we'll try to help.",
  },
  {
    q: "Can I compare quotes for Wales as well as England?",
    a: "The comparison covers both jurisdictions — property law and the relevant tax (Land Transaction Tax rather than Stamp Duty Land Tax) differ slightly in Wales, and the calculation accounts for that based on the property's location.",
  },
  {
    q: "Is my information kept private?",
    a: "Your answers and contact details are used to generate your comparison and, only if and when you choose to select a firm, passed to that specific firm so they can contact you. We don't sell your details to third parties or share them with firms you haven't selected.",
  },
  {
    q: "What if I have a complaint about a firm I instructed through the site?",
    a: "Complaints about how a transaction was actually handled are a matter between you and the firm you instructed — they're the ones regulated by the SRA for the work itself, and the SRA's own complaints process applies to them directly. Our own regulatory disclosures and complaints procedure covering the comparison service itself are pending final review before publication; in the meantime, if something's gone wrong, get in touch via our contact page and we'll do what we can to help.",
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            Questions, answered
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: 0, letterSpacing: "-0.02em" }}>
            Frequently asked questions
          </h1>
        </section>

        <div className={contentStyles.list}>
          <FaqAccordion items={FAQS} />
        </div>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <p style={{ fontSize: 13.5, color: TEXT_BODY, marginBottom: 28 }}>
            See also:{" "}
            <Link href="/how-it-works" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              how it works
            </Link>{" "}
            and{" "}
            <Link href="/fees-explained" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              fees explained
            </Link>
            .
          </p>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
