import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PANEL_ROUTES, panelPages } from "./routes";

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
                    <Route path="/" element={<Navigate to={PANEL_ROUTES.auth} replace />} />
                    <Route path={PANEL_ROUTES.auth} element={<panelPages.Auth />} />
                    <Route
                      path={PANEL_ROUTES.dashboard}
                      element={
                        <ProtectedRoute>
                          <panelPages.Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.calcList}
                      element={
                        <ProtectedRoute>
                          <panelPages.CalcList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.calcBuilder}
                      element={
                        <ProtectedRoute>
                          <panelPages.CalcBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.calcBuilderEdit}
                      element={
                        <ProtectedRoute>
                          <panelPages.CalcBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route path={PANEL_ROUTES.calcPlayer} element={<panelPages.CalcPlayer />} />
                    <Route
                      path={PANEL_ROUTES.embedBuilder}
                      element={
                        <ProtectedRoute>
                          <panelPages.EmbedBuilder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.embedWidgets}
                      element={
                        <ProtectedRoute>
                          <panelPages.EmbedWidgets />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.apiKeys}
                      element={
                        <ProtectedRoute>
                          <panelPages.ApiKeys />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.help}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpIndex />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.helpGettingStarted}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpGettingStarted />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.helpFormula}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpFormula />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.helpFields}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpFields />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.helpPages}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpPages />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.helpLogic}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpLogic />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={PANEL_ROUTES.helpExamples}
                      element={
                        <ProtectedRoute>
                          <panelPages.HelpExamples />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<panelPages.NotFound />} />
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
