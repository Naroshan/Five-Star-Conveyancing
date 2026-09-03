import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LegalPageBody, type LegalSection } from "@/components/LegalPageBody";

export const metadata: Metadata = {
  title: "Complaints Procedure — Five Star Conveyancing",
  description: "How to raise a complaint about the comparison service, or about a firm you instructed through it.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Two different kinds of complaint",
    body: [
      "It matters which of these your complaint is about, because they're handled in completely different places:",
      "A complaint about the comparison service itself — for example, a technical problem with the site, a quote that displayed incorrectly, or how we've handled your personal information — should come to us, Five Star Conveyancing. See section 3 below.",
      "A complaint about the legal work carried out by a firm you instructed through our comparison — for example, delays, communication, or the quality of their conveyancing — is a matter between you and that firm. We aren't involved in and can't investigate the actual legal work, since we don't carry it out. See section 2 below.",
    ],
  },
  {
    heading: "2. Complaining about a firm you instructed",
    body: [
      "Every firm on our panel is regulated by the Solicitors Regulation Authority (SRA) or the Council for Licensed Conveyancers (CLC), and every SRA-regulated firm is required to have its own complaints procedure — start there. Their contact details are on the results page where you selected them, and in any correspondence they've sent you since.",
      "If you've been through the firm's own complaints process and you're still not satisfied, you may be able to take your complaint to the Legal Ombudsman, which handles unresolved complaints about legal services in England and Wales. There are time limits on referring a complaint to the Legal Ombudsman (normally within six months of the firm's final response), so it's worth checking their website (legalombudsman.org.uk) for current details.",
    ],
  },
  {
    heading: "3. Complaining about Five Star Conveyancing",
    body: [
      "If your complaint is about us — the comparison service itself, not the legal work of a firm you instructed — get in touch via our Contact page, or by phone, with as much detail as you can give us.",
      "We'll acknowledge your complaint within 5 working days, investigate, and aim to give you a full written response within 8 weeks. If it's going to take longer than that, we'll let you know why and give you a revised timeframe.",
    ],
  },
  {
    heading: "4. If you're not satisfied with our response",
    body: [
      "If you've been through our complaints process above and remain unhappy with the outcome, you can raise a data protection concern with the Information Commissioner's Office (ico.org.uk) if your complaint relates to how we've handled your personal information.",
    ],
    callout:
      "Whether the comparison service itself belongs to an independent alternative dispute resolution (ADR) scheme beyond the ICO (for complaints not related to data protection) is still to be confirmed — to add here if the business joins one.",
  },
  {
    heading: "5. Contact us",
    body: ["The quickest way to reach us is via our Contact page, or by phone."],
  },
];

export default function ComplaintsProcedurePage() {
  return (
    <>
      <SiteHeader />
      <LegalPageBody
        eyebrow="Legal"
        title="Complaints Procedure"
        intro="How to raise a complaint — whether it's about our comparison service, or about a firm you instructed through it."
        sections={SECTIONS}
      />
      <SiteFooter />
    </>
  );
}
