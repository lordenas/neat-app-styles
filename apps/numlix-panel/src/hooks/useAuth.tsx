import {
  AuthProvider as SharedAuthProvider,
  useAuth as useSharedAuth,
} from "@numlix/auth-shared";
import type { ReactNode } from "react";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SharedAuthProvider>{children}</SharedAuthProvider>;
}

export function useAuth(): AuthContextType {
  const auth = useSharedAuth();
  return {
    user: auth.user
      ? {
          id: auth.user.id,
          email: auth.user.email,
          user_metadata: auth.user.fullName ? { display_name: auth.user.fullName } : {},
        }
      : null,
    session: auth.accessToken ? { access_token: auth.accessToken } : null,
    loading: auth.loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
  };
}
