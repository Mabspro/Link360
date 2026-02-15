-- Add container image URL to pools (sponsor/admin uploads photo of container at yard/port/loading)
alter table public.pools add column if not exists container_image_url text;

comment on column public.pools.container_image_url is 'URL to container photo (Supabase storage). Shown on pool card and detail page as credibility anchor.';

-- Recreate pool_stats to include container_image_url
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
  p.target_ship_cost,
  p.sponsor_id,
  p.origin_region,
  p.container_image_url,
  s.name as sponsor_name,
  s.company as sponsor_company,
  coalesce(sum(pl.computed_ft3), 0)::numeric as total_ft3,
  coalesce(sum(case when pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_internal_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_paid_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.est_shipping_cost else 0 end), 0)::numeric as est_revenue,
  case when p.target_ship_cost is not null and p.target_ship_cost > 0
    then least(100, (coalesce(sum(case when not pl.is_internal_cargo then pl.est_shipping_cost else 0 end), 0) / p.target_ship_cost * 100)::numeric)
    else null end as ship_cost_reach_pct,
  count(pl.id)::int as pledge_count,
  case when p.usable_ft3 > 0 then (coalesce(sum(pl.computed_ft3), 0) / p.usable_ft3 * 100)::numeric else 0 end as pct_full
from public.pools p
left join public.sponsors s on s.id = p.sponsor_id
left join public.pledges pl on pl.pool_id = p.id and pl.status != 'withdrawn'
group by p.id, p.slug, p.title, p.destination_city, p.container_type, p.usable_ft3, p.announce_threshold_pct, p.status, p.is_public, p.ships_at, p.target_ship_cost, p.sponsor_id, p.origin_region, p.container_image_url, s.name, s.company;

grant select on public.pool_stats to anon, authenticated;
