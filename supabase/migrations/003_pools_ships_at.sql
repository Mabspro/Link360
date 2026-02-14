-- Add ship window date for sorting "soonest to go"
alter table public.pools add column if not exists ships_at date;

-- Recreate pool_stats view to include ships_at (drop first so column order can change)
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
  coalesce(sum(pl.computed_ft3), 0)::numeric as total_ft3,
  coalesce(sum(case when pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_internal_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.computed_ft3 else 0 end), 0)::numeric as total_paid_ft3,
  coalesce(sum(case when not pl.is_internal_cargo then pl.est_shipping_cost else 0 end), 0)::numeric as est_revenue,
  count(pl.id)::int as pledge_count,
  case when p.usable_ft3 > 0 then (coalesce(sum(pl.computed_ft3), 0) / p.usable_ft3 * 100)::numeric else 0 end as pct_full
from public.pools p
left join public.pledges pl on pl.pool_id = p.id and pl.status != 'withdrawn'
group by p.id, p.slug, p.title, p.destination_city, p.container_type, p.usable_ft3, p.announce_threshold_pct, p.status, p.is_public, p.ships_at;

grant select on public.pool_stats to anon, authenticated;
