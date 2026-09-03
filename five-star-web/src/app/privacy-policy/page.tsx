import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LegalPageBody, type LegalSection } from "@/components/LegalPageBody";

export const metadata: Metadata = {
  title: "Privacy Policy — Five Star Conveyancing",
  description: "How Five Star Conveyancing collects, uses, and protects your personal information.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "1. Who we are",
    body: [
      "Five Star Conveyancing is a trading style of The Lead Gen Co LTD (\"we\", \"us\", \"our\"). We're a comparison service — we help you compare conveyancing quotes from SRA and CLC regulated solicitors and licensed conveyancers; we don't carry out conveyancing ourselves.",
      "For the purposes of UK data protection law (the UK GDPR and the Data Protection Act 2018), The Lead Gen Co LTD is the data controller for the personal information described in this policy.",
    ],
    callout:
      "Company registration number, registered office address, and ICO registration reference to be added here once confirmed.",
  },
  {
    heading: "2. What information we collect",
    body: [
      "Transaction details you give us to generate a comparison: what you're doing (buying, selling, remortgaging, and so on), the property's postcode, its approximate value, tenure, whether a mortgage is involved, and any other details relevant to your transaction type (for example buy-to-let, shared ownership, or Help to Buy).",
      "Contact details, when you provide them: your name, email address, and phone number. Our quote comparison itself doesn't require these up front — we only ask for them when you choose to select a firm, use the \"email me a link to my quotes\" option, or contact us directly.",
      "Calculator inputs: if you use our free Stamp Duty Land Tax / Land Transaction Tax calculator and ask us to email you the result, we collect the email address and the figures you entered.",
      "Usage and analytics data, but only if you accept cookies via the banner shown on the site — see the Cookies section below.",
      "Standard technical data collected by any website (such as IP address and browser type as part of normal web server operation), used only for security and to keep the site running.",
    ],
  },
  {
    heading: "3. How we use your information",
    body: [
      "To generate your quote comparison and show it to you.",
      "To pass your details to the specific firm you choose to instruct, so they can contact you and take your transaction forward. We only ever share your details with the one firm you select — never with firms you didn't choose.",
      "To send you a link back to your comparison, if you ask us to (our abandonment-recovery option) or to email you a copy of a specific quote or your SDLT/LTT calculation.",
      "To respond to questions or complaints you send us directly.",
      "To understand how the site is used and improve it, and to operate live chat support — both only where you've accepted cookies for these purposes.",
      "To keep the site secure and prevent misuse.",
    ],
  },
  {
    heading: "4. Our legal basis for using your information",
    body: [
      "Performance of a contract: generating your comparison and passing your details to a firm you select is necessary to provide the service you've asked for.",
      "Consent: analytics and live chat cookies are only set once you've actively accepted them via our cookie banner, and you can withdraw that consent at any time by clearing your cookies and choosing \"Reject\" next time you visit.",
      "Legitimate interests: keeping the site secure, preventing fraud or misuse, and improving our service — always balanced against your right to privacy.",
      "Legal obligation: where we're required to keep certain records, for example for accounting purposes.",
    ],
  },
  {
    heading: "5. Who we share your information with",
    body: [
      "The specific firm you choose to instruct from your comparison — and only that firm, only once you've made your selection.",
      "Service providers who process data on our behalf (\"processors\"), under contract and only for the purposes we specify: our email provider (Microsoft) for sending quote and account emails, our live chat provider (LiveChat Inc.), our analytics provider (Google), and our hosting and database providers who keep the site and its data running.",
      "We do not sell your personal information to anyone, and we don't share it with any firm you haven't selected.",
    ],
  },
  {
    heading: "6. International transfers",
    body: [
      "Some of the service providers listed above may process data outside the UK. Where that happens, we rely on legally recognised safeguards (such as the UK's International Data Transfer Agreement or equivalent standard contractual clauses) to make sure your information stays protected to UK standards.",
    ],
  },
  {
    heading: "7. How long we keep your information",
    body: [
      "We keep your information for as long as necessary to provide the service, deal with any related enquiries, and meet our legal and accounting obligations. Individual quote comparisons are valid for a limited number of days (shown on your results page), after which they expire — but expiry of a quote is separate from deletion of the underlying data, which follows the retention principle above.",
    ],
    callout: "A specific numeric retention schedule (e.g. \"deleted after X months\") is pending review, and would need a matching automated deletion process built to back it up before being published as a firm commitment.",
  },
  {
    heading: "8. Your rights",
    body: [
      "Under UK data protection law, you have the right to: access the personal information we hold about you; have inaccurate information corrected; ask us to delete your information in certain circumstances; restrict or object to certain processing; receive your information in a portable format; and withdraw consent at any time where we rely on consent (for example, cookies).",
      "To exercise any of these rights, get in touch via our Contact page or by phone. You also have the right to complain to the Information Commissioner's Office (ICO), the UK's data protection regulator, at ico.org.uk — though we'd appreciate the chance to resolve any concern directly first.",
    ],
  },
  {
    heading: "9. Cookies",
    body: [
      "We use a small number of cookies. Cookies that are strictly necessary for the site to function are always active. Analytics cookies (Google Analytics) and live chat cookies (LiveChat) are only set once you've actively accepted them via the cookie banner shown on your first visit — until then, neither of those services loads at all. You can change your choice at any time by clearing your browser's cookies for this site.",
    ],
  },
  {
    heading: "10. Children",
    body: ["Our service is intended for adults arranging their own property transactions and isn't directed at children. We don't knowingly collect personal information from anyone under 18."],
  },
  {
    heading: "11. How we protect your information",
    body: [
      "We use technical and organisational measures appropriate to the information we hold — for example, our administrative systems require multi-factor authentication and use securely hashed passwords, and data is transmitted over encrypted connections.",
    ],
  },
  {
    heading: "12. Changes to this policy",
    body: ["We may update this policy from time to time, for example if the way we use your information changes. Any changes will be posted on this page."],
  },
  {
    heading: "13. Contact us",
    body: [
      "If you have any questions about this policy or how we handle your information, please get in touch via our Contact page, or by phone.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <LegalPageBody eyebrow="Legal" title="Privacy Policy" intro="How we collect, use, and protect your personal information." sections={SECTIONS} />
      <SiteFooter />
    </>
  );
}
