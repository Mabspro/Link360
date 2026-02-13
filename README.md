# Link360 Shipping – Interest Ledger

MVP web app to collect shipping interest/pledges and display a public container completion thermometer for NorCal → Zambia (Lusaka, Ndola). Interest-only; no payments.

## Tech

- **Next.js 14** (App Router) + TypeScript + TailwindCSS
- **Supabase**: Postgres, Auth, RLS
- **Forms**: Zod + React Hook Form
- **Email**: Resend (or console stub if no API key)

## Local development

1. **Clone and install**

   ```bash
   cd link360
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL Editor, run the migrations in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_rls.sql`
   - In Authentication → Providers, enable Email and set a password for your admin user (or use Magic Link).

3. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` – project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon key
   - `SUPABASE_SERVICE_ROLE_KEY` – service role key (from Project Settings → API)
   - `LINK360_ADMIN_EMAILS` – comma-separated admin emails (e.g. `you@example.com`)
   - Optional: `RESEND_API_KEY` and `EMAIL_FROM` for real email; otherwise confirmations are logged to the console.

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in at `/admin/login` with an email in `LINK360_ADMIN_EMAILS` to access the admin dashboard.

## Deploy (Vercel + Supabase)

1. **Supabase**

   - Create a production Supabase project (or use the same for dev).
   - Run the same migrations in the SQL Editor.

2. **Vercel**

   - Import the repo in Vercel and deploy.
   - In Project Settings → Environment Variables, add all vars from `.env.example` (use Production and Preview as needed).
   - For admin auth, set `LINK360_ADMIN_EMAILS` to your production admin emails.

3. **Auth redirect (optional)**

   In Supabase Dashboard → Authentication → URL Configuration, set Site URL to your Vercel URL and add `https://your-app.vercel.app/**` to Redirect URLs.

## Project layout

- **`/`** – Home: explanation, active pool cards, CTA to pledge
- **`/pool/[slug]`** – Public pool page: thermometer, stats, pledge form, prohibited items
- **`/pricing`** – Pricing explainer and example box calculations
- **`/faq`** – Rules, prohibited items, how it works
- **`/admin`** – Redirects to login or dashboard
- **`/admin/login`** – Supabase Auth sign-in (admin emails only)
- **`/admin/dashboard`** – List pools, create/edit, view pledges
- **`/admin/pools/[id]`** – Pledges for a pool: filter, export CSV, set status and internal cargo

## Data model

- **profiles** – Optional user profile (auth)
- **pools** – Shipping pools (destination, container type, threshold, status)
- **pledges** – Pledge rows (contact, dimensions, computed ft³/cost, status, internal cargo flag)
- **admin_settings** – Single row: rate per in³, pickup fees
- **pool_stats** – View: per-pool aggregates (total ft³, revenue, pledge count, % full)

RLS: public can read public pools and insert pledges; detailed pledge read and pool write use the service role (admin only).

## Quality

- Type-safe (TypeScript, Zod)
- Accessible UI (labels, progressbar, focus states)
- No payments; no overengineering
