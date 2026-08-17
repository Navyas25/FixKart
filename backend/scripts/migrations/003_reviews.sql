-- ============================================================================
-- FixKart - 003: Reviews (products + services)
--
-- Run this in Supabase Dashboard -> SQL Editor. Safe to re-run (idempotent).
--
-- Adds:
--   1. reviews table - one review per user per item (products AND services)
--   2. RLS:
--        - anyone can read reviews
--        - users can create/update/delete ONLY their own reviews
-- ============================================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('product', 'service')),
  item_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists reviews_item_idx
  on public.reviews (item_type, item_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.reviews enable row level security;

drop policy if exists "public_read_reviews" on public.reviews;
create policy "public_read_reviews"
  on public.reviews for select
  using (true);

drop policy if exists "owner_insert_review" on public.reviews;
create policy "owner_insert_review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "owner_update_review" on public.reviews;
create policy "owner_update_review"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owner_delete_review" on public.reviews;
create policy "owner_delete_review"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Verify
select
  (select count(*) from public.reviews) as reviews,
  (select count(*) from pg_policies where tablename = 'reviews') as rls_policies;
