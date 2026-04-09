import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PANEL_ROUTES } from "@/routes";

interface ProtectedRouteProps {
  children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${PANEL_ROUTES.auth}?redirect=${redirect}`} replace />;
  }

  return children;
}
