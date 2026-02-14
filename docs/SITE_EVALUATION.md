# Link360 – Full Site Evaluation

Evaluation date: Feb 2025. Covers logic, routes, UI/UX, feel, potential, and gaps for planning updates.

**Strategic update (post-feedback):** This doc incorporates a systems-level reframe (coordination primitive, trust compression, B/C direction) **and** POC discipline: we are building **a container interest engine for NorCal → Zambia**. Everything else is latent. Two tracks: **Track A = POC fit** (visible: solve exact friction, ship a real container, observe). **Track B = architectural optionality** (quiet: design so it could generalize later; do not expose or complicate UX yet).

---

## 0. Strategic direction (B/C) — and POC constraint

### POC anchor

**You are not building “a diaspora coordination protocol” right now.**

You are building:

**A container interest engine for NorCal → Zambia.**

If we violate that constraint, velocity dies. Uber started in one city; Airbnb with one apartment. You start with one container.

**What POC actually requires (nothing more):**

1. Can I quickly see if this container will actually happen?
2. Can I estimate my cost clearly?
3. Can I declare my interest without embarrassment or friction?
4. Does this feel organized and trustworthy?

**Not (yet):** reputation systems, cross-community scaling, bulk purchasing engines, multi-vertical coordination. Those are Phase 3 conversations.

**Guardrail rule:** If a feature does not improve **conversion rate**, **trust perception**, **admin efficiency**, or **container fill speed** — it waits. This prevents platform drift.

### What we’re building (and what’s latent)

**Visible (POC):** A container interest engine for NorCal → Zambia. In systems language, that’s still:

- **Trust compression engine** — Removes “Will this container actually ship?” (psychologically like Uber removing “Will a taxi show up?”).
- **Liquidity discovery** — Public thermometer, quantified progress, visible commitment.
- **Friction reduction** — Formal declarations, cost transparency, recorded commitment instead of WhatsApp chaos.

**Positioning (for when we talk about it):** “Structured container coordination for diaspora logistics.” The product is **confidence through transparency**, not shipping per se.

**Latent (B/C direction, not exposed in POC):** Scalable diaspora logistics platform (B); proof-of-concept for broader micro-coordination (C). That implies a **Commitment Liquidity Engine** — “a system that transforms informal social intent into structured, measurable, threshold-triggered economic action” — applicable later to group imports, bulk buys, equipment pooling, etc. **We design for optionality; we don’t ship it yet.**

### The missing layer (scoped to POC): declaration friction

Current flow assumes user knows dimensions, box type, weight. **Cognitive load kills conversion** in this market.

**POC-scoped solution (no new workflow):**

- **Optional: “Upload packing list (to help you fill this form faster).”**
- AI extracts dimensions / box counts.
- **Pre-fills the existing pledge form.**
- User edits and confirms; submits as today.

No automation. No new abstraction. No “upload → magic → done.” Just **friction reduction** inside the current flow. Design principle: **AI proposes. Human confirms. System records.**

### AI declaration layer — architecture (POC-fit)

So we don’t overbuild, we implement only what serves “pre-fill form faster”:

| Step | POC scope | Later (Phase 2+) |
|------|-----------|------------------|
| **1. Upload intake** | Optional file (PDF, Excel, CSV, image); store in Supabase Storage; admin can view. | Same. |
| **2. AI parse** | Call OpenAI/Claude; structured output: items, estimated box grouping, dimensions, weight; prohibited flags. | Add confidence score, “Needs manual review.” |
| **3. Confidence** | Optional: show “We estimate 3 medium boxes. Confirm or edit.” in UI. | Editable preview, confidence score in DB. |
| **4. Pledge** | Pre-fill form fields; user submits via **existing** pledge form. No new “draft” workflow. | Optional: save as draft, resume later. |

**Suggested backend (optionality without complexity):** Table `intake_documents` (e.g. `id`, `pool_id`, `user_email`, `file_url`, `ai_parsed_json`, `parse_status`, `confidence_score`) and API `POST /api/intake` (upload → store → optionally trigger parse → return suggestions for pre-fill). POC can start with upload + store only; add parse when ready. Never auto-commit a pledge from intake.

---

## 0.1 Build sequence & recommendations

### Architecture decisions (hold the line)

**Keep for POC:**

- Single-tenant.
- No pledger user accounts (email + name only).
- No reputation system.
- No public metrics beyond current pool (no “organizer reliability” or “containers shipped” on homepage yet).
- No multi-organizer marketplace.

**Add within POC scope:**

- AI-assisted intake (optional upload → pre-fill form).
- DB-configurable pricing (`admin_settings` → calculator + pledge).
- Duplicate pledge guard (soft: warn or soft-unique per pool + email; no hard block required if community prefers “contact us to change”).
- Contact page (or mailto) + branded 404.
- Minor UX refinements (See How It Works link, loading/error display where needed).

### How it gets sequenced for build

| Stage | What | Why |
|-------|------|-----|
| **Foundation** | P0: Contact link fix, branded `not-found.tsx`, pledge status validation in PATCH. | Removes broken links and invalid state; clean 404. |
| **POC hardening** | P1/P2: DB-configurable pricing (wire `admin_settings` to calculator + pledge; optional admin UI for rates). Duplicate pledge guard (soft: e.g. “Already pledged? Contact us to change” or unique constraint + friendly message). Fix “See How It Works” link. | Trust (pricing from DB), clarity (one pledge per person or clear path), small UX fix. |
| **POC — upload only** | “Upload packing list (optional)” on pledge path. Store file in Supabase Storage; show in admin (e.g. pool detail or pledges view). No AI yet. | Increases seriousness; validates that people will use upload; prepares storage and admin view for next step. |
| **POC — AI pre-fill** | Add `intake_documents` (or equivalent), `POST /api/intake` (upload → store). Optional: background or on-demand AI parse; return structured suggestion; **pre-fill existing pledge form**; user edits and submits. Never auto-commit. | Friction collapse without workflow change. AI proposes, human confirms. |
| **Phase 2 (after first container)** | Completion probability indicator (velocity vs historical). Organizer reliability (e.g. % pools shipped). Transparency dashboard (containers shipped, volume). Timeline clarity (e.g. “Expected window: Mar 15–25”). | Structured confidence: “Will this really happen?” answered with data. |
| **Phase 3 (later)** | Verified community organizer mode; multi-pool dashboard; white-label / route expansion; optional “My pledges” or reputation. | Scaling and generalization; only after POC proves the loop. |

### What to measure during POC

After the next container cycle:

- Time to 50% fill vs historical.
- Time to 75% fill vs historical.
- % of pledges that convert (if you track follow-through).
- Volume of support questions (“How much will this cost?”).
- Admin time spent coordinating.

**POC wins if the system reduces:** confusion, manual math, WhatsApp chaos.

### Final calibration question

When you launch the next container using Link360:

**Are you comfortable saying: “All declarations must go through Link360”?**

Or will you still allow parallel WhatsApp pledges? The answer determines how clean the test is. If some pledges stay on WhatsApp, you can’t cleanly attribute fill speed or conversion to the platform.

### Recommendations (as they fit)

1. **Do Foundation and POC hardening first.** Contact, 404, DB pricing, duplicate guard, and small UX fixes are fast and directly support trust and admin efficiency.
2. **Add upload (no AI) as soon as Foundation is done.** Storage + admin view is low risk and sets up “optional packing list” as a habit before adding AI.
3. **Introduce AI pre-fill only after at least one cycle with upload.** You’ll see what file types and formats people actually send; that informs the prompt and schema.
4. **Design `intake_documents` and `/api/intake` so the pledge flow stays unchanged.** The only new surface is “Upload to pre-fill” and a pre-populated form. No “draft” or “declaration page” until Phase 2 if needed.
5. **Keep Phase 2 (reliability, completion stats, transparency dashboard) out of scope until after a shipped container.** Otherwise you’re building metrics before you have data.
6. **Decide the “all declarations through Link360” rule before the next pool.** If the answer is “we’ll still take WhatsApp,” document it and still measure; just don’t over-claim causality.

---

## 1. Routes & structure

### Public

| Route | Purpose | Notes |
|-------|---------|------|
| `/` | Home: hero, active pools list, How it works | Pools from `pool_stats`, status=collecting, is_public=true, ordered by ships_at |
| `/pool/[slug]` | Pool detail: progress, prohibited items, calculator, pledge, tracking | 404 via `notFound()` when slug missing; anon can read pool_stats |
| `/pricing` | Rates, calculator, example box table | Static-ish; calculator uses constants |
| `/faq` | FAQ list (card layout) | Content from `@/lib/faq` |
| `/auth/callback` | OAuth code exchange (Google → Supabase) | Redirects `?code=...` from `/` here; sets `next` to `/admin/dashboard` |

### Admin (protected by middleware + allowlist)

| Route | Purpose | Notes |
|-------|---------|------|
| `/admin`, `/admin/login` | Login / redirect to dashboard if already admin | Email + Google; `LINK360_ADMIN_EMAILS` allowlist |
| `/admin/dashboard` | Pools table (title, destination, status, ft³, pledges, %), link to Pledges / Edit | Service role for pools + pool_stats |
| `/admin/pools/new` | Create pool form | POST to `/api/admin/pools` |
| `/admin/pools/[id]` | Pool detail: stats, pledges table, CSV export, status filter | PATCH pledge status via `/api/admin/pledges/[id]` |
| `/admin/pools/[id]/edit` | Edit pool (sponsor, target ship cost, ships_at, etc.) | PATCH to `/api/admin/pools/[id]`; sponsors loaded server-side |

### API

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/pledges` | Create pledge | None (public); validated with `pledgeApiSchema` |
| POST | `/api/admin/pools` | Create pool | `isAdminEmail()` |
| PATCH | `/api/admin/pools/[id]` | Update pool | `isAdminEmail()` |
| GET/POST | `/api/admin/sponsors` | List/create sponsors | Likely admin (verify) |
| PATCH | `/api/admin/pledges/[id]` | Update pledge status / is_internal_cargo | `isAdminEmail()` |

**Middleware:** Matcher is `["/", "/admin/:path*"]`. So `/api/*` does **not** go through middleware; admin API routes enforce auth inside the handler. That’s fine but worth noting for consistency (e.g. if you add more admin routes).

---

## 2. Logic & data flow

### Pledge flow

1. User fills form on pool page (standard box / custom dims / estimate).
2. Client computes `computed_in3`, `computed_ft3`, `est_shipping_cost`, `est_pickup_fee` via `lib/pricing` + `lib/constants`.
3. POST `/api/pledges` with full payload; server validates with `pledgeApiSchema` (pool_id, item_mode, dimensions/box, quantity, computed values).
4. Insert into `pledges` (service role); send pledge confirmation email (Resend); optionally notify admin emails.
5. Success → green “Thank you” state; no redirect.

**Strengths:** Single source of truth for pricing (constants + pricing lib), Zod on client and server, emails stubbed when Resend not configured.

**Gaps:**

- Pledge form does not pre-fill from calculator (e.g. “Use calculator estimate”).
- No idempotency: same person can submit multiple pledges for same pool (no “one pledge per email per pool” rule or UI hint).
- No server-side use of `admin_settings` for pricing; calculator and pledge form use `DEFAULT_*` constants. DB settings exist but aren’t wired.
- **Declaration friction:** Flow assumes user already knows dimensions, box type, weight. Cognitive load in a diaspora/low-frequency context hurts conversion. Strategic direction: optional “Upload packing list” (Phase 1) → AI parse + suggest (Phase 2) → user confirms; see §0.

### Pool & pool_stats

- Public pools read from `pool_stats` view (RLS allows anon read where underlying pool is public).
- Admin uses service role for pools, pledges, pool_stats.
- `pool_stats` includes sponsor join, target_ship_cost, ship_cost_reach_pct; pool page and PoolCard use them correctly.

### Auth

- Admin: Supabase Auth (email + Google); middleware redirects unauthenticated `/admin/*` to `/admin/login` and restricts by `LINK360_ADMIN_EMAILS`.
- OAuth redirect: if Google sends `?code` to `/`, middleware redirects to `/auth/callback` with `next=/admin/dashboard`.
- No public auth required for pledging (by design).

---

## 3. UI/UX

### Design system

- **Tokens:** `globals.css` defines `--color-ocean`, `--color-sand`, `--color-sunset`, etc.; Tailwind `ocean`, `sunset`, etc. used in buttons/cards.
- **Components:** `.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.label`, `.heading-*`, `container-narrow`, `container-wide`, `section`.
- **Font:** Inter via `next/font`, `--font-inter`.
- **Focus:** `:focus-visible` ring; selection styling.

**Consistency:** Mix of `gray` and `zinc` (e.g. admin uses `zinc`, public uses `gray`). Not broken but could be unified. Ocean/sunset used on public CTAs; admin is neutral zinc.

### Key flows

- **Home → Pool:** Clear CTA “Pledge Your Space”; pool cards show fill %, ship window, sponsor, est. ship cost reach; link to `/pool/[slug]`.
- **Pool page:** Two columns (lg): left = progress, prohibited (with warn banner), right = pledge card, tracking, then collapsible calculator. Order is intentional (pledge first, estimate below).
- **Pledge form:** Item mode (standard / custom / estimate), quantity, pickup zone, live volume/cost summary. Success state in place.
- **Calculator:** Standalone on pricing; on pool page, collapsible below tracking, `embedded` mode (no duplicate card/title).

### Accessibility & polish

- Calculator inputs use `id`/`htmlFor`/`aria-label` (no unlabeled form control lint).
- Error page suggests env vars and has “Try again”.
- Pool page 404 uses Next `notFound()` (no custom `not-found.tsx` yet).
- Home hero: “See How It Works” button goes to `/pricing`; copy says “See How It Works” but How it works is on same page (#pools + HowItWorks). Minor copy/link mismatch.

---

## 4. Feel & trust

- **Messaging:** “No payment until confirmed”, “Community-driven”, “Transparent pricing” — clear and consistent. This is the **trust compression** in practice: reducing “Will this container ship?” to visible progress and formal commitment.
- **Prohibited items:** Amber icon + left border + light background; reads as “pay attention” without alarm.
- **Calculator:** “Estimate only. Final pricing may adjust…” and “final assessed at pickup” for heavy fee — sets expectations.
- **Footer:** LevrAge credit; links to Pricing, FAQ, Admin. “Contact” currently points to `/faq` (duplicate link).
- **Admin:** Simple layout; “View public page” from pool detail; CSV export and status filters for pledges.

---

## 5. Potential

**Tactical (near-term):**

- **Admin settings → pricing:** Use `admin_settings` in API or server components and pass into calculator/pledge form so rate and fees are configurable without deploy.
- **My pledges:** RLS comment mentions “my pledges” later; could add “View my pledges” by email (magic link or simple lookup) using existing policy idea.
- **Contact:** Dedicated `/contact` or mailto + FAQ link would match footer and user expectation.
- **Pool updates:** Already have `pool_updates` and UI; can add “Notify me” (email when pool is announced) without changing core flow.
- **Analytics:** No events yet; add optional Plausible/Posthog for pledge starts, completions, calculator opens.
- **i18n:** Copy is English-only; structure is i18n-ready if you add later.

**Strategic (B/C direction — POC-fit first, rest Phase 2+):**

- **Declaration intelligence (POC):** Optional upload → AI suggests → pre-fill form → user confirms (see §0). No new workflow. Converts chaos into structured declaration and reduces cognitive load.
- **Volume / coordination nudges (Phase 2+):** “120 ft³ short — invite 3 more”; “This pool is trending 2x faster.” Turns the trust ledger into a coordination tool. Not required for POC.
- **Structured confidence (Phase 2+):** Completion probability, organizer reliability, transparency dashboard (containers shipped, volume). Answer “Will this really happen?” with data. After first container.
- **Customs pre-declaration, replicability (C):** Parsed inventory → customs summary; same patterns for other corridors. Latent; design for optionality only.

---

## 6. Gaps & risks

### Critical / high

1. **Contact link:** Footer “Contact” goes to `/faq`. Either add a `/contact` page (or mailto) or change label to “FAQ” and remove duplicate.
2. **No custom 404:** Missing `app/not-found.tsx`; Next shows default. A simple branded 404 would improve experience for bad slugs/URLs.
3. **Pledge duplicate:** Same email can submit multiple pledges per pool. Consider: unique (pool_id, user_email) or clear “Already pledged? Contact us to change.”
4. **Admin API not in middleware:** `/api/admin/*` is not in matcher; each route checks `isAdminEmail()`. Consistent but easy to forget on new admin endpoints.

### Medium

5. **Pricing from DB:** Calculator and pledge form use constants; `admin_settings` exists but isn’t used. Admin UI to edit rates/fees is missing.
6. **Pledge status validation:** PATCH `/api/admin/pledges/[id]` accepts any `status`; no Zod enum. Prefer `pledgeStatusSchema` to reject invalid values.
7. **Home hero CTA:** “See How It Works” links to `/pricing`; “How it works” section is on home. Consider linking to `#pools` or a dedicated “How it works” anchor/section.
8. **Sponsors RLS:** Migration 004 enables RLS on `sponsors` with “Anyone can read”; insert/update only via service role. No policy for insert/update from client; admin uses API with service role. OK for current design.

### Low / polish

9. **Loading states:** No `loading.tsx` on key routes; Suspense boundaries could improve perceived performance.
10. **Error boundary for pledge:** Form uses `setError("root")` or similar for API errors; confirm message is visible and not only in console.
11. **Email failure:** If Resend fails after pledge insert, pledge is saved but user might not get confirmation. Consider queue or at least logging and admin alert.
12. **Pool slug uniqueness:** Enforced by DB; POST returns 23505 with clear message. Edit form should avoid changing slug to existing one (already validated).

---

## 7. Summary & suggested priorities

### One-page view (matches §0.1 Build sequence)

| Stage | Items | Guardrail |
|-------|--------|-----------|
| **Foundation** | Contact fix, branded 404, pledge status validation | Conversion + trust |
| **POC hardening** | DB pricing, duplicate pledge guard (soft), “See How It Works” fix | Trust + admin efficiency |
| **POC — upload** | Optional “Upload packing list”; store in Supabase; admin can view; no AI | Container fill speed + seriousness |
| **POC — AI pre-fill** | `intake_documents` + `/api/intake`; AI suggests; pre-fill form; user confirms | Conversion + friction reduction |
| **Phase 2** | Completion probability, organizer reliability, transparency dashboard | Trust (after first container) |
| **Phase 3** | Organizer mode, multi-pool, white-label | Scaling (later) |

**Guardrail:** Only add features that improve conversion rate, trust perception, admin efficiency, or container fill speed.

### Tactical checklist (Foundation + POC hardening)

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Fix Contact link (footer): add `/contact` or mailto, or remove duplicate | Small |
| P0 | Add `app/not-found.tsx` with branding and link home/pricing | Small |
| P0 | Validate pledge status in PATCH with `pledgeStatusSchema` | Small |
| P1 | Duplicate pledge guard: soft (message or soft-unique pool+email) or “Already pledged? Contact us” | Small–medium |
| P1 | Wire `admin_settings` to calculator + pledge (and optional admin UI for rates) | Medium |
| P2 | Fix or clarify “See How It Works” link vs on-page section | Small |
| P3 | Loading UI, error display for pledge submit, email failure handling | Small–medium |

### Deferred past POC (by design)

- Reputation systems, cross-community scaling, bulk purchasing engines (Phase 3).
- Public “organizer reliability” or “containers shipped” on homepage (Phase 2).
- “My pledges” / user accounts for pledgers (optional, Phase 2+).
- Full “declaration page” or draft workflow (POC = pre-fill only).

Overall the site is coherent and secure for an MVP. With the POC constraint and B/C direction: **ship a real container first** on the current engine plus Foundation and POC hardening; add optional upload (then AI pre-fill) to reduce declaration friction without changing workflow; push all improvement elements that don’t fit POC (reliability metrics, multi-organizer, white-label) to Phase 2 and Phase 3. Measure fill speed, support load, and admin time after the next cycle.
