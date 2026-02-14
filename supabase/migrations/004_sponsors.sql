-- Pool sponsors (container owners): who is listing this container
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  created_at timestamptz default now()
);

alter table public.pools add column if not exists sponsor_id uuid references public.sponsors(id) on delete set null;

-- RLS: public can read sponsors (for "Listed by" display); only service role writes
alter table public.sponsors enable row level security;
create policy "Anyone can read sponsors" on public.sponsors for select using (true);

-- Recreate pool_stats to include sponsor display fields (drop first so column order can change)
drop view if exists public.pool_stats;
create view public.pool_stats as
select
  p.id as pool_id,
  p.slug,
  p.title,
  p.destination_city,
  p.container_type,
  p.usable_ft3,
  p.announce_threshold_pct,
  p.status,
  p.is_public,
  p.ships_at,
  p.sponsor_id,
  s.name as sponsor_name,
  s.company as sponsor_company,
  coalesce(sum(pl.computed_ft3), 0)::numeric as total_ft3,
  coalesce(sum(case when pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_internal_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_paid_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.est_shipping_cost else 0 end), 0)::numeric as est_revenue,
  count(pl.id)::int as pledge_count,
  case when p.usable_ft3 > 0 then (coalesce(sum(pl.computed_ft3), 0) / p.usable_ft3 * 100)::numeric else 0 end as pct_full
from public.pools p
left join public.sponsors s on s.id = p.sponsor_id
left join public.pledges pl on pl.pool_id = p.id and pl.status != 'withdrawn'
group by p.id, p.slug, p.title, p.destination_city, p.container_type, p.usable_ft3, p.announce_threshold_pct, p.status, p.is_public, p.ships_at, p.sponsor_id, s.name, s.company;

grant select on public.pool_stats to anon, authenticated;
