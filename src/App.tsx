import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import "@/i18n";

const Index = lazy(() => import("./pages/Index"));
const CreditCalculator = lazy(() => import("./pages/CreditCalculator"));
const Showcase = lazy(() => import("./pages/Showcase"));
const NotFound = lazy(() => import("./pages/NotFound"));



function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/credit-calculator" element={<CreditCalculator />} />
                  <Route path="/showcase" element={<Showcase />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
