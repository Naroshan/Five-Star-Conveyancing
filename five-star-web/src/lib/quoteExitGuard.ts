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

// General-purpose exit gate for any link that might navigate away from an
// in-progress quote (e.g. the logo). Returns true if it's safe to proceed —
// either there's no quote in progress, or the visitor confirmed and the
// form was reset. Returns false if the visitor cancelled, so the caller
// should preventDefault and stay put.
export function confirmQuoteExit(customMessage?: string): boolean {
  if (!activeGuard) return true;
  if (window.confirm(customMessage ?? activeGuard.confirmMessage)) {
    activeGuard.reset();
    return true;
  }
  return false;
}

// Returns true if the header link should proceed as a normal navigation
// (no in-progress quote to protect). Returns false if it already handled
// the click itself (asked for confirmation and, if confirmed, reset the
// form in place) — the caller should preventDefault in that case. Used by
// the "Get a quote" nav link specifically, which is a same-URL no-op when
// already on /get-a-quote, so a reset-in-place is all that's needed.
export function interceptQuoteLinkClick(): boolean {
  if (!activeGuard) return true;
  confirmQuoteExit();
  return false;
}
