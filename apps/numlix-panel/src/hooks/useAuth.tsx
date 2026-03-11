import { createContext, useContext, useMemo, ReactNode } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearTokens } from "@/store/slices/authSlice";
import { decodeJwtPayload } from "@/lib/jwt";

/** Minimal user shape for compatibility with existing consumers (Dashboard, etc.) */
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: { display_name?: string };
}

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token?: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokens = useAppSelector((s) => s.auth.tokens);
  const dispatch = useAppDispatch();

  const value = useMemo(() => {
    const loading = false;
    let user: AuthUser | null = null;
    let session: { access_token?: string } | null = null;
    if (tokens?.accessToken) {
      session = { access_token: tokens.accessToken };
      const payload = decodeJwtPayload(tokens.accessToken);
      if (payload) {
        user = {
          id: payload.sub ?? "user",
          email: payload.email,
          user_metadata: {},
        };
      } else {
        user = { id: "user", user_metadata: {} };
      }
    }
    return {
      user,
      session,
      loading,
      signUp: async () => ({ error: null }),
      signIn: async () => ({ error: null }),
      signOut: async () => {
        dispatch(clearTokens());
      },
    };
  }, [tokens, dispatch]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
