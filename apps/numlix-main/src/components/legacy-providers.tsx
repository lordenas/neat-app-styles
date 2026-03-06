"use client";

import type { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";

interface LegacyProvidersProps {
  children: ReactNode;
}

export function LegacyProviders({ children }: LegacyProvidersProps) {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>{children as never}</AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
