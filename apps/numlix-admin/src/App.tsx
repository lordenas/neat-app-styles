import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AdminGuard, AuthProvider } from "@numlix/admin-shared";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ADMIN_ROUTES, adminPages } from "./routes";

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <BrowserRouter>
              <AuthProvider>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/" element={<Navigate to={ADMIN_ROUTES.dashboard} replace />} />
                    <Route path={ADMIN_ROUTES.login} element={<adminPages.AdminLogin />} />
                    <Route path={ADMIN_ROUTES.forbidden} element={<adminPages.AdminForbidden />} />
                    <Route
                      path={ADMIN_ROUTES.dashboard}
                      element={
                        <AdminGuard fallback={<adminPages.AdminForbidden />}>
                          <adminPages.AdminDashboard />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path={ADMIN_ROUTES.cpa}
                      element={
                        <AdminGuard fallback={<adminPages.AdminForbidden />}>
                          <adminPages.AdminCpa />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path={ADMIN_ROUTES.users}
                      element={
                        <AdminGuard fallback={<adminPages.AdminForbidden />}>
                          <adminPages.AdminUsers />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path={ADMIN_ROUTES.userDetail}
                      element={
                        <AdminGuard fallback={<adminPages.AdminForbidden />}>
                          <adminPages.AdminUserDetail />
                        </AdminGuard>
                      }
                    />
                    <Route path="*" element={<Navigate to={ADMIN_ROUTES.dashboard} replace />} />
                  </Routes>
                </Suspense>
              </AuthProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
