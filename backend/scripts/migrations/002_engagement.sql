-- ============================================================================
-- FixKart - 002: Engagement (featured/offers, wishlist-ready catalog fields,
-- points wallet, order-again data)
--
-- Run this in Supabase Dashboard -> SQL Editor. Safe to re-run (idempotent).
--
-- Adds:
--   1. products.featured + products.discount_price (drives Featured + Deals)
--   2. orders.points_redeemed (points spendable at checkout; 1 point = Rs 1)
--   3. wallets + wallet_transactions tables
--   4. Triggers (server-side, tamper-proof):
--        - earn 1 point per Rs 10 spent when an order is placed
--        - verify + deduct points when an order redeems points (before insert)
--        - earn a 50-point bonus when a service booking is completed
--   5. RLS: every user reads ONLY their own wallet + transactions
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Products: featured flag + discounted price
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists featured boolean not null default false;

alter table public.products
  add column if not exists discount_price numeric;

-- ---------------------------------------------------------------------------
-- 2. Orders: how many points were redeemed on this order
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists points_redeemed integer not null default 0;

-- ---------------------------------------------------------------------------
-- 3. Wallets
-- ---------------------------------------------------------------------------

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  lifetime_points integer not null default 0 check (lifetime_points >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null,
  type text not null check (type in ('earned', 'redeemed', 'bonus', 'refund')),
  description text,
  reference_type text,
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists wallet_tx_user_idx
  on public.wallet_transactions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. RLS - users can read only their own wallet data. Writes happen ONLY via
--    the server-side triggers below (security definer, bypass RLS), so a user
--    can never credit their own wallet.
-- ---------------------------------------------------------------------------

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;

drop policy if exists "owner_read_wallet" on public.wallets;
create policy "owner_read_wallet"
  on public.wallets for select
  using (auth.uid() = user_id);

drop policy if exists "owner_read_wallet_tx" on public.wallet_transactions;
create policy "owner_read_wallet_tx"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Helper: make sure a wallet row exists
-- ---------------------------------------------------------------------------

create or replace function public.ensure_wallet(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.wallets (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Earn points when an order is placed (1 point per Rs 10)
-- ---------------------------------------------------------------------------

create or replace function public.earn_points_on_order()
returns trigger
language plpgsql
security definer
as $$
declare
  v_points integer;
begin
  v_points := floor(coalesce(new.total_amount, 0) / 10);
  if v_points > 0 then
    perform public.ensure_wallet(new.user_id);
    update public.wallets
    set points = points + v_points,
        lifetime_points = lifetime_points + v_points,
        updated_at = now()
    where user_id = new.user_id;
    insert into public.wallet_transactions
      (user_id, points, type, description, reference_type, reference_id)
    values
      (new.user_id, v_points, 'earned', 'Points earned on order', 'order', new.id::text);
  end if;
  return new;
end;
$$;

drop trigger if exists earn_points_on_order on public.orders;
create trigger earn_points_on_order
  after insert on public.orders
  for each row
  execute function public.earn_points_on_order();

-- ---------------------------------------------------------------------------
-- 7. Redeem points at checkout (runs BEFORE insert so an over-redemption
--    aborts the whole order - no order, no points lost)
-- ---------------------------------------------------------------------------

create or replace function public.redeem_points_on_order()
returns trigger
language plpgsql
security definer
as $$
declare
  v_balance integer;
begin
  if coalesce(new.points_redeemed, 0) > 0 then
    perform public.ensure_wallet(new.user_id);
    select points into v_balance from public.wallets where user_id = new.user_id;
    if v_balance is null or v_balance < new.points_redeemed then
      raise exception 'Insufficient wallet points. You have % points but tried to redeem %.',
        coalesce(v_balance, 0), new.points_redeemed;
    end if;
    update public.wallets
    set points = points - new.points_redeemed,
        updated_at = now()
    where user_id = new.user_id;
    insert into public.wallet_transactions
      (user_id, points, type, description, reference_type, reference_id)
    values
      (new.user_id, -new.points_redeemed, 'redeemed', 'Points redeemed on order', 'order', new.id::text);
  end if;
  return new;
end;
$$;

drop trigger if exists redeem_points_on_order on public.orders;
create trigger redeem_points_on_order
  before insert on public.orders
  for each row
  execute function public.redeem_points_on_order();

-- ---------------------------------------------------------------------------
-- 8. Earn a 50-point bonus when a booking is completed
-- ---------------------------------------------------------------------------

create or replace function public.earn_points_on_booking_complete()
returns trigger
language plpgsql
security definer
as $$
declare
  v_points integer := 50;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    perform public.ensure_wallet(new.user_id);
    update public.wallets
    set points = points + v_points,
        lifetime_points = lifetime_points + v_points,
        updated_at = now()
    where user_id = new.user_id;
    insert into public.wallet_transactions
      (user_id, points, type, description, reference_type, reference_id)
    values
      (new.user_id, v_points, 'bonus', 'Bonus for completing a service booking', 'booking', new.id::text);
  end if;
  return new;
end;
$$;

drop trigger if exists earn_points_on_booking_complete on public.bookings;
create trigger earn_points_on_booking_complete
  after update on public.bookings
  for each row
  execute function public.earn_points_on_booking_complete();

-- ---------------------------------------------------------------------------
-- 9. Backfill: every existing user gets a wallet (new users get one via the
--    triggers above)
-- ---------------------------------------------------------------------------

insert into public.wallets (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- Verify
select
  (select count(*) from public.wallets) as wallets,
  (select count(*) from public.wallet_transactions) as transactions,
  (select count(*) from public.products where featured) as featured_products,
  (select count(*) from public.products where discount_price is not null) as discounted_products;
