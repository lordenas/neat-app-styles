import {
  AuthProvider as SharedAuthProvider,
  useAuth as useSharedAuth,
} from "@numlix/auth-shared";
import type { ReactNode } from "react";
import type { AdminRole } from "../types/admin";

interface AuthContextType {
  user: { id: string; email: string } | null;
  session: { access_token?: string } | null;
  loading: boolean;
  roles: AdminRole[];
  hasRole: (allowed: AdminRole[]) => boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SharedAuthProvider>{children}</SharedAuthProvider>;
}

export function useAuth(): AuthContextType {
  const auth = useSharedAuth();
  const userRoleUpper = auth.user?.role?.toUpperCase();
  const roles: AdminRole[] =
    userRoleUpper === "ADMIN" ? ["admin"] : [];
  return {
    user: auth.user ? { id: auth.user.id, email: auth.user.email } : null,
    session: auth.accessToken ? { access_token: auth.accessToken } : null,
    loading: auth.loading,
    roles,
    hasRole: (allowed: AdminRole[]) => {
      if (allowed.length === 0) {
        return true;
      }
      return roles.some((role) => allowed.includes(role));
    },
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
  };
}
