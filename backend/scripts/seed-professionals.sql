-- ============================================================================
-- FixKart - professional accounts & rows
--
-- An older seed.sql inserted into auth.users directly, which can fail on
-- newer Supabase schemas and leave BROKEN auth users behind (products and
-- services still seed fine - they come before the auth section).
--
-- This file fixes that in two parts:
--
--   PART 1  - run first, in the Supabase SQL Editor. Deletes the broken
--             pro.*@fixkart.dev auth users so they can be recreated.
--
--   (Between the parts, the accounts are recreated through the app's own
--    register endpoint - the supported, version-proof way - see the README
--    "Seeding sample data" section.)
--
--   PART 2  - run after the accounts exist. Fills in profile details and the
--             professionals rows, matching users by email. Safe to re-run.
-- ============================================================================


-- ============================================================================
-- PART 1 - clean up broken professional auth users (run this first)
-- ============================================================================

-- Profiles rows created for those users (by the signup trigger) go first,
-- then identities, then the users themselves.
delete from profiles
where id in (
  select id from auth.users where email like 'pro.%@fixkart.dev'
);

delete from auth.identities
where user_id in (
  select id from auth.users where email like 'pro.%@fixkart.dev'
);

delete from auth.users
where email like 'pro.%@fixkart.dev';


-- ============================================================================
-- PART 2 - profiles + professionals (run after the accounts are created)
-- ============================================================================

-- 2a. Profile rows (avatar, phone, role)
insert into profiles (id, full_name, avatar_url, phone, role)
select
  u.id,
  v.full_name,
  v.avatar_url,
  v.phone,
  'professional'
from (
  values
    ('pro.plumber@fixkart.dev', 'Rajesh Kumar', 'https://picsum.photos/seed/fixkart-rajesh/200/200', '+91 98765 40001'),
    ('pro.electrician@fixkart.dev', 'Suresh Reddy', 'https://picsum.photos/seed/fixkart-suresh/200/200', '+91 98765 40002'),
    ('pro.carpenter@fixkart.dev', 'Amit Verma', 'https://picsum.photos/seed/fixkart-amit/200/200', '+91 98765 40003'),
    ('pro.ac@fixkart.dev', 'Deepak Sharma', 'https://picsum.photos/seed/fixkart-deepak/200/200', '+91 98765 40004'),
    ('pro.painter@fixkart.dev', 'Vikram Singh', 'https://picsum.photos/seed/fixkart-vikram/200/200', '+91 98765 40005'),
    ('pro.mechanic@fixkart.dev', 'Mohan Das', 'https://picsum.photos/seed/fixkart-mohan/200/200', '+91 98765 40006')
) as v(email, full_name, avatar_url, phone)
join auth.users u on u.email = v.email
on conflict (id) do update
set
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  phone = excluded.phone,
  role = excluded.role;

-- 2b. Professional rows
insert into professionals (user_id, experience_years, rating, bio)
select
  u.id,
  v.experience_years,
  v.rating,
  v.bio
from (
  values
    ('pro.plumber@fixkart.dev', 12, 4.9, 'Certified plumber specialising in bathroom fittings, leak repairs, pipe installation and water heater setup across the city.'),
    ('pro.electrician@fixkart.dev', 8, 4.8, 'Licensed electrician for house wiring, switchboard upgrades, appliance circuits and safety inspections.'),
    ('pro.carpenter@fixkart.dev', 15, 4.7, 'Carpenter for custom furniture, door fitting, modular kitchens and precise flat-pack assembly.'),
    ('pro.ac@fixkart.dev', 10, 4.9, 'AC technician offering installation, gas refills, deep cleaning and annual maintenance contracts for all brands.'),
    ('pro.painter@fixkart.dev', 9, 4.6, 'Painter for interior and exterior work, putty and primer coats, and premium texture finishes.'),
    ('pro.mechanic@fixkart.dev', 14, 4.8, 'Two-wheeler and car mechanic for regular servicing, engine repairs, brake work and roadside assistance.')
) as v(email, experience_years, rating, bio)
join auth.users u on u.email = v.email
where not exists (
  select 1
  from professionals p
  where p.user_id = u.id
);

-- 2c. Verify
select count(*) as professionals_after_seed from professionals;
