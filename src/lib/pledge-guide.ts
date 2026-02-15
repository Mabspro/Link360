/**
 * Session-only pledge intent for the guided path.
 * Cleared when step completes, user skips, or form interaction starts.
 */
const KEY = "link360_pledge_intent";

export type PledgeIntent = "from_hero" | "from_pool_list" | null;

export function getPledgeIntent(): PledgeIntent {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(KEY);
  if (v === "from_hero" || v === "from_pool_list") return v;
  return null;
}

export function setPledgeIntent(intent: "from_hero" | "from_pool_list"): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, intent);
}

export function clearPledgeIntent(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mq.matches;
}
