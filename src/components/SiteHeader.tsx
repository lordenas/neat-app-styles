import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Globe, ChevronDown, Calculator, BookOpen, Info, Mail, User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";

const languages = ["en", "ru", "fr", "de", "ar", "pes", "pl", "uk", "es", "pt", "nl", "sv"] as const;
const countries = [
  "global", "ru", "us", "uk", "de", "fr", "iran", "pl", "ua", "es",
  "kz", "br", "in", "by", "uz", "eg", "ae", "sa", "qa", "nl", "se",
] as const;

const countryFlags: Record<string, string> = {
  global: "🌍", ru: "🇷🇺", us: "🇺🇸", uk: "🇬🇧", de: "🇩🇪", fr: "🇫🇷",
  iran: "🇮🇷", pl: "🇵🇱", ua: "🇺🇦", es: "🇪🇸", kz: "🇰🇿", br: "🇧🇷",
  in: "🇮🇳", by: "🇧🇾", uz: "🇺🇿", eg: "🇪🇬", ae: "🇦🇪", sa: "🇸🇦",
  qa: "🇶🇦", nl: "🇳🇱", se: "🇸🇪",
};

export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [country, setCountry] = useState("global");

  const currentLang = i18n.language;
  const availableLangs = languages.filter((l) => l === "ru" || l === "en");
  const unavailableLangs = languages.filter((l) => l !== "ru" && l !== "en");

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-6xl py-2.5 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Calculator className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline">{t("site.name")}</span>
        </Link>

        {/* Nav + controls */}
        <div className="flex items-center gap-1">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 px-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Блог</span>
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 px-2">
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">О нас</span>
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 px-2">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Контакты</span>
            </Button>
          </Link>
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-8 px-2">
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t(`language.${currentLang}`)}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">{t("language.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLangs.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  className={currentLang === lang ? "bg-accent" : ""}
                >
                  <span className="text-sm">{t(`language.${lang}`)}</span>
                </DropdownMenuItem>
              ))}
              {unavailableLangs.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {unavailableLangs.map((lang) => (
                    <DropdownMenuItem key={lang} disabled className="opacity-50">
                      <span className="text-sm">{t(`language.${lang}`)}</span>
                      <span className="ml-auto text-xs text-muted-foreground">скоро</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Country */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-8 px-2">
                <span>{countryFlags[country]}</span>
                <span className="hidden sm:inline">{t(`country.${country}`)}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 max-h-80 overflow-auto">
              <DropdownMenuLabel className="text-xs">{t("country.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {countries.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => setCountry(c)}
                  className={country === c ? "bg-accent" : ""}
                >
                  <span className="mr-2">{countryFlags[c]}</span>
                  <span className="text-sm">{t(`country.${c}`)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to={user ? "/dashboard" : "/auth"}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 px-2">
              {user ? <User className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{user ? "Кабинет" : "Войти"}</span>
            </Button>
          </Link>
          <AccessibilityMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
