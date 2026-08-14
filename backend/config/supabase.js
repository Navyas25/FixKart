import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly at startup rather than mysteriously later.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] SUPABASE_URL or SUPABASE_ANON_KEY is not set. ' +
      'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

// Single shared Supabase client used across controllers.
// Never hardcode credentials here - they always come from environment variables.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
