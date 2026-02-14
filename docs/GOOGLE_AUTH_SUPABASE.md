# Google Auth with Supabase

Link360 uses **Supabase Auth** for admin (and optionally later for public users). You can add **Google sign-in** so admins (or users) sign in with Google instead of or in addition to email/password.

## Why Supabase for Google?

- **Use Google auth *in* Supabase** (recommended): one auth system, one session, same RLS and `auth.users`. Supabase supports Google OAuth out of the box.
- **Don’t** run a separate “auth on Google” app: that would duplicate identity and complicate “who is admin?” and “who owns this pledge?”.

## 1. Enable Google in Supabase

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**.
2. Turn **Google** on.
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URIs**: add the Supabase redirect URL shown in the Supabase Google provider config (e.g. `https://<project-ref>.supabase.co/auth/v1/callback`).
4. Copy **Client ID** and **Client Secret** into the Supabase Google provider and save.

## 2. Redirect URLs (Supabase)

In **Authentication** → **URL Configuration**:

- **Site URL**: your app origin (e.g. `https://link360.vercel.app` or `http://localhost:3000`).
- **Redirect URLs**: add **both** the auth callback and the final dashboard URL:
  - `http://localhost:3000/auth/callback` (local callback)
  - `http://localhost:3000/admin/dashboard` (local)
  - `https://link360.vercel.app/auth/callback` (production callback)
  - `https://link360.vercel.app/admin/dashboard` (production)
  - Any other envs (e.g. preview) as needed.

The app uses `/auth/callback` to exchange the OAuth code for a session (cookies), then redirects to `/admin/dashboard`. If Supabase is misconfigured and sends the code to the **root** URL (e.g. `https://link360.vercel.app/?code=...`), the app’s middleware will redirect that request to `/auth/callback` so sign-in still completes.

## 3. Admin allowlist

Admin access is still controlled by **email allowlist** (`LINK360_ADMIN_EMAILS`).  
So:

- **Email/password**: only allowlisted emails can access `/admin/*`.
- **Google**: only if the signed-in user’s email is in `LINK360_ADMIN_EMAILS` can they access `/admin/*`.

Add the **Google account email** (e.g. `mabspro34@gmail.com`) to `LINK360_ADMIN_EMAILS` in:

- **Local**: `.env.local` → `LINK360_ADMIN_EMAILS=mabspro34@gmail.com` (or comma-separated list).
- **Vercel**: Project → Settings → Environment Variables → add or edit `LINK360_ADMIN_EMAILS` with the same value.

Then that account can use “Sign in with Google” for admin.

## 4. What’s in the app

- **Admin login** (`/admin/login`): “Sign in with Google” calls `signInWithOAuth` with `redirectTo: origin + '/auth/callback?next=/admin/dashboard'`.
- **Auth callback** (`/auth/callback`): GET route exchanges the OAuth `code` for a session (sets cookies), then redirects to `next` (e.g. `/admin/dashboard`).
- **Middleware**: allows or denies `/admin/*` based on the session and `LINK360_ADMIN_EMAILS` allowlist.

No separate “auth on Google” app is required; everything goes through Supabase.
