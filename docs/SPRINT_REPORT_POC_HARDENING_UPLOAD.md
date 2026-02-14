# Link360 Sprint Report — POC Hardening + Upload Intake (No AI)

**Sprint scope:** Foundation hardening (P0), pricing from DB, optional packing list upload. No AI, no new dashboards, no platform expansion.

---

## 1. What Was Implemented

### 1️⃣ Foundation Hardening (P0)

- **A. Contact route**
  - Created `/contact` page with mailto link (env: `NEXT_PUBLIC_CONTACT_EMAIL`, fallback: `contact@link360.com`), short note on response time, and link back to active pools (`/#pools`).
  - Updated footer: “Contact” now points to `/contact`; removed duplicate FAQ link and kept a single FAQ link.

- **B. Custom 404**
  - Added `app/not-found.tsx`: branded “Page not found” message with links to Home and Pricing. Replaces the default Next.js 404.

- **C. Pledge status validation**
  - Updated `PATCH /api/admin/pledges/[id]`: body validated with Zod (`patchBodySchema` using `pledgeStatusSchema`). Invalid `status` returns 400 with a clear message. `is_internal_cargo` remains optional boolean.

- **D. Duplicate soft guard**
  - In `POST /api/pledges`, before insert: check for existing pledge with same `pool_id` and same `user_email` (case-insensitive via `ilike`). If found, return **409** with body: `{ "error": "You have already submitted a pledge for this pool. Contact us if you need to modify it." }`. No update or override. Pledge form shows this message via `setError("root", …)` and a red banner.

### 2️⃣ Pricing from DB (POC Hardening)

- **Server:** Added `getAdminSettings()` in `lib/get-admin-settings.ts`. Fetches the single `admin_settings` row (id = 1), coerces numeric fields, returns `AdminSettings | null`. Uses anon client (RLS allows public read on `admin_settings`).
- **Pool page:** Awaits `getAdminSettings()`, passes `pricing` to `CollapsiblePledgeCard` and `CollapsibleCalculator`. Both pass it to `PledgeForm` and `SpacePriceCalculator` respectively.
- **Pricing page:** Awaits `getAdminSettings()`, uses pricing for examples table and for “Rates” copy (shipping rate, in-city fee, out-of-city base + per box). Passes `pricing` to `SpacePriceCalculator`.
- **Calculator:** `SpacePriceCalculator` accepts optional `pricing` prop; uses it for rate and fees with fallback to `DEFAULT_*` from constants.
- **Pledge form:** `PledgeForm` accepts optional `pricing`; passes it to `estShippingCost` and `estPickupFee` so displayed and submitted amounts use DB settings when present.
- **No admin UI** for editing rates; backend and frontend are wired so an admin can change values in the DB and the app reflects them.

### 3️⃣ Upload Intake (No AI)

- **UI**
  - On pledge form: optional file input, “Packing list (optional)”, note: “Optional: Upload a packing list to help us review your shipment. PDF, CSV, Excel, or image. Max 10MB.” Accepts `.pdf,.csv,.xlsx,.xls,image/*`. Label and `aria-label` for accessibility.
  - On submit: if a file is selected, `POST /api/intake` is called first (FormData: file, pool_id, user_email). On success, pledge is submitted as before. On intake failure, root error is shown and pledge is not sent.

- **Backend**
  - **Table:** `intake_documents` (id, pool_id, user_email, file_path, created_at). RLS enabled; no policies for anon/auth so only service role can read/write.
  - **API:** `POST /api/intake` — form-data fields: `file`, `pool_id`, `user_email`. Validates with Zod (uuid, email). File required, max 10MB, allowed types: PDF, CSV, Excel, images. Creates bucket `intake` if missing (service role), uploads to `{pool_id}/{uuid}.{ext}`, inserts row, returns `{ ok: true, id }`. No parsing or auto-fill.

- **Admin**
  - Pool detail page: if there are intake documents for the pool, a “Packing list uploads” section lists email and uploaded-at. No download link in this POC (signal-building only).

---

## 2. Files Modified / Added

| Path | Change |
|------|--------|
| `src/app/contact/page.tsx` | **Added** — Contact page. |
| `src/app/not-found.tsx` | **Added** — Custom 404. |
| `src/app/api/admin/pledges/[id]/route.ts` | **Modified** — Zod validation for PATCH body (status enum). |
| `src/app/api/pledges/route.ts` | **Modified** — Duplicate check (pool_id + user_email) → 409. |
| `src/app/api/intake/route.ts` | **Added** — POST intake: validate, store file, insert row. |
| `src/lib/get-admin-settings.ts` | **Added** — Fetch admin_settings for server components. |
| `src/components/Footer.tsx` | **Modified** — Contact → `/contact`, single FAQ link. |
| `src/components/SpacePriceCalculator.tsx` | **Modified** — Optional `pricing` prop; use it or defaults. |
| `src/components/CollapsibleCalculator.tsx` | **Modified** — Accept and pass `pricing`. |
| `src/components/CollapsiblePledgeCard.tsx` | **Modified** — Accept and pass `pricing`. |
| `src/components/PledgeForm.tsx` | **Modified** — Optional `pricing`; optional file state; call `/api/intake` when file present; root error display; 409 and other API errors shown in-form. |
| `src/app/pool/[slug]/page.tsx` | **Modified** — Fetch pricing, pass to calculator and pledge card. |
| `src/app/pricing/page.tsx` | **Modified** — Async, fetch pricing, pass to calculator; rates copy and examples use DB values. |
| `src/app/admin/pools/[id]/page.tsx` | **Modified** — Fetch and display intake_documents for pool. |
| `supabase/migrations/006_intake_documents.sql` | **Added** — Table + RLS. |
| `docs/SPRINT_REPORT_POC_HARDENING_UPLOAD.md` | **Added** — This report. |

---

## 3. Database Changes

- **Migration `006_intake_documents.sql`**
  - `public.intake_documents`: `id` (uuid, pk), `pool_id` (uuid, FK pools), `user_email` (text), `file_path` (text), `created_at` (timestamptz). Index on `pool_id`. RLS enabled; no policies (service role only).
  - **Storage:** Files go in Supabase Storage bucket `intake`. The API creates the bucket on first use if it doesn’t exist (service role). If your project already has the bucket, no change. If not, the first successful intake upload will create it (private, 10MB limit in code).

---

## 4. Risk Assessment

- **Duplicate guard:** Email comparison is case-insensitive (`ilike`). Stored emails are not normalized to lowercase; duplicate check will still match. Consider normalizing stored `user_email` to lowercase in a future migration for consistency.
- **Intake API:** Public endpoint (no auth). Rate limiting not implemented; consider adding for production (e.g. by IP or pool_id + user_email).
- **File types:** Allowed MIME types and extensions are validated; malicious filenames are sanitized (extension only, alphanumeric). Storage path is `{pool_id}/{uuid}.{ext}` to avoid collisions and path traversal.
- **Admin settings:** If `admin_settings` row is missing or corrupt, `getAdminSettings()` returns null and all consumers fall back to `DEFAULT_*` constants. No crash.
- **Contact email:** If `NEXT_PUBLIC_CONTACT_EMAIL` is unset, the contact page shows a placeholder (`contact@link360.com`). Set the env var for production.

---

## 5. Performance Impact

- **Pool and pricing pages:** One extra server-side read per request (`getAdminSettings()`). Single row by primary key; negligible.
- **Pledge submit with file:** Two sequential requests (intake then pledge). No change when no file is uploaded.
- **Admin pool page:** One extra query for `intake_documents` when loading pool detail. Index on `pool_id` keeps it cheap.

---

## 6. Recommendations (POC-Aligned Only)

- **Set `NEXT_PUBLIC_CONTACT_EMAIL`** in production so the contact page uses the real address.
- **Run migration 006** (and ensure Supabase project has run it) before relying on intake; otherwise the API will 500 on insert.
- **Optional:** Normalize `user_email` to lowercase when storing pledges so duplicate logic and future lookups are consistent.
- **Optional:** Add a simple rate limit on `POST /api/intake` (e.g. per IP or per pool_id+email) before scaling.
- **Optional:** In a later POC phase, add “Download” for intake files in admin (e.g. signed URL from Supabase Storage) so admins can open packing lists without leaving the app.

No platform expansion, new dashboards, or analytics were added; all changes stay within conversion, trust, admin efficiency, and container fill speed.
