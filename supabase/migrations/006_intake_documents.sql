-- Intake documents: optional packing list uploads (no AI parsing in POC).
-- Files are stored in Supabase Storage bucket 'intake'; create bucket in Dashboard if needed (private).

create table if not exists public.intake_documents (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_email text not null,
  file_path text not null,
  created_at timestamptz default now()
);

create index if not exists idx_intake_documents_pool_id on public.intake_documents(pool_id);

alter table public.intake_documents enable row level security;

-- No select/insert for anon or authenticated; only service role (API) can read/write.
-- So we do not create any policies — RLS denies all for anon/auth by default.

comment on table public.intake_documents is 'Optional packing list uploads per pool; admin can view. No AI parsing in POC.';
