"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@numlix/auth-shared";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LegacyProvidersProps {
  children: ReactNode;
}

const authApiBase =
  typeof process.env.NEXT_PUBLIC_API_URL === "string" && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined;

export function LegacyProviders({ children }: LegacyProvidersProps) {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <AuthProvider apiBaseUrl={authApiBase}>{children as never}</AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
