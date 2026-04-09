import { useTranslation } from "react-i18next";
import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50 mt-16">
      <div className="container max-w-6xl py-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <Calculator className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">{t("site.name")}</span>
        </div>
        <nav className="flex flex-wrap gap-4 text-xs">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">О проекте</Link>
          <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Блог</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Контакты</Link>
          <Link to="/glossary" className="text-muted-foreground hover:text-foreground transition-colors">Глоссарий</Link>
          <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          <Link to="/partners" className="text-muted-foreground hover:text-foreground transition-colors">Партнёрам</Link>
        </nav>
        <p className="text-xs text-muted-foreground max-w-lg">
          {t("footer.disclaimer")}
        </p>
        <p className="text-xs text-muted-foreground">
          © {year} {t("site.name")}. {t("footer.rights")}.
        </p>
      </div>
    </footer>
  );
}
