-- ============================================================================
-- FixKart sample data
--
-- Run this in the Supabase dashboard -> SQL Editor (it runs as the postgres
-- role, so it bypasses Row Level Security - no service key needed).
-- Safe to re-run: only missing rows are inserted.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Categories
-- ---------------------------------------------------------------------------
insert into categories (name)
select name
from (values
  ('Tools & Equipment'),
  ('Hand Tools'),
  ('Electrical'),
  ('Plumbing'),
  ('Paint & Decor'),
  ('Automotive'),
  ('Hardware & Fasteners'),
  ('Safety & Protection')
) as t(name)
where not exists (select 1 from categories c where c.name = t.name);

-- ---------------------------------------------------------------------------
-- 2. Products
-- ---------------------------------------------------------------------------
insert into products (name, description, price, stock, unit, brand, image_url, category_id)
select v.name, v.description, v.price, v.stock, v.unit, v.brand, v.image_url, c.id
from (values
  ('Bosch 10mm Impact Drill', '600W impact drill for masonry, wood and metal. Variable speed, keyless chuck, carry case included.', 2999, 24, 'pc', 'Bosch', 'https://picsum.photos/seed/fixkart-drill/600/400', 'Tools & Equipment'),
  ('Black & Decker Cordless Screwdriver', '3.6V cordless screwdriver with USB charging and a 32-piece bit set.', 1999, 30, 'pc', 'Black & Decker', 'https://picsum.photos/seed/fixkart-screwdriver/600/400', 'Tools & Equipment'),
  ('Stanley 5m Measuring Tape', 'Heavy-duty 5 metre tape measure with locking mechanism and durable ABS case.', 249, 80, 'pc', 'Stanley', 'https://picsum.photos/seed/fixkart-tape/600/400', 'Hand Tools'),
  ('Steel Claw Hammer 500g', 'Drop-forged steel claw hammer with cushioned grip for carpentry and repairs.', 349, 60, 'pc', 'FixKart Pro', 'https://picsum.photos/seed/fixkart-hammer/600/400', 'Hand Tools'),
  ('Havells 16A Switch Socket', 'Modular 16A switch socket with child-safe shutters for heavy appliances.', 189, 120, 'pc', 'Havells', 'https://picsum.photos/seed/fixkart-socket/600/400', 'Electrical'),
  ('Polycab 2.5 sq mm Wire (90m)', 'ISI-marked FR house wire, 2.5 sq mm, 90 metre coil, low smoke insulation.', 1799, 40, 'coil', 'Polycab', 'https://picsum.photos/seed/fixkart-wire/600/400', 'Electrical'),
  ('Philips LED Bulb 9W', '9W B22 LED bulb, 806 lumens, warm white, 15,000 hour life.', 99, 200, 'pc', 'Philips', 'https://picsum.photos/seed/fixkart-bulb/600/400', 'Electrical'),
  ('Finolex 1-inch PVC Pipe (3m)', 'Rigid PVC plumbing pipe, 1 inch diameter, 3 metre length.', 420, 55, 'pc', 'Finolex', 'https://picsum.photos/seed/fixkart-pipe/600/400', 'Plumbing'),
  ('Jaquar Basin Mixer Tap', 'Chrome-finished single-lever basin mixer with ceramic cartridge.', 2499, 35, 'pc', 'Jaquar', 'https://picsum.photos/seed/fixkart-tap/600/400', 'Plumbing'),
  ('Asian Paints Ace Exterior Emulsion (20L)', 'Weather-resistant exterior emulsion, 20 litre bucket with UV protection.', 5499, 18, 'bucket', 'Asian Paints', 'https://picsum.photos/seed/fixkart-paint/600/400', 'Paint & Decor'),
  ('Castrol Engine Oil 5W-30 (3L)', 'Fully synthetic engine oil for petrol and diesel cars.', 1299, 45, 'L', 'Castrol', 'https://picsum.photos/seed/fixkart-oil/600/400', 'Automotive'),
  ('MRF Tyre Inflator with Gauge', 'Heavy-duty foot pump with analogue gauge for cars, bikes and bicycles.', 599, 70, 'pc', 'MRF', 'https://picsum.photos/seed/fixkart-pump/600/400', 'Automotive'),
  ('Steel Hex Bolt Set (50 pc)', 'Assorted zinc-plated hex bolts, nuts and washers in a storage box.', 199, 90, 'set', 'FixKart Pro', 'https://picsum.photos/seed/fixkart-bolts/600/400', 'Hardware & Fasteners'),
  ('3M Safety Goggles', 'Anti-fog polycarbonate goggles with UV protection for workshop use.', 349, 65, 'pc', '3M', 'https://picsum.photos/seed/fixkart-goggles/600/400', 'Safety & Protection')
) as v(name, description, price, stock, unit, brand, image_url, category_name)
join categories c on c.name = v.category_name
where not exists (select 1 from products p where p.name = v.name);

-- ---------------------------------------------------------------------------
-- 3. Services
-- ---------------------------------------------------------------------------
insert into services (name, category, description, base_price, image_url)
select v.name, v.category, v.description, v.base_price, v.image_url
from (values
  ('Plumbing Repair & Installation', 'Plumbing', 'Leak repairs, tap and basin installation, pipe fitting and bathroom fittings by certified plumbers.', 299, 'https://picsum.photos/seed/fixkart-svc-plumbing/600/400'),
  ('Electrical Wiring & Fixes', 'Electrical', 'Switchboard upgrades, wiring, circuit checks and appliance points by licensed electricians.', 349, 'https://picsum.photos/seed/fixkart-svc-electric/600/400'),
  ('Carpentry & Furniture Assembly', 'Carpentry', 'Custom furniture, door fitting, modular kitchen installation and flat-pack assembly.', 399, 'https://picsum.photos/seed/fixkart-svc-carpentry/600/400'),
  ('AC Service & Repair', 'HVAC', 'AC installation, gas refill, deep cleaning and annual maintenance contracts.', 499, 'https://picsum.photos/seed/fixkart-svc-ac/600/400'),
  ('Painting & Wall Finishing', 'Painting', 'Interior and exterior painting, putty work and premium texture finishes.', 299, 'https://picsum.photos/seed/fixkart-svc-paint/600/400'),
  ('Car & Bike Mechanic', 'Automotive', 'Servicing, engine repairs, brake work and roadside assistance for cars and two-wheelers.', 449, 'https://picsum.photos/seed/fixkart-svc-mechanic/600/400'),
  ('Home Appliance Repair', 'Appliances', 'Repair and servicing of washing machines, refrigerators, ovens and water heaters at home.', 349, 'https://picsum.photos/seed/fixkart-svc-appliance/600/400'),
  ('Home Deep Cleaning', 'Cleaning', 'Full-home deep cleaning with professional equipment and eco-friendly products.', 249, 'https://picsum.photos/seed/fixkart-svc-cleaning/600/400')
) as v(name, category, description, base_price, image_url)
where not exists (select 1 from services s where s.name = v.name);

-- ---------------------------------------------------------------------------
-- 4. Professionals
--
-- Each professional needs an auth user (professionals.user_id -> profiles.id
-- -> auth.users.id) so the app can render their name, avatar and phone, and so
-- bookings link to a real account. Passwords below are for local/dev use only.
-- ---------------------------------------------------------------------------

-- 4a. Auth users
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
select
  '00000000-0000-0000-0000-000000000000',
  v.id, 'authenticated', 'authenticated', v.email,
  crypt('FixkartSeed123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('full_name', v.full_name),
  now(), now(), ''
from (values
  ('a0000000-0000-4000-8000-000000000001', 'pro.plumber@fixkart.dev', 'Rajesh Kumar'),
  ('a0000000-0000-4000-8000-000000000002', 'pro.electrician@fixkart.dev', 'Suresh Reddy'),
  ('a0000000-0000-4000-8000-000000000003', 'pro.carpenter@fixkart.dev', 'Amit Verma'),
  ('a0000000-0000-4000-8000-000000000004', 'pro.ac@fixkart.dev', 'Deepak Sharma'),
  ('a0000000-0000-4000-8000-000000000005', 'pro.painter@fixkart.dev', 'Vikram Singh'),
  ('a0000000-0000-4000-8000-000000000006', 'pro.mechanic@fixkart.dev', 'Mohan Das')
) as v(id, email, full_name)
where not exists (select 1 from auth.users u where u.email = v.email);

-- 4b. Identity rows (lets the seeded users sign in with email + password)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(), v.id, gen_random_uuid(),
  jsonb_build_object('sub', v.id, 'email', v.email, 'email_verified', true, 'phone_verified', false),
  'email', now(), now(), now()
from (values
  ('a0000000-0000-4000-8000-000000000001', 'pro.plumber@fixkart.dev'),
  ('a0000000-0000-4000-8000-000000000002', 'pro.electrician@fixkart.dev'),
  ('a0000000-0000-4000-8000-000000000003', 'pro.carpenter@fixkart.dev'),
  ('a0000000-0000-4000-8000-000000000004', 'pro.ac@fixkart.dev'),
  ('a0000000-0000-4000-8000-000000000005', 'pro.painter@fixkart.dev'),
  ('a0000000-0000-4000-8000-000000000006', 'pro.mechanic@fixkart.dev')
) as v(id, email)
where not exists (
  select 1 from auth.identities i
  where i.user_id = v.id and i.provider = 'email'
);

-- 4c. Profile rows (upsert - a signup trigger may already have created them)
insert into profiles (id, full_name, avatar_url, phone, role)
values
  ('a0000000-0000-4000-8000-000000000001', 'Rajesh Kumar', 'https://picsum.photos/seed/fixkart-rajesh/200/200', '+91 98765 40001', 'professional'),
  ('a0000000-0000-4000-8000-000000000002', 'Suresh Reddy', 'https://picsum.photos/seed/fixkart-suresh/200/200', '+91 98765 40002', 'professional'),
  ('a0000000-0000-4000-8000-000000000003', 'Amit Verma', 'https://picsum.photos/seed/fixkart-amit/200/200', '+91 98765 40003', 'professional'),
  ('a0000000-0000-4000-8000-000000000004', 'Deepak Sharma', 'https://picsum.photos/seed/fixkart-deepak/200/200', '+91 98765 40004', 'professional'),
  ('a0000000-0000-4000-8000-000000000005', 'Vikram Singh', 'https://picsum.photos/seed/fixkart-vikram/200/200', '+91 98765 40005', 'professional'),
  ('a0000000-0000-4000-8000-000000000006', 'Mohan Das', 'https://picsum.photos/seed/fixkart-mohan/200/200', '+91 98765 40006', 'professional')
on conflict (id) do update
  set full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      phone = excluded.phone,
      role = excluded.role;

-- 4d. Professional rows
insert into professionals (user_id, experience_years, rating, bio)
select v.id, v.experience_years, v.rating, v.bio
from (values
  ('a0000000-0000-4000-8000-000000000001', 12, 4.9, 'Certified plumber specialising in bathroom fittings, leak repairs, pipe installation and water heater setup across the city.'),
  ('a0000000-0000-4000-8000-000000000002', 8, 4.8, 'Licensed electrician for house wiring, switchboard upgrades, appliance circuits and safety inspections.'),
  ('a0000000-0000-4000-8000-000000000003', 15, 4.7, 'Carpenter for custom furniture, door fitting, modular kitchens and precise flat-pack assembly.'),
  ('a0000000-0000-4000-8000-000000000004', 10, 4.9, 'AC technician offering installation, gas refills, deep cleaning and annual maintenance contracts for all brands.'),
  ('a0000000-0000-4000-8000-000000000005', 9, 4.6, 'Painter for interior and exterior work, putty and primer coats, and premium texture finishes.'),
  ('a0000000-0000-4000-8000-000000000006', 14, 4.8, 'Two-wheeler and car mechanic for regular servicing, engine repairs, brake work and roadside assistance.')
) as v(id, experience_years, rating, bio)
where not exists (select 1 from professionals p where p.user_id = v.id);

-- ---------------------------------------------------------------------------
-- 5. Summary
-- ---------------------------------------------------------------------------
select 'categories' as table_name, count(*) as rows_after_seed from categories
union all select 'products', count(*) from products
union all select 'services', count(*) from services
union all select 'professionals', count(*) from professionals;
