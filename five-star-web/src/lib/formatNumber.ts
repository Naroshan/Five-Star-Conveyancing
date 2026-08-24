// Shared by every price input (HeroQuoteWidget, GetAQuoteForm) so typed
// property values display with thousands separators (e.g. "350,000")
// instead of a bare digit string, while state/submission still work with
// plain digits.

// Strips everything but digits — used on user input before storing state.
export function toDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

// Formats a plain digit string with thousands separators for display.
export function formatThousands(digits: string): string {
  if (!digits) return "";
  return Number(digits).toLocaleString("en-GB");
}
