"use client";

// Client-side half of the England & Wales restriction. The geo-block edge
// function injects a tiny inline script setting window.__FSC_REGION_RESTRICTED__
// before the page's own scripts run, for visitors outside England & Wales.
// Components use this hook to swap a quote form, phone link, or similar
// conversion surface for an explanatory message — see
// src/lib/regionRestriction.ts for why the real enforcement lives server-side,
// not here.

import { useSyncExternalStore } from "react";

declare global {
  interface Window {
    __FSC_REGION_RESTRICTED__?: boolean;
  }
}

function readRestricted(): boolean {
  try {
    return window.__FSC_REGION_RESTRICTED__ === true;
  } catch {
    return false;
  }
}

// Nothing to subscribe to — the flag is set once, before hydration, and
// never changes for the lifetime of the page. useSyncExternalStore is still
// the right tool over a plain module-level read because its post-hydration
// re-check (comparing against getServerSnapshot) is what picks up the flag
// at all: server-rendered/statically-generated HTML has no geo data, so the
// server snapshot must always be false.
function subscribe() {
  return () => {};
}
function getServerSnapshot(): boolean {
  return false;
}

export function useIsRegionRestricted(): boolean {
  return useSyncExternalStore(subscribe, readRestricted, getServerSnapshot);
}
