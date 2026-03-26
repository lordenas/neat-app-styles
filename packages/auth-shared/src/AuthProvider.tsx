import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  bootstrapSession,
  getMe,
  login,
  logout,
  refreshSession,
  register,
} from "./auth-client";
import { setAuthApiBaseUrl } from "./config";
import { clearAccessToken, getAccessToken } from "./token-store";
import type { AuthRole, AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  accessToken: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (allowed: readonly AuthRole[]) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, apiBaseUrl }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  useEffect(() => {
    if (apiBaseUrl) {
      setAuthApiBaseUrl(apiBaseUrl);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const session = await bootstrapSession();
      if (!mounted) {
        return;
      }
      setUser(session.user);
      setAccessTokenState(session.accessToken);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      accessToken,
      isAuthenticated: Boolean(user),
      signIn: async (email: string, password: string) => {
        try {
          const session = await login({ email, password });
          setUser(session.user);
          setAccessTokenState(session.accessToken);
          return { error: null };
        } catch (error) {
          return { error: error instanceof Error ? error : new Error("Login failed") };
        }
      },
      signUp: async (email: string, password: string, fullName?: string) => {
        try {
          const session = await register({ email, password, fullName });
          setUser(session.user);
          setAccessTokenState(session.accessToken);
          return { error: null };
        } catch (error) {
          return { error: error instanceof Error ? error : new Error("Registration failed") };
        }
      },
      signOut: async () => {
        await logout();
        setUser(null);
        clearAccessToken();
        setAccessTokenState(null);
      },
      refresh: async () => {
        const session = await refreshSession();
        setAccessTokenState(session.accessToken);
        const me = await getMe(session.accessToken);
        setUser(me);
      },
      hasRole: (allowed: readonly AuthRole[]) => {
        if (!user) {
          return false;
        }
        if (allowed.length === 0) {
          return true;
        }
        return allowed.includes(user.role);
      },
    }),
    [accessToken, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

export function getCurrentAccessToken(): string | null {
  return getAccessToken();
}
