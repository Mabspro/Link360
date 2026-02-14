# Link360 Security

Security posture and deployment checklist for the POC. This site handles pledges (contact info), admin auth, and file uploads; no payments.

---

## 1. Authentication & authorization

- **Admin:** Supabase Auth (email + optional Google). Access to `/admin/*` is restricted by **email allowlist** (`LINK360_ADMIN_EMAILS`). Middleware redirects unauthenticated or non-allowlisted users to `/admin/login`. No role table; allowlist is the single source of truth.
- **Admin APIs:** Every admin route (`/api/admin/*`) calls `isAdminEmail(user?.email)` after `createClient().auth.getUser()`. Session is cookie-based; service role is used only server-side for DB writes. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- **Pledges:** No auth required by design (anonymous interest). Duplicate guard: one pledge per (pool_id, user_email) with a clear 409 message.

---

## 2. Input validation & injection

- **APIs:** All request bodies validated with **Zod** (`pledgeApiSchema`, `poolApiSchema`, `pledgeStatusSchema`, `intakeFormSchema`). Invalid input returns 400 with a single error message; no stack traces or internal details.
- **Pledge:** pool_id (UUID), email, enums, numbers with bounds. Server verifies pool exists and `status === 'collecting'` before insert.
- **Intake:** pool_id (UUID), user_email (email), file (type/size). Server verifies pool exists before upload. File path is `{pool_id}/{uuid}.{safeExt}` (no user-controlled path).
- **Email:** User-controlled fields (userName, userEmail, poolTitle) are **HTML-escaped** before interpolation in email body/subject to prevent HTML/script injection in mail clients.
- **No raw SQL;** Supabase client only. No `dangerouslySetInnerHTML` or eval in the app.

---

## 3. Data & RLS

- **Secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LINK360_ADMIN_EMAILS` are server-only (not `NEXT_PUBLIC_*`). `.env*.local` is gitignored.
- **Public env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CONTACT_EMAIL` are safe to expose (anon key is designed for client use; contact email is public).
- **RLS:** Pools readable only where `is_public = true`. Pledges: anon can insert only; no public select (admin uses service role). `admin_settings` is public read. `intake_documents`: no anon/auth policies (service role only). `pool_stats` is a view with explicit grants.

---

## 4. File upload (intake)

- **Limit:** 10MB per file.
- **Types:** Allowlist of MIME types (PDF, CSV, Excel, images). Reject others with 400. (Note: MIME can be spoofed; magic-byte validation can be added later for higher assurance.)
- **Storage:** Private bucket; path is `{pool_id}/{uuid}.{ext}` with sanitized extension. No user-controlled path segment.
- **No execution:** Files are stored only; no parsing or server-side execution in POC.

---

## 5. HTTP & headers

- **Security headers** (via `next.config.mjs`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off). HTTPS is enforced by the host (e.g. Vercel).

---

## 6. Error handling

- **API:** 400/401/409/500 with JSON `{ error: string }`. Generic "Server error" in catch blocks; config errors (e.g. missing service role) return 503 with a short message, no keys or paths.
- **Logging:** Errors logged server-side with `console.error`; avoid logging full request bodies or tokens.

---

## 7. Deployment checklist

- [ ] All migrations (001–006) applied in Supabase; RLS enabled.
- [ ] Env vars set in Vercel (or host): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LINK360_ADMIN_EMAILS`. Optional: `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_CONTACT_EMAIL`.
- [ ] Supabase Auth redirect URLs include production (and preview) origins.
- [ ] No `.env*.local` or secrets committed; `.gitignore` includes `.env*.local`.
- [ ] Admin allowlist contains only trusted emails.

---

## 8. Optional hardening (post-POC)

- **Rate limiting:** Add rate limits on `POST /api/pledges` and `POST /api/intake` (e.g. by IP or by email) to reduce abuse.
- **CSP:** Add Content-Security-Policy header if you add inline scripts or third-party widgets.
- **File validation:** Validate file magic bytes for intake uploads in addition to MIME.
- **Audit:** Periodically review Supabase logs and admin actions.
