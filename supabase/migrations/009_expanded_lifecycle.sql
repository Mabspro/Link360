-- Expanded pool lifecycle: collecting → loading → shipped → arrived_port → arrived_destination → cleared → ready_pickup → closed
-- This migration widens the check constraint on pools.status and pool_updates.kind.

-- 1. Drop the old check constraint on pools.status and add the expanded one
alter table public.pools drop constraint if exists pools_status_check;
alter table public.pools add constraint pools_status_check
  check (status in ('collecting', 'announced', 'loading', 'shipped', 'arrived_port', 'arrived_destination', 'cleared', 'ready_pickup', 'closed'));

-- 2. Expand pool_updates.kind to include arrival/clearance milestones
alter table public.pool_updates drop constraint if exists pool_updates_kind_check;
alter table public.pool_updates add constraint pool_updates_kind_check
  check (kind in ('update', 'announcement', 'loading', 'shipped', 'arrived_port', 'arrived_destination', 'cleared', 'ready_pickup', 'tracking'));

comment on column public.pools.status is 'Full lifecycle: collecting → announced → loading → shipped → arrived_port → arrived_destination → cleared → ready_pickup → closed';
