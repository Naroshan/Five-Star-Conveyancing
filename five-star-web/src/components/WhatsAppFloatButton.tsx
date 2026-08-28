import { WhatsAppIcon } from "./icons";

const WHATSAPP_GREEN = "#25D366";
// Business number, international format, no punctuation — 020 7790 2000.
const WHATSAPP_NUMBER = "442077902000";
const PREFILLED_MESSAGE = "Hi, I'd like some help with my conveyancing quote.";

// Fixed bottom-right, stacked directly above the LiveChat bubble (which
// docks at the same corner with roughly a 60px-diameter button and a ~20px
// margin) so the two don't overlap.
export function WhatsAppFloatButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        right: 20,
        bottom: 96,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: WHATSAPP_GREEN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        zIndex: 2147483000,
      }}
    >
      <WhatsAppIcon size={28} color="#ffffff" />
    </a>
  );
}
