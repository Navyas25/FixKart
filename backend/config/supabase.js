import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Node.js 20 doesn't have native WebSocket. Supabase realtime-js requires it.
// Polyfill with the 'ws' package so the backend works on Node 20+.
if (typeof globalThis.WebSocket === 'undefined') {
  try {
    const ws = await import('ws');
    globalThis.WebSocket = ws.default || ws.WebSocket;
  } catch {
    // ws not installed — realtime features won't work, but queries are fine.
  }
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabase] SUPABASE_URL or SUPABASE_ANON_KEY is not set.');
}

// Backend doesn't need realtime — disable it to avoid unnecessary WebSocket connections
const realtimeOpts = { params: { eventsPerSecondLimit: 0 } };

// Anon client (subject to RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: realtimeOpts });

// Service-role client (bypasses RLS - for admin operations)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { realtime: realtimeOpts })
  : supabase;
