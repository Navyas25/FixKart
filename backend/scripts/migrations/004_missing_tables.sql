-- =====================================================
-- FixKart Migration 004: Create missing tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL DEFAULT '',
  shop_description TEXT DEFAULT '',
  shop_location TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  rating NUMERIC DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  category TEXT DEFAULT '',
  gst_number TEXT DEFAULT '',
  business_address TEXT DEFAULT '',
  business_phone TEXT DEFAULT '',
  business_hours TEXT DEFAULT '',
  bank_account_number TEXT DEFAULT '',
  bank_ifsc TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  upi_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Public can read verified vendors
DROP POLICY IF EXISTS "public_read_verified_vendors" ON public.vendors;
CREATE POLICY "public_read_verified_vendors"
  ON public.vendors FOR SELECT
  USING (verification_status = 'verified');

-- Vendors can read their own row
DROP POLICY IF EXISTS "vendor_read_own" ON public.vendors;
CREATE POLICY "vendor_read_own"
  ON public.vendors FOR SELECT
  USING (auth.uid() = user_id);

-- Admin full access via service role (no RLS needed)


-- 2. PROFESSIONAL VERIFICATION COLUMNS
-- Add columns that may be missing from the professionals table
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS service_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_locations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'Mon-Sat, 9:00 AM - 6:00 PM',
  ADD COLUMN IF NOT EXISTS id_document_url TEXT,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT true;


-- 3. CHAT SESSIONS (for live support)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT DEFAULT 'Guest',
  agent_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_sessions" ON public.chat_sessions;
CREATE POLICY "users_read_own_sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id OR agent_id = auth.uid());

DROP POLICY IF EXISTS "users_create_own_session" ON public.chat_sessions;
CREATE POLICY "users_create_own_session"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);


-- 4. CHAT MESSAGES (for live support)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_role TEXT NOT NULL DEFAULT 'customer'
    CHECK (sender_role IN ('customer', 'agent', 'bot')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_participants_read_messages" ON public.chat_messages;
CREATE POLICY "session_participants_read_messages"
  ON public.chat_messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "anyone_insert_message" ON public.chat_messages;
CREATE POLICY "anyone_insert_message"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);


-- 5. OFFERS TABLE (for vendor discounts/coupons)
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_type TEXT NOT NULL DEFAULT 'percentage'
    CHECK (discount_type IN ('percentage', 'flat', 'bogo', 'bulk')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  coupon_code TEXT,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  product_ids UUID[] DEFAULT '{}',
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendors_manage_own_offers" ON public.offers;
CREATE POLICY "vendors_manage_own_offers"
  ON public.offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = offers.vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "public_read_active_offers" ON public.offers;
CREATE POLICY "public_read_active_offers"
  ON public.offers FOR SELECT
  USING (is_active = true);


-- 6. NOTIFICATIONS TABLE (for all user types)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info'
    CHECK (type IN ('info', 'warning', 'success', 'error')),
  category TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_notifications" ON public.notifications;
CREATE POLICY "users_read_own_notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;
CREATE POLICY "system_insert_notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);


-- 7. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_verification ON public.vendors(verification_status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_vendor ON public.offers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_professionals_verification ON public.professionals(verification_status);
