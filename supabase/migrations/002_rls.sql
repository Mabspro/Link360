-- RLS policies for Link360

alter table public.profiles enable row level security;
alter table public.admin_settings enable row level security;
alter table public.pools enable row level security;
alter table public.pledges enable row level security;

-- Profiles: users can read/update own row (when using auth)
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Admin settings: public read (for pricing calc); only service role can write
create policy "Anyone can read admin_settings" on public.admin_settings for select using (true);

-- Pools: public read where is_public = true; write via service role only (admin uses service role)
create policy "Public can read public pools" on public.pools for select using (is_public = true);

-- Pledges: anyone can insert (anon); select restricted – use pool_stats view for public aggregates
-- Detailed pledge list only via service role (admin)
create policy "Anyone can insert pledges" on public.pledges for insert with check (true);

-- Allow public to read only their own pledges by email (optional; for "my pledges" later)
-- For MVP we don't expose pledge list to public; admin uses service role
create policy "No public select on pledges" on public.pledges for select using (false);

-- pool_stats view: allow public read (view uses underlying tables with RLS)
-- Views inherit RLS from base tables; we need grant on the view
grant select on public.pool_stats to anon, authenticated;
