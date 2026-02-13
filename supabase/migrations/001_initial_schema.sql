-- Link360 Shipping Interest Ledger – Initial Schema
-- Run in Supabase SQL Editor or via supabase db push

-- Profiles (optional; can be extended for auth users later)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  pickup_city text,
  created_at timestamptz default now()
);

-- Admin settings (single row)
create table if not exists public.admin_settings (
  id int primary key default 1,
  rate_per_in3 numeric not null default 0.0145,
  in_city_stop_fee numeric not null default 25,
  out_of_city_base_fee numeric not null default 25,
  out_of_city_per_box_fee numeric not null default 15,
  constraint single_row check (id = 1)
);

-- Pools
create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  destination_city text not null check (destination_city in ('Lusaka', 'Ndola')),
  container_type text not null check (container_type in ('20ft', '40ft')),
  usable_ft3 numeric not null,
  announce_threshold_pct numeric not null default 75,
  status text not null default 'collecting' check (status in ('collecting', 'announced', 'closed')),
  is_public boolean not null default true,
  created_at timestamptz default now()
);

-- Pledges
create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  user_phone text,
  pickup_zone text not null check (pickup_zone in ('in_city', 'out_of_city')),
  pickup_city text,
  item_mode text not null check (item_mode in ('standard_box', 'custom_dims', 'estimate')),
  standard_box_code text,
  length_in numeric,
  width_in numeric,
  height_in numeric,
  quantity integer not null default 1,
  computed_in3 numeric not null,
  computed_ft3 numeric not null,
  est_shipping_cost numeric not null,
  est_pickup_fee numeric not null,
  is_internal_cargo boolean not null default false,
  notes text,
  status text not null default 'pledged' check (status in ('pledged', 'confirmed', 'withdrawn', 'shipped')),
  created_at timestamptz default now()
);

-- Insert default admin_settings
insert into public.admin_settings (id, rate_per_in3, in_city_stop_fee, out_of_city_base_fee, out_of_city_per_box_fee)
values (1, 0.0145, 25, 25, 15)
on conflict (id) do nothing;

-- Pool stats view (for public thermometer and admin)
create or replace view public.pool_stats as
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
  coalesce(sum(pl.computed_ft3), 0)::numeric as total_ft3,
  coalesce(sum(case when pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_internal_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_paid_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.est_shipping_cost else 0 end), 0)::numeric as est_revenue,
  count(pl.id)::int as pledge_count,
  case when p.usable_ft3 > 0 then (coalesce(sum(pl.computed_ft3), 0) / p.usable_ft3 * 100)::numeric else 0 end as pct_full
from public.pools p
left join public.pledges pl on pl.pool_id = p.id and pl.status != 'withdrawn'
group by p.id, p.slug, p.title, p.destination_city, p.container_type, p.usable_ft3, p.announce_threshold_pct, p.status, p.is_public;
