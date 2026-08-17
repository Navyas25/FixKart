import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Service-role client - SERVER-SIDE ONLY. This key is never exposed to the
// frontend. It is used for exactly one job: assigning roles and creating
// professional rows at registration, where RLS cannot (and should not) trust
// a client-supplied role. Every read/update the app performs still goes
// through the user's own JWT + RLS.
export const admin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export const hasAdmin = Boolean(admin);
