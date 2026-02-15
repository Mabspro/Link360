-- Sponsor request intake: public form stores requests; admin vets and creates sponsor
create table if not exists public.sponsor_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'created')),
  created_sponsor_id uuid references public.sponsors(id) on delete set null,
  created_at timestamptz default now()
);

comment on column public.sponsor_requests.status is 'pending = not yet vetted; created = converted to a sponsor';

alter table public.sponsor_requests enable row level security;

-- Public can only insert (submit the form)
create policy "Anyone can insert sponsor_requests"
  on public.sponsor_requests for insert
  with check (true);

-- No public read/update; admin uses service role
create policy "No anon select sponsor_requests"
  on public.sponsor_requests for select
  using (false);

create policy "No anon update sponsor_requests"
  on public.sponsor_requests for update
  using (false);

-- Service role (admin API) can do everything; we use service role in API routes
grant all on public.sponsor_requests to service_role;
