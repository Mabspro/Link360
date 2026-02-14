# Replicability & POC basis

Link360 is designed as a **replicable community shipping model** so other diaspora or route-based communities can run a similar service. This doc captures the build basis for a viable POC.

## Community model sequence

1. **Pledges** – Community members pledge space and estimated cost (no payment yet).
2. **Threshold reached** – Target volume hit → enough interest to proceed.
3. **Announcement** – Container confirmed; pledgers notified.
4. **Loading reached** – Container fills; loading dates communicated.
5. **Ship & tracking** – Container ships; tracking updates and announcements.

(Reflected in **How the community model works** on the home page and in pool lifecycle.)

## Build basis covered

| Area | What’s in place | Future / optional |
|------|------------------|-------------------|
| **Multi-route** | Pools are route-agnostic (destination, container, ship window). Same codebase can serve other origins/destinations. | Admin or config for “origin” label; multiple regions. |
| **Pool sponsor (container owner)** | Who lists the container is visible (“Listed by …”). Burden shifts to sponsor; ready for sponsor auth and ratings. | Sponsor login, ratings, “donate to ship cost.” |
| **Est. ship cost reach %** | When a pool has a target ship cost, we show % of that cost reached by pledges. | “Donate to ship cost” button; designated non-profit field and logic. |
| **Tracking & updates** | `pool_updates` table and UI on the container page for announcements, loading, shipped, tracking. | Admin UI to add updates; optional email/SMS for new updates. |
| **Pledge flow** | No payment until confirmed; clear steps and thermometers. | Payments, non-profit designation, receipts. |
| **Admin** | Pools, pledges, sponsors, CSV export, status. | Pool updates CRUD, non-profit flag, reporting. |

## Non-profit / donate-to-ship (later)

- **Target ship cost** is already stored; **ship cost reach %** is shown.
- When that % is the bottleneck, we can add:
  - A **“Donate to ship cost”** CTA (e.g. on pool page or in updates).
  - A **designated non-profit** per pool or per project (e.g. one entity receives donations; optional tax receipts).
- Schema can be extended with e.g. `pools.designated_non_profit_id` or a small `non_profits` table when needed.

## Reuse by other diaspora

- **Branding** – Copy and config (e.g. “NorCal to Zambia”) can be swapped for another origin/destination.
- **Data** – Pools, sponsors, pledges, updates are generic; no hard-coded routes in logic.
- **Auth** – Admin allowlist; later sponsor auth and optional pledger accounts.
- **Deploy** – Single Next.js + Supabase app; env-driven; can be forked or white-labeled.

This gives a clear path from current POC to a replicable, multi-community service.
