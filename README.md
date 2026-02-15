# Link360 Shipping – Interest Ledger

MVP web app to collect shipping interest/pledges and display a public container completion thermometer for NorCal → Zambia (Lusaka, Ndola). Interest-only; no payments.

## 🎨 UI/UX Redesign

This project includes a comprehensive UI/UX redesign based on the Kimi Agent review, featuring:
- **Brand colors**: Ocean blue (#0A2540), Warm sand (#D4A574), Sunset orange (#E65100), Zambia green (#1B5E20)
- **Animated components**: Thermometer with confetti celebration, smooth card animations, hero section
- **Design system**: Consistent buttons, cards, inputs, typography, spacing
- **Trust signals**: Badges, clear CTAs, transparent pricing display
- **Mobile-first**: Responsive design with touch-friendly targets

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + TailwindCSS
- **Supabase**: Postgres, Auth, RLS
- **Forms**: Zod + React Hook Form
- **Email**: Resend (or console stub if no API key)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms Plugin**: @tailwindcss/forms

## Project Status

### ✅ Completed Features

#### Core Infrastructure
- [x] Next.js 14 App Router setup with TypeScript
- [x] TailwindCSS with custom design system
- [x] Supabase client (browser + server) with SSR support
- [x] Environment variable configuration (.env.example)
- [x] Error handling with custom error page
- [x] Middleware for admin route protection

#### Database & Backend
- [x] Supabase migrations 001–006 (schema, RLS, pools/ships_at, sponsors, ship_cost/updates, intake_documents)
- [x] Tables: `profiles`, `pools`, `pledges`, `admin_settings`, `sponsors`, `pool_updates`, `intake_documents`
- [x] View: `pool_stats` (aggregated pool statistics, sponsor, target_ship_cost, ship_cost_reach_pct)
- [x] Row Level Security (RLS) policies
- [x] Public read access for pools and admin_settings; insert-only for pledges
- [x] Admin-only access via service role; pricing from `admin_settings` (calculator + pledge form)

#### Public Pages
- [x] **Home (`/`)**: Hero section with trust badges, active pool cards, "How It Works" section
- [x] **Pool Detail (`/pool/[slug]`)**: Horizontal thermometer, stats cards, pledge form, prohibited items, collapsible calculator
- [x] **Pricing (`/pricing`)**: Rate explanation (from DB), calculator, standard box reference table
- [x] **FAQ (`/faq`)**: Questions and answers, prohibited items list
- [x] **Contact (`/contact`)**: Mailto link, response-time note, link to pools
- [x] **Custom 404** (`not-found`): Branded page with links to Home and Pricing

#### Components
- [x] **Nav**: Navigation bar with design system styling
- [x] **HomeHero**: Animated hero with gradient background, CTAs, trust badges
- [x] **PoolCard**: Rich card with progress bar, stats grid, hover effects
- [x] **AnimatedThermometer**: Vertical thermometer with animated fill, confetti celebration
- [x] **HorizontalThermometer**: Desktop-friendly horizontal progress bar with ship icon
- [x] **PledgeForm**: Single-page form with live cost calculation
- [x] **HowItWorks**: Four-step process visualization
- [x] **EmptyPoolsState**: Empty state with icon and helpful message

#### Admin Dashboard
- [x] **Login (`/admin/login`)**: Supabase Auth email/password sign-in
- [x] **Dashboard (`/admin/dashboard`)**: Pool list with stats, create/edit links
- [x] **Create Pool (`/admin/pools/new`)**: Form to create new shipping pools
- [x] **Edit Pool (`/admin/pools/[id]/edit`)**: Edit pool settings
- [x] **Pool Pledges (`/admin/pools/[id]`)**: View pledges, filter by status, export CSV, update status/internal cargo

#### API Routes
- [x] **POST `/api/pledges`**: Submit pledge (duplicate guard: 409 if same pool+email; inserts to DB, sends emails)
- [x] **POST `/api/intake`**: Upload packing list (optional); store in Supabase Storage + `intake_documents`; no AI
- [x] **POST `/api/admin/pools`**: Create pool (admin only)
- [x] **PATCH `/api/admin/pools/[id]`**: Update pool (admin only)
- [x] **PATCH `/api/admin/pledges/[id]`**: Update pledge status/internal cargo (admin only; status validated with Zod enum)

#### Email Service
- [x] Resend integration (with fallback to console logging)
- [x] Pledge confirmation email to user
- [x] Admin notification email on new pledge

#### Design System
- [x] Custom Tailwind config with brand colors, typography scale, shadows
- [x] Global CSS with utility classes (.btn, .card, .input, .heading-*, etc.)
- [x] Inter font integration
- [x] Reduced motion support for accessibility

### 🚧 Partially Complete / Needs Enhancement

- [ ] **Admin settings UI**: Pricing is read from `admin_settings` (calculator + pledge use it); no admin UI to edit rates yet
- [ ] **Multi-step pledge form**: Current form is single-page; optional multi-step wizard for later
- [ ] **Email templates**: Basic HTML emails; could be enhanced with branded templates
- [ ] **Toast notifications**: No toast system for success/error messages (only console logs)
- [ ] **Loading states**: Some pages lack skeleton loaders or loading indicators
- [ ] **Form validation feedback**: Could be more visual/helpful

### ❌ Missing Features (From Original Spec)

- [ ] **Countdown timer**: "Countdown to announce threshold" mentioned in spec (could show days/hours remaining)
- [ ] **Social sharing**: Share pledge/pool on social media (mentioned in Kimi review)
- [ ] **Pledge history**: Users can't view their own pledges (no user accounts for public users)
- [ ] **Pool search/filter**: No search or filter on home page pools
- [ ] **Bulk actions**: Admin can't bulk update pledge statuses
- [ ] **Analytics**: No tracking/metrics dashboard
- [ ] **Export formats**: CSV only; could add JSON, Excel
- [ ] **Email preferences**: Users can't opt out of emails

### 🔧 Technical Debt / Improvements

- [ ] **Error boundaries**: Only root error.tsx; could add per-route boundaries
- [ ] **Type safety**: Some `any` types in admin components
- [ ] **Testing**: No unit tests, integration tests, or E2E tests
- [ ] **Performance**: No image optimization, lazy loading for below-fold content
- [ ] **Accessibility audit**: Should run Lighthouse/WAVE audit
- [ ] **SEO**: Missing meta tags, Open Graph, structured data
- [ ] **i18n**: English only; no internationalization
- [ ] **Documentation**: Component docs, API docs could be added

## Local Development

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
     - `supabase/migrations/003_pools_ships_at.sql`
     - `supabase/migrations/004_sponsors.sql`
     - `supabase/migrations/005_ship_cost_and_updates.sql`
     - `supabase/migrations/006_intake_documents.sql`
   - In Authentication → Providers, enable Email (and Google if desired). See [docs/GOOGLE_AUTH_SUPABASE.md](docs/GOOGLE_AUTH_SUPABASE.md).

3. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` – project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon key
   - `SUPABASE_SERVICE_ROLE_KEY` – service role key (from Project Settings → API)
   - `LINK360_ADMIN_EMAILS` – comma-separated admin emails (e.g. `you@example.com`)
   - Optional: `NEXT_PUBLIC_CONTACT_EMAIL` – contact page mailto (defaults to placeholder if unset)
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
   | `NEXT_PUBLIC_CONTACT_EMAIL` | (optional) | Contact page email (e.g. `contact@yourdomain.com`) |

   After saving, trigger a **Redeploy** (Deployments → ⋮ → Redeploy) so the new env is used.

2. **Supabase**

   - Use your existing project (or create one). Run all migrations in order (001 through 006) in the SQL Editor.

3. **Supabase Auth redirect (for admin login)**

   In **Supabase** → **Authentication** → **URL Configuration**:

   - **Site URL:** `https://link360.vercel.app`
   - **Redirect URLs:** add `https://link360.vercel.app/**` (and `https://link360-l0b3nte2r-leverage-labs.vercel.app/**` if you use preview URLs)

## Project Structure

```
link360/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page (hero, pools, how it works)
│   │   ├── pool/[slug]/        # Pool detail page
│   │   ├── pricing/            # Pricing page
│   │   ├── faq/                # FAQ page
│   │   ├── contact/            # Contact page
│   │   ├── not-found.tsx       # Custom 404
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── login/          # Admin login
│   │   │   ├── dashboard/      # Pool list
│   │   │   └── pools/          # Pool CRUD + pledges
│   │   ├── api/                 # API routes
│   │   │   ├── pledges/        # POST pledge
│   │   │   ├── intake/         # POST packing list upload
│   │   │   └── admin/          # Admin APIs
│   │   ├── layout.tsx          # Root layout with Nav
│   │   └── error.tsx           # Error boundary
│   ├── components/             # React components
│   │   ├── Nav.tsx             # Navigation bar
│   │   ├── HomeHero.tsx        # Hero section
│   │   ├── PoolCard.tsx        # Pool card component
│   │   ├── AnimatedThermometer.tsx  # Thermometer components
│   │   ├── PledgeForm.tsx      # Pledge form + optional packing list upload
│   │   ├── SpacePriceCalculator.tsx / CollapsibleCalculator.tsx
│   │   ├── HowItWorks.tsx      # Process steps
│   │   ├── EmptyPoolsState.tsx # Empty state
│   │   └── admin/              # Admin components
│   ├── lib/                    # Utilities & config
│   │   ├── supabase/           # Supabase clients
│   │   ├── types.ts            # TypeScript types
│   │   ├── constants.ts        # Constants (boxes, pricing defaults)
│   │   ├── validations.ts      # Zod schemas
│   │   ├── pricing.ts         # Pricing calculations (uses admin_settings when passed)
│   │   ├── get-admin-settings.ts  # Server: fetch admin_settings for pricing
│   │   ├── email.ts            # Email service
│   │   ├── faq.ts              # FAQ content
│   │   └── admin-auth.ts       # Admin auth helpers
│   └── middleware.ts           # Next.js middleware (admin protection)
├── supabase/
│   └── migrations/             # SQL migrations (run 001 → 006 in order)
│       ├── 001_initial_schema.sql
│       ├── 002_rls.sql
│       ├── 003_pools_ships_at.sql
│       ├── 004_sponsors.sql
│       ├── 005_ship_cost_and_updates.sql
│       └── 006_intake_documents.sql
├── .env.example                # Environment template
├── tailwind.config.ts          # Tailwind config with design system
├── package.json
└── README.md
```

## Backend & Auth

- **Pledge API**: `POST /api/pledges` validates with Zod, checks for duplicate (pool_id + user_email → 409), inserts into `pledges`, sends confirmation and admin emails. See [docs/BACKEND_PLEDGES.md](docs/BACKEND_PLEDGES.md).
- **Intake API**: `POST /api/intake` accepts an optional packing list file (PDF, CSV, Excel, image); stores in Supabase Storage and `intake_documents`. No parsing or auto-fill (POC).
- **Admin auth**: Email/password or **Google** via Supabase. Admin access is enforced by email allowlist (`LINK360_ADMIN_EMAILS`). To enable Google: [docs/GOOGLE_AUTH_SUPABASE.md](docs/GOOGLE_AUTH_SUPABASE.md).

## Data Model

- **profiles** – Optional user profile (auth)
- **pools** – Shipping pools (destination, container type, threshold, status, ships_at, target_ship_cost, sponsor_id)
- **pledges** – Pledge rows (contact, dimensions, computed ft³/cost, status, internal cargo flag)
- **admin_settings** – Single row: rate per in³, pickup fees (used by calculator and pledge form)
- **sponsors** – Pool sponsors (listed by); **pool_updates** – Tracking/announcements per pool
- **intake_documents** – Optional packing list uploads (pool_id, user_email, file_path); admin can view
- **pool_stats** – View: per-pool aggregates (total ft³, revenue, pledge count, % full, sponsor, ship_cost_reach_pct)

RLS: public can read public pools, admin_settings, and insert pledges; intake_documents and detailed pledge read use service role (admin only).

## Key Features

### Public Features
- ✅ View active shipping pools with progress thermometers and ship window
- ✅ Submit pledges with live cost calculation (pricing from DB)
- ✅ Optional packing list upload (PDF, CSV, Excel, image) on pledge form
- ✅ Space + price calculator (collapsible on pool page, full on pricing page)
- ✅ Contact page and branded 404
- ✅ Read FAQ and prohibited items list
- ✅ Responsive design (mobile, tablet, desktop)

### Admin Features
- ✅ Create and edit shipping pools (sponsor, target ship cost, ships_at)
- ✅ View all pledges with filtering; update status (Zod-validated) and internal cargo flag
- ✅ View packing list uploads per pool (intake_documents)
- ✅ Export pledges to CSV
- ✅ View pool statistics and progress

## Quality & Standards

- ✅ Type-safe (TypeScript, Zod)
- ✅ Accessible UI (labels, progressbar, focus states, reduced motion)
- ✅ Error handling (try/catch, error boundaries, clear messages)
- ✅ No payments (interest-only as specified)
- ✅ Clean code structure
- ✅ Design system consistency

## Docs

- [SECURITY.md](docs/SECURITY.md) – Security posture, validation, RLS, headers, deployment checklist
- [IMPLEMENTATION_STRATEGY_CORRIDOR.md](docs/IMPLEMENTATION_STRATEGY_CORRIDOR.md) – Corridor reality: must-includes and nice-to-haves from Shipping Reality Map + Research Analysis
- [SITE_EVALUATION.md](docs/SITE_EVALUATION.md) – Full evaluation, POC scope, build sequence, B/C direction
- [SPRINT_REPORT_POC_HARDENING_UPLOAD.md](docs/SPRINT_REPORT_POC_HARDENING_UPLOAD.md) – Foundation + pricing from DB + intake upload
- [BACKEND_PLEDGES.md](docs/BACKEND_PLEDGES.md) – Pledge API logic and mapping
- [GOOGLE_AUTH_SUPABASE.md](docs/GOOGLE_AUTH_SUPABASE.md) – Admin Google sign-in
- [SPONSORS_DESIGN.md](docs/SPONSORS_DESIGN.md) – Pool sponsors and “listed by”

## Next Steps / Roadmap

### POC (current)
- Pricing is from DB; no admin UI to edit rates yet (optional).
- Optional packing list upload is signal-building only; AI pre-fill is a later phase.

### High Priority
1. **Admin settings UI** – Edit pricing rates/fees without SQL (optional for POC)
2. **Loading states** – Skeleton loaders for key routes
3. **Toast or in-form feedback** – Already have root error for 409/API errors

### Medium Priority
5. **Countdown timer** – Show time remaining until threshold
6. **Social sharing** – Share pools/pledges on social media
7. **Pledge history** – Allow users to view their pledges (requires user accounts)
8. **Bulk actions** – Admin bulk update for pledges

### Low Priority
9. **Analytics dashboard** – Track conversion rates, pledge trends
10. **Export formats** – Add JSON, Excel exports
11. **Email templates** – Branded email templates
12. **Testing** – Add unit/integration/E2E tests

## Contributing

This is a private project. For questions or issues, contact the maintainer.

## License

Private / Proprietary
