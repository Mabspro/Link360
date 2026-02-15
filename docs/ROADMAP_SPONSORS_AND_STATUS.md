# Roadmap: Sponsor Requests, Verification, Multi-Pool Discovery, Status

## Staged for Phase 2 (implemented)
- **Origin region (US nationwide):** `pools.origin_region` added; admin can set per pool (NorCal, Bay Area, Sacramento, Los Angeles, Texas, Chicago, Atlanta, NYC, Florida, Nationwide, Other). Public UI shows “Origin → Destination” on cards and pool detail. Enables **regional filtering** later (filter by `origin_region` + `destination_city`) without schema change.

## POC (Optional add)
### Sponsor Request Intake (no public listing)
- Public route: /sponsor
- Stores requests in sponsor_requests
- Admin view: Sponsor Requests table
- Manual process: vet → create sponsor → assign to pool

### Pool listing UX
- Home: show up to 4 active pools
- CTA: “Show more” → /pools

## Phase 2 (After 1 shipped container)
### Sponsor Verification Workflow
- sponsor.verification_status: pending | verified | suspended
- Admin checklist fields:
  - identity_verified
  - shipper_contact_verified
  - route_readiness_confirmed
  - staging_location_confirmed
  - prior_shipments (optional)
- Only verified sponsors may be assigned to pools

### Regional Filtering (light discovery)
- **Data staged:** `pools.origin_region` and display on cards/detail are in place (see “Staged for Phase 2” above).
- Add filter UI: filter pools by `origin_region` (e.g. Sacramento, Bay Area, Texas, Nationwide) and `destination_city`.
- Keep pools-first: avoid public “shipper directory” feel.

### Pool Status Lifecycle (trust closure)
Public pool shows:
- status badge + last updated timestamp
Statuses:
- collecting, announced, loading, shipped,
  arrived_port, arrived_zambia, cleared,
  ready_pickup, closed
Admin posts updates via pool_updates

## Phase 3 (Scaling)
- Public sponsor profiles (verified)
- Multi-organizer mode
- Reliability metrics (completion rate, on-time)
- Advanced matching and notifications
