import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getSession,
  setSession as persistSession,
  apiGet,
  type FixKartSession,
} from "./api";

export type UserRole = "customer" | "professional" | "admin" | null;

interface AuthContextValue {
  session: FixKartSession | null;
  user: any | null;
  isLoggedIn: boolean;
  /** Role from the profiles TABLE (fetched server-side), not JWT metadata. */
  role: UserRole;
  isAdmin: boolean;
  isProfessional: boolean;
  login: (session: FixKartSession) => void;
  logout: () => void;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<FixKartSession | null>(getSession);
  const [role, setRole] = useState<UserRole>(null);

  // Load the authoritative role from the database whenever we have a session.
  const refreshRole = async () => {
    if (!getSession()) {
      setRole(null);
      return;
    }
    try {
      const data = await apiGet<{ profile: { role?: UserRole } | null }>("/auth/me");
      setRole(data?.profile?.role || null);
    } catch {
      // Token expired or backend down - keep whatever role we had; the
      // backend still enforces authorization on every protected call.
    }
  };

  useEffect(() => {
    if (getSession()) refreshRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pick up logins performed in another tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "fixkart_session") {
        setSessionState(getSession());
        refreshRole();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user || null,
      isLoggedIn: Boolean(session?.access_token),
      role,
      isAdmin: role === "admin",
      isProfessional: role === "professional",
      login: (next) => {
        persistSession(next);
        setSessionState(next);
        refreshRole();
      },
      logout: () => {
        clearSession();
        setSessionState(null);
        setRole(null);
      },
      refreshRole,
    }),
    [session, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
