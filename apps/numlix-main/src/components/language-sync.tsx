"use client";

import { useEffect } from "react";
import i18n from "@/i18n";

interface LanguageSyncProps {
  lang: string;
}

export function LanguageSync({ lang }: LanguageSyncProps) {
  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang]);

  return null;
}
