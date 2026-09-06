import dotenv from "dotenv";

dotenv.config();

// WebSocket Polyfill for Node.js < 22
// Supabase realtime-js requires native WebSocket (Node 22+).
// The backend doesn't use realtime, but createClient() initializes the
// RealtimeClient constructor which checks for it. This polyfill MUST
// run before any @supabase/supabase-js import.
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class WebSocket {
    constructor() {}
    close() {}
    send() {}
    addEventListener() {}
    removeEventListener() {}
  };
  globalThis.WebSocket.CLOSED = 3;
  globalThis.WebSocket.CONNECTING = 0;
  globalThis.WebSocket.OPEN = 1;
  globalThis.WebSocket.CLOSING = 2;
}
