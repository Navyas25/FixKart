import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Node.js 20 doesn't have native WebSocket. Supabase realtime-js requires it.
// We need to polyfill BEFORE importing supabase, but since we can't control import
// order in ESM, we create a minimal WebSocket shim synchronously.
if (typeof globalThis.WebSocket === 'undefined') {
  // Minimal shim — just enough for Supabase's check to pass.
  // The backend doesn't use realtime, so no actual WS connection is needed.
  globalThis.WebSocket = class WebSocket {
    constructor() {
      // no-op — realtime is disabled on all clients
    }
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  };
  // Also set the CLOSED/CONNECTING constants that Supabase checks
  globalThis.WebSocket.CLOSED = 3;
  globalThis.WebSocket.CONNECTING = 0;
  globalThis.WebSocket.OPEN = 1;
  globalThis.WebSocket.CLOSING = 2;
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
