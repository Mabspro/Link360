# Guided Pledge Path

A **micro guided path** (not a full product tour) that runs only after the user shows pledge intent by clicking a "Pledge Your Space" CTA. It reduces "where do I click now?" by spotlighting the next step with a dim overlay, highlight ring, and one-line tooltip.

## Behavior by Step

### Step A — Home hero CTA → Pools section

- **Trigger:** User clicks "Pledge Your Space" in the hero.
- **Actions:**
  - Set `sessionStorage`: `link360_pledge_intent = "from_hero"`.
  - Scroll to **Active Shipping Pools** (via `#pools`).
  - Briefly flash the "Active Shipping Pools" heading (subtle ring).
  - Highlight the **first pool card CTA** with tooltip: *"Choose a pool to pledge into."* and **[Skip]**.

### Step B — Pool card CTA → Pool page

- **Trigger:** User clicks "Pledge Your Space" on a pool card.
- **Actions:**
  - Set `sessionStorage`: `link360_pledge_intent = "from_pool_list"`.
  - Navigate to the pool page (existing link).

On **pool page load** when intent is present:

- Scroll the **pledge accordion** into view.
- **Auto-expand** "Make your pledge" if it is collapsed.
- Highlight the accordion header with tooltip: *"Start here to reserve your space."* and **[Skip]**.

### Step C — Pledge form (email)

- After the accordion is expanded, the guide moves to the **first field (Email)**.
- Tooltip: *"Enter your email to begin."* and **[Skip]**.

### Stop conditions

- **User focuses or types in the form** → Guidance stops immediately; intent is cleared.
- **User clicks [Skip]** → Overlay closes; intent is cleared.
- No further spotlight or tooltips after that.

## Guardrails

- **Only after pledge intent** — Guidance runs only when the user has clicked a pledge CTA (hero or pool card).
- **Once per session** — Intent is stored in `sessionStorage`; clicking the CTA again resets intent so the path can run again.
- **Respects `prefers-reduced-motion`** — Pulsing animation on the highlight ring is disabled; the ring remains static.
- **Always skippable** — Every tooltip has a **[Skip]** control (top-right).

## Implementation details

- **Intent key:** `link360_pledge_intent` (`"from_hero"` | `"from_pool_list"`).
- **Targeting:** Elements are tagged with `data-guide` for stable, non-brittle targeting:
  - `data-guide="pools-section"` — Section wrapper (for scroll/flash).
  - `data-guide="pool-cta"` — First pool card’s "Pledge Your Space" button.
  - `data-guide="pledge-accordion"` — "Make your pledge" accordion header.
  - `data-guide="pledge-email"` — Email input in the pledge form.
- **Components:**
  - `GuideOverlay` — Portal-based dim overlay, highlight ring, tooltip, Skip; repositions on scroll/resize.
  - `PoolsSectionGuide` — Home page: reads intent, scrolls, flashes heading, shows overlay on first pool CTA.
  - `PoolPagePledgeGuide` — Pool page: reads intent, auto-expands accordion, runs accordion → email steps, clears on form interaction.
  - `HeroCtaWithIntent` — Hero CTA that sets `from_hero` on click.
- **PledgeForm** — Optional `onFormInteraction` callback (first focus/input) to stop guidance and clear intent.

## How to disable

- **For a user:** Click **[Skip]** on any tooltip, or interact with the form (focus/type). Intent is cleared for the session.
- **In code:** Do not set `link360_pledge_intent` in sessionStorage, or clear it: `sessionStorage.removeItem('link360_pledge_intent')`.
- **Reduced motion:** System preference `prefers-reduced-motion: reduce` disables the ring pulse only; the path and overlay still run.

## Edge cases

- **No pools:** If there are no active pools, the home guide does not show the pool-cta spotlight (no target).
- **Pool page without intent:** If the user lands on a pool page without having clicked a pool CTA (e.g. direct link), no guidance runs.
- **Resize/scroll:** The overlay and ring reposition when the window is resized or the page is scrolled so the highlight stays aligned with the target.
