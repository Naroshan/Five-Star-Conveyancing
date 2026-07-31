// Lets GetAQuoteForm (mounted on /get-a-quote) warn before the header's
// "Get a quote" link resets an in-progress quote — they're siblings under
// the page, not parent/child, and clicking that link while already on
// /get-a-quote is otherwise a same-URL no-op Next.js Link click, so there's
// no route-change event to hook into. A plain module-level registration is
// simpler than introducing a Context provider for a single cross-component
// signal like this.

interface QuoteExitGuard {
  confirmMessage: string;
  reset: () => void;
}

let activeGuard: QuoteExitGuard | null = null;

export function registerQuoteExitGuard(guard: QuoteExitGuard) {
  activeGuard = guard;
}

export function clearQuoteExitGuard() {
  activeGuard = null;
}

// Returns true if the header link should proceed as a normal navigation
// (no in-progress quote to protect). Returns false if it already handled
// the click itself (asked for confirmation and, if confirmed, reset the
// form in place) — the caller should preventDefault in that case.
export function interceptQuoteLinkClick(): boolean {
  if (!activeGuard) return true;
  if (window.confirm(activeGuard.confirmMessage)) {
    activeGuard.reset();
  }
  return false;
}
