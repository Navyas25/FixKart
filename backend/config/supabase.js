import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabase] SUPABASE_URL or SUPABASE_ANON_KEY is not set.');
}

// Anon client (subject to RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Service-role client (bypasses RLS - for admin operations)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : supabase;
