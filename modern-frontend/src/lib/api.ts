// Typed client for the FixKart backend (Express + Supabase).
//
// In development, `/api` is proxied to http://localhost:5000 by the Vite dev
// server (see vite.config.ts). Set VITE_API_BASE_URL to point elsewhere.
//
// The session is stored under the same key the classic site uses
// ("fixkart_session"), so a login on either site carries over to the other.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const SESSION_KEY = "fixkart_session";

/* ─── Session ─────────────────────────────────────────────────────────────── */

export interface FixKartSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: any;
}

export const getSession = (): FixKartSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (session: FixKartSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getToken = () => getSession()?.access_token || null;

export const isLoggedIn = () => Boolean(getToken());

/* ─── Request core ────────────────────────────────────────────────────────── */

async function request<T = any>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { ...headers, "Content-Type": "application/json" } : headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the FixKart backend running on port 5000?");
  }

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // No JSON body.
  }

  if (!response.ok) {
    const message =
      json?.error?.message || json?.message || `API request failed (${response.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  // Unwrap the { success, data } envelope used by the backend.
  if (json && typeof json === "object" && json.success === true && "data" in json) {
    return json.data as T;
  }

  return json as T;
}

export const apiGet = <T = any>(path: string) => request<T>(path);
export const apiPost = <T = any>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body });
export const apiPatch = <T = any>(path: string, body?: unknown) =>
  request<T>(path, { method: "PATCH", body });
export const apiDelete = <T = any>(path: string) => request<T>(path, { method: "DELETE" });
