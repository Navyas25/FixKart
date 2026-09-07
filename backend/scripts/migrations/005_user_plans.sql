-- ============================================================================
-- FixKart - 005: User Plans (Normal vs Premium)
--
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Normal users: simplified view, auto-assigned professionals by location
-- Premium users: full website, choose any professional manually
-- ============================================================================

-- 1. Add plan column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'normal';

-- Restrict plan values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('normal', 'premium'));

-- 2. Make bhushanavya2@gmail.com a premium user
UPDATE public.profiles
SET plan = 'premium'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'bhushanavya2@gmail.com'
);
