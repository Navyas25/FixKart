-- ============================================================================
-- FixKart - 001: Professional verification & role-based access
--
-- Run this in Supabase Dashboard -> SQL Editor. Safe to re-run (idempotent).
--
-- Adds:
--   1. Professional profile columns (verification status, categories, areas,
--      availability, uploaded document)
--   2. The "professional-docs" storage bucket for ID/document uploads
--   3. RLS policies so:
--        - professionals can read/update ONLY their own professional row
--        - admins can set verification_status on any professional
--        - professionals can read/update ONLY the bookings sent to them
--        - users can update their own profile row
--        - documents: public read, authenticated users upload into their own
--          folder under professional-docs
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. professionals table columns
-- ---------------------------------------------------------------------------

alter table public.professionals
  add column if not exists verification_status text not null default 'pending',
  add column if not exists service_categories text[] not null default '{}',
  add column if not exists service_locations text[] not null default '{}',
  add column if not exists availability text not null default 'Mon-Sat, 9:00 AM - 6:00 PM',
  add column if not exists id_document_url text;

-- Optional but recommended: keep verification_status values sane.
alter table public.professionals
  drop constraint if exists professionals_verification_status_check;

alter table public.professionals
  add constraint professionals_verification_status_check
  check (verification_status in ('pending', 'verified', 'rejected', 'suspended'));

-- ---------------------------------------------------------------------------
-- 2. Storage bucket for verification documents
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('professional-docs', 'professional-docs', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. RLS policies
-- ---------------------------------------------------------------------------

-- 3a. professionals: everyone can read (catalog), owners can update their own
--     row, admins can update any row (verification/suspension).

drop policy if exists "public_read_professionals" on public.professionals;
create policy "public_read_professionals"
  on public.professionals for select
  using (true);

drop policy if exists "owner_update_professional" on public.professionals;
create policy "owner_update_professional"
  on public.professionals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "admin_update_professional" on public.professionals;
create policy "admin_update_professional"
  on public.professionals for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 3b. professionals can insert their own row (registration fallback when
--     the service-role key is not configured), but NEVER with a verified
--     status - only "pending" can be self-inserted. Verification is granted
--     by an admin (or the server-side service-role client).

drop policy if exists "owner_insert_professional" on public.professionals;
create policy "owner_insert_professional"
  on public.professionals for insert
  with check (auth.uid() = user_id and verification_status = 'pending');

-- 3b2. profiles: a user may insert their own profile row, but only as a
--      CUSTOMER. No role other than 'customer' can ever be self-inserted -
--      professional/admin roles come from the service-role client at
--      registration or from the SQL editor.

drop policy if exists "owner_insert_profile" on public.profiles;
create policy "owner_insert_profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'customer');

-- 3c. profiles: users may update their own row (name, phone, avatar).
--     Role changes are NOT allowed here - see the trigger below.

drop policy if exists "owner_update_profile" on public.profiles;
create policy "owner_update_profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3d. bookings: a professional can read and update the bookings made with
--     them (accept/reject, set status), and can never touch other bookings.

drop policy if exists "professional_read_received_bookings" on public.bookings;
create policy "professional_read_received_bookings"
  on public.bookings for select
  using (
    professional_id in (
      select id from public.professionals
      where user_id = auth.uid()
    )
  );

drop policy if exists "professional_update_received_bookings" on public.bookings;
create policy "professional_update_received_bookings"
  on public.bookings for update
  using (
    professional_id in (
      select id from public.professionals
      where user_id = auth.uid()
    )
  )
  with check (
    professional_id in (
      select id from public.professionals
      where user_id = auth.uid()
    )
  );

-- 3e. storage: anyone can read uploaded docs (public bucket); authenticated
--     users may upload/update only inside their own user-id folder.

drop policy if exists "public_read_professional_docs" on storage.objects;
create policy "public_read_professional_docs"
  on storage.objects for select
  using (bucket_id = 'professional-docs');

drop policy if exists "owner_upload_professional_docs" on storage.objects;
create policy "owner_upload_professional_docs"
  on storage.objects for insert
  with check (
    bucket_id = 'professional-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "owner_update_professional_docs" on storage.objects;
create policy "owner_update_professional_docs"
  on storage.objects for update
  using (
    bucket_id = 'professional-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 4. Hard guarantee: a user can NEVER change their own role.
-- ---------------------------------------------------------------------------
-- This blocks role escalation even through a direct SQL update (an admin or
-- a trigger is the only path that can change it, since admins bypass RLS).

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Role changes are allowed ONLY from privileged contexts:
  --   - the SQL editor / database admin (session_user = postgres)
  --   - the server-side service_role client (used by the backend to assign
  --     roles at registration - session_user = service_role)
  -- Everyone else - the API as anon/authenticated users - is blocked.
  if new.role is distinct from old.role
     and session_user not in ('postgres', 'supabase_admin', 'service_role') then
    raise exception 'Role changes are not allowed on profiles';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_role_change on public.profiles;
create trigger prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_change();

-- ---------------------------------------------------------------------------
-- 5. Exactly FOUR admin accounts - database-level enforcement
-- ---------------------------------------------------------------------------
-- A profile can hold role='admin' ONLY when its email is one of the four
-- authorized accounts below. This protects against SQL-editor mistakes and
-- anyone setting role='admin' through any channel. Keep this list in sync
-- with backend/config/admins.js.

create or replace function public.prevent_unauthorized_admin()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role = 'admin'
     and lower(new.email) not in (
       'admin@fixkart.dev',
       'ops@fixkart.dev',
       'support@fixkart.dev',
       'finance@fixkart.dev'
     ) then
    raise exception 'Email is not authorized to be an admin';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_admin on public.profiles;
create trigger prevent_unauthorized_admin
  before insert or update on public.profiles
  for each row
  execute function public.prevent_unauthorized_admin();

-- Promote the four admins (safe to re-run; matches the allowlist above).
-- Run only after the four accounts exist (register them as customers first,
-- or create them in Authentication -> Users).
update public.profiles
set role = 'admin'
where lower(email) in (
  'admin@fixkart.dev',
  'ops@fixkart.dev',
  'support@fixkart.dev',
  'finance@fixkart.dev'
);

-- Any other email that already had role='admin' is demoted to 'customer'.
update public.profiles
set role = 'customer'
where role = 'admin'
  and lower(email) not in (
    'admin@fixkart.dev',
    'ops@fixkart.dev',
    'support@fixkart.dev',
    'finance@fixkart.dev'
  );

-- Verify: should show exactly 4 rows.
select email, role from public.profiles where role = 'admin' order by email;
