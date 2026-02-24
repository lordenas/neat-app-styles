import { useTranslation } from "react-i18next";
import { Calculator } from "lucide-react";

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
