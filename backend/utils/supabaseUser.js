import { createClient } from '@supabase/supabase-js';

/**
 * Builds a Supabase client using the authenticated user's JWT
 * (stored on req.accessToken by the `authenticate` middleware).
 *
 * RLS policies keyed on auth.uid() then apply to every query,
 * so user data can never leak across accounts.
 */
export const getUserSupabase = (req) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      },
    }
  );
};
