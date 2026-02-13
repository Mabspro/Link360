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

**Live:** [link360.vercel.app](https://link360.vercel.app) · **Source:** GitHub `Mabspro/Link360` → branch `main`

1. **Vercel (already connected)**

   - Repo is linked; pushes to `main` auto-deploy.
   - **Add environment variables** in Vercel: Project → **Settings** → **Environment Variables**. Use **Production** (and **Preview** if you want). Add:

   | Name | Value | Notes |
   |------|--------|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase API settings |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key | From Supabase API settings |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Secret; from Supabase API settings |
   | `LINK360_ADMIN_EMAILS` | `admin@example.com` | Comma-separated emails for `/admin` |
   | `RESEND_API_KEY` | (optional) | For pledge confirmation emails |
   | `EMAIL_FROM` | (optional) | e.g. `Link360 <noreply@yourdomain.com>` |

   After saving, trigger a **Redeploy** (Deployments → ⋮ → Redeploy) so the new env is used.

2. **Supabase**

   - Use your existing project (or create one). Run migrations in SQL Editor: `001_initial_schema.sql`, then `002_rls.sql`.

3. **Supabase Auth redirect (for admin login)**

   In **Supabase** → **Authentication** → **URL Configuration**:

   - **Site URL:** `https://link360.vercel.app`
   - **Redirect URLs:** add `https://link360.vercel.app/**` (and `https://link360-l0b3nte2r-leverage-labs.vercel.app/**` if you use preview URLs)

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
