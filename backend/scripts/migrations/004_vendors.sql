-- ============================================================================
-- FixKart - 004: Vendor role & shops
--
-- Run this in Supabase Dashboard -> SQL Editor. Safe to re-run (idempotent).
--
-- Adds:
--   1. vendors table for shop owners who sell products
--   2. RLS policies so:
--        - vendors can read/update ONLY their own vendor row
--        - admins can update any vendor row (verification)
--        - everyone can read verified vendors (catalog)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. vendors table
-- ---------------------------------------------------------------------------

create table if not exists public.vendors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_name text not null,
  shop_description text default '',
  shop_location text default '',
  logo_url text,
  banner_url text,
  rating numeric(3,2) default 0,
  total_sales integer default 0,
  verification_status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint vendors_user_id_key unique (user_id),
  constraint vendors_verification_status_check
    check (verification_status in ('pending', 'verified', 'rejected', 'suspended'))
);

-- Index for quick lookups
create index if not exists idx_vendors_user_id on public.vendors(user_id);
create index if not exists idx_vendors_verification on public.vendors(verification_status);

-- ---------------------------------------------------------------------------
-- 2. RLS policies
-- ---------------------------------------------------------------------------

-- Everyone can read verified vendors (for the shop catalog)
drop policy if exists "public_read_vendors" on public.vendors;
create policy "public_read_vendors"
  on public.vendors for select
  using (verification_status = 'verified' or auth.uid() = user_id);

-- Vendors can update their own row
drop policy if exists "owner_update_vendor" on public.vendors;
create policy "owner_update_vendor"
  on public.vendors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can update any vendor row (verification/suspension)
drop policy if exists "admin_update_vendor" on public.vendors;
create policy "admin_update_vendor"
  on public.vendors for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Vendors can insert their own row (registration fallback when
-- the service-role key is not configured), but NEVER with a verified
-- status - only "pending" can be self-inserted.
drop policy if exists "owner_insert_vendor" on public.vendors;
create policy "owner_insert_vendor"
  on public.vendors for insert
  with check (auth.uid() = user_id and verification_status = 'pending');

-- ---------------------------------------------------------------------------
-- 3. updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.update_vendors_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_vendors_updated_at on public.vendors;
create trigger update_vendors_updated_at
  before update on public.vendors
  for each row
  execute function public.update_vendors_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Allow vendors to insert products (link to their shop)
-- ---------------------------------------------------------------------------

-- This enables the product insertion policy for vendors.
-- The products table already exists; we just need RLS policies for vendor
-- product management.

-- Vendors can insert products linked to their own shop
drop policy if exists "vendor_insert_products" on public.products;
create policy "vendor_insert_products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );

-- Vendors can update their own products
drop policy if exists "vendor_update_products" on public.products;
create policy "vendor_update_products"
  on public.products for update
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );

-- Vendors can delete their own products
drop policy if exists "vendor_delete_products" on public.products;
create policy "vendor_delete_products"
  on public.products for delete
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Add vendor_id to products table if not exists
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists vendor_id uuid references public.vendors(id) on delete set null;

create index if not exists idx_products_vendor_id on public.products(vendor_id);
