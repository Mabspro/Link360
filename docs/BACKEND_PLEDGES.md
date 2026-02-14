# Pledge Backend: Logic, Frontend Mapping & Auth

## 1. Pledge flow (green-lit)

```
[User] → PledgeForm (client) → POST /api/pledges → Supabase (service role) → emails
```

- **No auth required** to submit a pledge (anonymous by design for v1).
- Backend uses **service role** so it can insert into `pledges` (RLS allows only insert for anon; service role bypasses RLS).
- After insert: send **confirmation** to `user_email` and **notification** to `LINK360_ADMIN_EMAILS`.

---

## 2. Backend logic (API)

### 2.1 Validation (server-side)

- **Required**: `pool_id`, `user_email`, `user_name`, `pickup_zone`, `item_mode`, `quantity`.
- **Optional**: `user_phone`, `pickup_city`, `standard_box_code`, `length_in`, `width_in`, `height_in`, `notes`.
- **Computed (required in body)**: `computed_in3`, `computed_ft3`, `est_shipping_cost`, `est_pickup_fee`.
- **Enums**: `pickup_zone` ∈ `in_city | out_of_city`, `item_mode` ∈ `standard_box | custom_dims | estimate`.
- **Pricing**: Frontend receives `admin_settings` (rate, fees) from server and passes into `estShippingCost` / `estPickupFee`; server does not yet recompute from DB (optional hardening).

### 2.2 Duplicate guard (before insert)

- Check for existing pledge with same `pool_id` and same `user_email` (case-insensitive).
- If found: return **409** with body `{ "error": "You have already submitted a pledge for this pool. Contact us if you need to modify it." }`. Do not update or override. Frontend shows this via root error in the form.

### 2.3 Insert

- Map request body → `pledges` columns (snake_case).
- `is_internal_cargo`: always `false` from public form (admin sets via dashboard).
- `status`: default `pledged` (DB default).

### 2.4 Post-insert

- Load pool `title` for emails.
- `sendPledgeConfirmation(to, userName, poolTitle, estShipping, estPickup, totalFt3)`.
- `sendAdminPledgeNotification(adminEmails, poolTitle, userName, userEmail, totalFt3, estRevenue)`.
- Return `{ id: pledge.id }`.

---

## 3. Frontend → API mapping

| Form field (PledgeFormValues) | API / DB field        | Notes |
|-------------------------------|------------------------|--------|
| `user_email`                  | `user_email`           | Required |
| `user_name`                  | `user_name`            | Required |
| `user_phone`                 | `user_phone`          | Optional |
| `pickup_zone`                | `pickup_zone`         | `in_city` \| `out_of_city` |
| `pickup_city`                | `pickup_city`         | Optional |
| `item_mode`                  | `item_mode`           | `standard_box` \| `custom_dims` \| `estimate` |
| `standard_box_code`          | `standard_box_code`   | Set only when `item_mode === 'standard_box'` |
| `length_in` / `width_in` / `height_in` | `length_in`, `width_in`, `height_in` | Set only when `item_mode === 'custom_dims'` |
| `quantity`                   | `quantity`            | Required, ≥ 1 |
| (derived)                    | `computed_in3`        | From `computeIn3(values)` |
| (derived)                    | `computed_ft3`        | `in3ToFt3(computed_in3)` |
| (derived)                    | `est_shipping_cost`   | `estShippingCost(in3, pricing)` — pricing from `admin_settings` when passed |
| (derived)                    | `est_pickup_fee`      | `estPickupFee(pickup_zone, quantity, pricing)` — pricing from DB when passed |
| (fixed)                      | `pool_id`             | From page (pool) |
| (fixed)                      | `is_internal_cargo`   | `false` |
| `notes`                      | `notes`               | Optional |

Frontend sends **snake_case** payload; backend uses same names for DB.

---

## 4. Auth plan

### 4.1 Admin auth (current)

- **Supabase Auth** (email/password).
- Admin identity: **email allowlist** (`LINK360_ADMIN_EMAILS`) enforced in middleware and API.
- You can **add Google to Supabase** so admins can sign in with Google; allowlist still applies (see below).

### 4.2 Google Auth with Supabase (recommended)

- **Use Supabase’s built-in Google provider** (no separate “auth on Google” app).
- In **Supabase Dashboard** → **Authentication** → **Providers** → **Google**:
  - Enable Google.
  - Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (Web application, redirect URI from Supabase).
  - Paste **Client ID** and **Client Secret** into Supabase.
- In your app, call `supabase.auth.signInWithOAuth({ provider: 'google' })`; Supabase handles redirect and creates/updates `auth.users`.
- **Admin**: after sign-in, still check `user.email` against `LINK360_ADMIN_EMAILS` (middleware + API). So “Sign in with Google” is just another way to get a session; allowlist decides if they’re admin.

### 4.3 Public / pledge auth (later)

- Pledges stay **anonymous** (no `user_id`) for v1.
- Optional later: add **optional** “Sign in with Google” for users who want “My pledges”.
- Then: add `user_id uuid references auth.users(id)` to `pledges` (nullable), and when user is signed in, set `user_id` on insert. RLS can allow users to read their own pledges.

---

## 5. Summary

- **Backend**: Green-lit; Zod validation, duplicate guard (409), insert, emails, and frontend mapping are implemented. Pricing from `admin_settings` is passed to form/calculator.
- **Intake**: Optional packing list upload: `POST /api/intake` stores file + `intake_documents` row; no parsing in POC. See [SPRINT_REPORT_POC_HARDENING_UPLOAD.md](SPRINT_REPORT_POC_HARDENING_UPLOAD.md).
- **Auth**: Use **Supabase** for both email/password and **Google**; add Google in Supabase and optionally “Sign in with Google” on admin login; keep admin allowlist as-is.
