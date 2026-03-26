import { Navigate } from "react-router-dom";
import { getDomainRoutes } from "@numlix/auth-shared";
import { Button, Skeleton } from "@numlix/ui-kit";
import { useAuth } from "../../hooks/useAuth";
import type { AdminRole } from "../../types/admin";

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
  unauthorizedPath?: string;
  fallback?: React.ReactNode;
}

export function AdminGuard({
  children,
  allowedRoles = ["admin", "super_admin"],
  unauthorizedPath = "/admin/login",
  fallback,
}: AdminGuardProps) {
  const { user, loading, hasRole } = useAuth();
  const domainRoutes = getDomainRoutes();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  if (!hasRole(allowedRoles)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border bg-card p-6 text-center space-y-3">
          <h1 className="text-lg font-semibold text-foreground">Доступ ограничен</h1>
          <p className="text-sm text-muted-foreground">
            У вашей учетной записи нет прав для доступа к этому разделу.
          </p>
          <Button variant="outline" onClick={() => window.location.assign(domainRoutes.mainHome)}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
