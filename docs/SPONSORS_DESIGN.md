# Pool sponsors (container owners)

## Vision

Shift the burden to the **container owner** by making them visible as the **pool sponsor**. Over time this becomes a service for would-be sponsors: they list containers, pledgers see who’s behind each pool, and later pledgers can rate sponsors.

## Principles

- **Powerful in function, simple in visual and clarity** – sponsor is visible but not dominant.
- **Clean integration** – one line of copy (“Listed by …”) on cards and pool detail; no clutter.
- **Data model ready for more** – separate `sponsors` table so we can add sponsor auth, multiple pools per sponsor, and ratings later.

## Current scope (MVP)

- **Sponsors table:** id, name, email, phone (optional), company (optional), created_at. Admin creates/edits; no sponsor login yet.
- **Pools:** each pool has optional `sponsor_id` (FK to sponsors). Existing pools can have null until assigned.
- **Public UI:** “Listed by {company or name}” on pool cards and pool detail – small, secondary text.
- **Admin:** When creating/editing a pool, select existing sponsor or add a new one (name, email, company). One submit can create sponsor + pool.

## Future (out of scope for now)

- **Sponsor auth & dashboard** – sponsors sign in and manage their own pools.
- **Ratings/reviews** – pledgers rate the sponsor after shipment; table e.g. `sponsor_ratings` (sponsor_id, reviewer email/id, rating, comment).
- **Sponsor profile page** – public page per sponsor with their pools and aggregate rating.
- **Discovery for would-be sponsors** – landing/marketing and onboarding flow for new sponsors.

## Naming

- **Schema:** `sponsors` table; `pools.sponsor_id`.
- **UI:** “Listed by …” or “Pool sponsor: …” (we use “Listed by” for a light, clear tone).
