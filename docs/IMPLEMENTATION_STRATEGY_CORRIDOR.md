# Implementation Strategy: Corridor Reality (Research → Build)

This document turns the **Shipping Reality Map Research** and **Research Analysis** into a concrete implementation plan. It separates **must-includes** (POC-fit signals that reduce anxiety and align users with corridor reality) from **nice-to-haves** (later phases), and keeps the POC constraint: clarity over completeness.

**Source docs:**  
- [Shipping_Reality_Map_Research.md](Shipping_Reality_Map_Research.md) — Oakland → Walvis Bay → Zambia corridor, AES/ASYCUDA, pre-clearance, transit variability, PVoC, etc.  
- [Research_Analysis.md](Research_Analysis.md) — Strategic translation: what to add to the site, what to defer, tone.

**Guiding principle:**  
*“No document, no move”* is not arbitrary; it is structurally aligned with ZRA’s mandatory pre-clearance (5 days before arrival). Link360’s job is to surface **signals**, not build full logistics systems yet.

---

## 1. Must-includes (POC — implement first)

These are **signals and copy**, not new back-end systems. They reduce “where is my stuff?” anxiety, set realistic expectations, and position Link360 as corridor-aware.

### 1.1 “Route Reality” block (pool page)

| Item | Detail |
|------|--------|
| **What** | Collapsible section on pool detail page: **“How this route works (Oakland → Walvis Bay → Zambia)”**. |
| **Content** | Short bullets: (1) Pickup & consolidation in NorCal, (2) Ocean transit (varies; often several weeks depending on routing), (3) Discharge at Walvis Bay, (4) Inland trucking to Zambia (~1–2 weeks typical, depending on border queues), (5) Mandatory pre-clearance in Zambia (ASYCUDA; documents required before arrival). |
| **Where** | `src/app/pool/[slug]/page.tsx` — add a new collapsible card (reuse pattern from `CollapsibleCalculator` / `CollapsiblePledgeCard`) in the left column, e.g. below “Prohibited items” or in the right column above/below calculator. |
| **Why** | Reduces timeline anxiety, avoids misattributed blame, separates ocean time from inland time. |
| **Effort** | Small: one component or inline collapsible + static copy. |

### 1.2 “Documents you’ll need later” (post-pledge success)

| Item | Detail |
|------|--------|
| **What** | On pledge success (the green “Thank you” state), add a short panel: **“To avoid delays later, you will eventually need:”** — Packing list (clear item list with values), Invoice or valuation, Receiver details in Zambia, Any permits (if applicable). |
| **Where** | `src/components/PledgeForm.tsx` — in the `if (submitted)` block, below the thank-you message. |
| **Why** | Aligns users with AES (US) and ASYCUDA (Zambia) without overwhelming at pledge time. |
| **Effort** | Small: static list + optional link to FAQ or /pricing. |

### 1.3 Copy shift: pledge CTA and early upload nudge

| Item | Detail |
|------|--------|
| **What** | Change primary pledge/submit copy from e.g. “Submit pledge” to something that nudges early docs: **“Submit your pledge and upload your packing list early to avoid border delays.”** (Or keep button as “Submit pledge” and add a one-line hint above/below: “Upload a packing list when you can — it helps avoid border delays.”) |
| **Where** | `src/components/PledgeForm.tsx` (button label and/or short line near the packing list upload). |
| **Why** | Corridor-aware, justifies “if it’s not in Link360, it doesn’t count.” |
| **Effort** | Trivial: copy only. |

### 1.4 Pre-clearance visibility (site-wide signal)

| Item | Detail |
|------|--------|
| **What** | Add one clear line in a visible place: **“Zambia requires pre-clearance before goods arrive. Missing documents can delay clearance.”** |
| **Where** | Options: (a) Pool page near Route Reality block, (b) Pricing page in the “Documents / compliance” area, (c) FAQ as a short Q&A, (d) Footer or small banner. Recommendation: **Pool page** (Route Reality or just below) **+** **FAQ** so it’s findable and scannable. |
| **Why** | Positions Link360 as informed; explains why structure and early docs matter. |
| **Effort** | Small: copy + placement. |

### 1.5 Business buyer nudge (Pricing page)

| Item | Detail |
|------|--------|
| **What** | A small card on the Pricing page: **“Buying goods in the US for Zambia?”** — Keep receipts; avoid under-invoicing; duties are calculated on CIF; pre-clearance is mandatory; regulated goods may require PVoC. |
| **Where** | `src/app/pricing/page.tsx` — e.g. after “Rates” or after “Example box calculations,” before the final disclaimer. |
| **Why** | Opens future wedge for SMEs (solar, electronics, small machinery); speaks to business behavior, not only diaspora. |
| **Effort** | Small: one card component or section + static copy. |

### 1.6 FAQ: Green logistics seed

| Item | Detail |
|------|--------|
| **What** | One FAQ item: e.g. “What about importing solar or energy equipment?” — Short answer: Zambia has suspended VAT and import duty on lithium-ion batteries and solar PV products to support energy access; shipping of batteries is subject to international safety rules (e.g. state-of-charge limits). No calculator or tariff logic — just a seed. |
| **Where** | `src/lib/faq.ts` — add one entry; render on `/faq` as usual. |
| **Why** | Plants the seed for future “preferred micro-consolidation lane” for solar/energy without building anything now. |
| **Effort** | Trivial: one FAQ object. |

---

## 2. Nice-to-haves (post-POC / Phase 2+)

Not for POC. Implement only after 1–2 successful container runs and when you’re ready to expand scope.

### 2.1 Later content / UX (Phase 2)

| Item | Description | Dependency |
|------|-------------|------------|
| Transit range display | Show “Typical total timeline: 55–65 days” (or min/avg/max) on pool or pricing, with clear “ocean + inland” wording. | Optional after Route Reality is live; can be a single line in Route Reality first. |
| Carrier / routing mention | Generic line that “carriers such as Hapag-Lloyd, Maersk, MSC serve Walvis Bay” — no live schedules. | Research done; copy only when you want to sound more operator-level. |
| Documents checklist in account flow | If you add “My pledges” or a dashboard, a per-pledge “Documents checklist” (packing list, invoice, receiver details) with status. | Depends on “My pledges” or logged-in pledge view. |

### 2.2 Product / platform (Phase 2+)

| Item | Description | Dependency |
|------|-------------|------------|
| Tariff / duty hints | High-level band hints (0–5% / 15% / 25%) or link to ZRA; **no** full duty calculator in POC. | Phase 2. |
| PVoC / commodity flags | During intake or pledge, optional “Is any of this regulated (electronics, food, textiles, construction)?” with link to PVoC info. | After intake AI or structured item list. |
| Vessel or border delay signals | “Vessel schedule” or “border delay” feeds. | Phase 2+; external APIs and ops. |
| Corridor operator dashboard | Internal view of corridor status, delays, documents. | When you have ops team and data sources. |

### 2.3 Strategic positioning (after 2–3 containers)

| Item | Description |
|------|-------------|
| “Pre-structured diaspora trade corridor” | Position Link360 as the structured corridor for SME imports, group equipment buys, bulk solar, agricultural equipment. |
| Solar / energy lane | Explicit “solar and small energy businesses” lane once green logistics FAQ and business nudge have been validated. |

---

## 3. Implementation order (recommended)

**Phase: POC (current run)**

1. **Copy and one-line nudges** (1.3, 1.4, 1.6)  
   - Pledge CTA/hint, pre-clearance line (pool + FAQ), one FAQ on solar/energy.  
   - No new components; fast to ship.

2. **Route Reality block** (1.1)  
   - One collapsible section on pool page with the five bullets.  
   - Reuse existing collapsible pattern.

3. **Documents you’ll need later** (1.2)  
   - Panel on pledge success with the four document bullets.

4. **Business buyer card** (1.5)  
   - One card on Pricing page.

**Phase: After first container**

- Add transit range (e.g. “55–65 days typical”) into Route Reality or nearby if you want a number in the UI.  
- Optionally add one FAQ or pricing line on carriers/Walvis Bay.  
- Keep everything else (tariffs, PVoC flows, vessel/border feeds, dashboards) in the “later” backlog.

---

## 4. Tone choice (from Research Analysis)

The analysis asks whether Link360 should feel:

- **A)** Community-friendly, simple, lightweight  
- **B)** Competent, structured, corridor-aware  
- **C)** Hybrid  

For the **must-includes** above, the strategy assumes **C) Hybrid**:  
- Keep community-friendly tone (no bureaucratic jargon).  
- Add competence signals: pre-clearance, early docs, “documents you’ll need,” business nudge.  
- One-line regulatory mentions (pre-clearance, PVoC, CIF) without full explanations.

If you choose **A**, soften or shorten 1.4 and 1.5. If you choose **B**, you can add one more short “Why we ask for documents” line referencing ASYCUDA.

---

## 5. Summary table

| ID | Item | Type | Where | Phase |
|----|------|------|--------|--------|
| 1.1 | Route Reality block (Oakland → Walvis Bay → Zambia) | Must | Pool page, collapsible | POC |
| 1.2 | Documents you’ll need later (post-pledge) | Must | PledgeForm success state | POC |
| 1.3 | Copy: pledge + early upload nudge | Must | PledgeForm | POC |
| 1.4 | Pre-clearance line (visible) | Must | Pool page + FAQ | POC |
| 1.5 | Business buyer card (Pricing) | Must | Pricing page | POC |
| 1.6 | FAQ: solar / green logistics seed | Must | FAQ | POC |
| 2.1 | Transit range, carrier mention, doc checklist | Nice | Pool / Pricing / future “My pledges” | Phase 2 |
| 2.2 | Tariff hints, PVoC flags, vessel/border, dashboards | Nice | Various | Phase 2+ |
| 2.3 | “Pre-structured corridor” + solar lane positioning | Nice | Messaging / sales | After 2–3 containers |

This keeps the POC **operator-disciplined**: signals that match corridor reality (research + analysis) without building new platforms or data feeds until you’ve earned that step.
