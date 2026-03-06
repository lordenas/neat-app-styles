import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LanguageSync } from "@/components/language-sync";
import { LegacyProviders } from "@/components/legacy-providers";
import { isSupportedCountry, isSupportedLanguage } from "@/lib/i18n-config";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string; country: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lang, country } = await params;

  if (!isSupportedLanguage(lang) || !isSupportedCountry(country)) {
    notFound();
  }

  return (
    <LegacyProviders>
      <LanguageSync lang={lang} />
      {children}
    </LegacyProviders>
  );
}
