import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getSession,
  setSession as persistSession,
  apiGet,
  type FixKartSession,
} from "./api";

export type UserRole = "customer" | "professional" | "vendor" | "admin" | null;
export type UserPlan = "normal" | "premium";

interface AuthContextValue {
  session: FixKartSession | null;
  user: any | null;
  isLoggedIn: boolean;
  /** Role from the profiles TABLE (fetched server-side), not JWT metadata. */
  role: UserRole;
  /** Plan from profiles TABLE: 'normal' or 'premium'. */
  plan: UserPlan;
  isAdmin: boolean;
  isProfessional: boolean;
  isVendor: boolean;
  isPremium: boolean;
  login: (session: FixKartSession) => void;
  logout: () => void;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<FixKartSession | null>(getSession);
  const [role, setRole] = useState<UserRole>(null);
  const [plan, setPlan] = useState<UserPlan>("normal");

  // Load the authoritative role from the database whenever we have a session.
  const refreshRole = async () => {
    if (!getSession()) {
      setRole(null);
      setPlan("normal");
      return;
    }
    try {
      const data = await apiGet<{ profile: { role?: UserRole; plan?: UserPlan } | null }>("/auth/me");
      setRole(data?.profile?.role || null);
      setPlan(data?.profile?.plan || "normal");
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
      plan,
      isAdmin: role === "admin",
      isProfessional: role === "professional",
      isVendor: role === "vendor",
      isPremium: plan === "premium",
      login: (next) => {
        persistSession(next);
        setSessionState(next);
        refreshRole();
      },
      logout: () => {
        clearSession();
        setSessionState(null);
        setRole(null);
        setPlan("normal");
      },
      refreshRole,
    }),
    [session, role, plan]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
