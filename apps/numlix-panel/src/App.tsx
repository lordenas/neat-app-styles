import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
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
                    <Route path={PANEL_ROUTES.dashboard} element={<panelPages.Dashboard />} />
                    <Route path={PANEL_ROUTES.calcList} element={<panelPages.CalcList />} />
                    <Route path={PANEL_ROUTES.calcBuilder} element={<panelPages.CalcBuilder />} />
                    <Route path={PANEL_ROUTES.calcBuilderEdit} element={<panelPages.CalcBuilder />} />
                    <Route path={PANEL_ROUTES.calcPlayer} element={<panelPages.CalcPlayer />} />
                    <Route path={PANEL_ROUTES.embedBuilder} element={<panelPages.EmbedBuilder />} />
                    <Route path={PANEL_ROUTES.embedWidgets} element={<panelPages.EmbedWidgets />} />
                    <Route path={PANEL_ROUTES.apiKeys} element={<panelPages.ApiKeys />} />
                    <Route path={PANEL_ROUTES.help} element={<panelPages.HelpIndex />} />
                    <Route path={PANEL_ROUTES.helpGettingStarted} element={<panelPages.HelpGettingStarted />} />
                    <Route path={PANEL_ROUTES.helpFormula} element={<panelPages.HelpFormula />} />
                    <Route path={PANEL_ROUTES.helpFields} element={<panelPages.HelpFields />} />
                    <Route path={PANEL_ROUTES.helpPages} element={<panelPages.HelpPages />} />
                    <Route path={PANEL_ROUTES.helpLogic} element={<panelPages.HelpLogic />} />
                    <Route path={PANEL_ROUTES.helpExamples} element={<panelPages.HelpExamples />} />
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
