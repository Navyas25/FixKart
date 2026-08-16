import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getSession,
  setSession as persistSession,
  type FixKartSession,
} from "./api";

interface AuthContextValue {
  session: FixKartSession | null;
  user: any | null;
  isLoggedIn: boolean;
  login: (session: FixKartSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<FixKartSession | null>(getSession);

  // Pick up logins performed on the classic site in another tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "fixkart_session") {
        setSessionState(getSession());
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
      login: (next) => {
        persistSession(next);
        setSessionState(next);
      },
      logout: () => {
        clearSession();
        setSessionState(null);
      },
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
