import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Calculator,
  Landmark,
  PiggyBank,
  Receipt,
  Briefcase,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const categoryIcons: Record<string, React.ReactNode> = {
  credit: <Calculator className="h-6 w-6" />,
  mortgage: <Landmark className="h-6 w-6" />,
  deposit: <PiggyBank className="h-6 w-6" />,
  tax: <Receipt className="h-6 w-6" />,
  business: <Briefcase className="h-6 w-6" />,
  currency: <TrendingUp className="h-6 w-6" />,
};

const categoryKeys = ["credit", "mortgage", "deposit", "tax", "business", "currency"] as const;

const popularCalcs = [
  { key: "creditCalc", link: "/credit-calculator", icon: <Calculator className="h-5 w-5" /> },
  { key: "mortgageCalc", link: "/credit-calculator", icon: <Landmark className="h-5 w-5" /> },
  { key: "depositCalc", link: "/credit-calculator", icon: <PiggyBank className="h-5 w-5" /> },
  { key: "salaryCalc", link: "/credit-calculator", icon: <Receipt className="h-5 w-5" /> },
  { key: "refinanceCalc", link: "/credit-calculator", icon: <TrendingUp className="h-5 w-5" /> },
  { key: "roiCalc", link: "/credit-calculator", icon: <Briefcase className="h-5 w-5" /> },
] as const;

const featureIcons: Record<string, React.ReactNode> = {
  accurate: <Sparkles className="h-5 w-5 text-primary" />,
  local: <Globe className="h-5 w-5 text-primary" />,
  free: <CheckCircle2 className="h-5 w-5 text-primary" />,
  private: <Lock className="h-5 w-5 text-primary" />,
};
const featureKeys = ["accurate", "local", "free", "private"] as const;

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("hero.title")} — {t("site.name")}</title>
        <meta name="description" content={t("site.description")} />
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="py-16 sm:py-24 bg-[hsl(var(--section-bg))]">
          <div className="container max-w-6xl text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.subtitle")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("hero.description")}
            </p>
            <div className="flex justify-center">
              <Link to="/credit-calculator">
                <Button size="lg" className="gap-2">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {(["calculators", "countries", "languages", "free"] as const).map((key) => (
                <Badge key={key} variant="secondary" className="text-sm px-3 py-1.5">
                  {t(`hero.stats.${key}`)}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container max-w-6xl space-y-8">
            <div className="text-center space-y-2">
              <h2>{t("categories.title")}</h2>
              <p className="text-muted-foreground">{t("categories.subtitle")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryKeys.map((key) => (
                <Link key={key} to="/credit-calculator">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {categoryIcons[key]}
                        </div>
                        <div>
                          <CardTitle className="text-base">{t(`categories.${key}.title`)}</CardTitle>
                          <span className="text-xs text-muted-foreground">{t(`categories.${key}.count`)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{t(`categories.${key}.description`)}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular */}
        <section className="py-16 bg-[hsl(var(--section-bg))]">
          <div className="container max-w-6xl space-y-8">
            <div className="text-center space-y-2">
              <h2>{t("popular.title")}</h2>
              <p className="text-muted-foreground">{t("popular.subtitle")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCalcs.map(({ key, link, icon }) => (
                <Link key={key} to={link}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{icon}</div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {t(`popular.${key}.title`)}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{t(`popular.${key}.description`)}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container max-w-6xl space-y-8">
            <h2 className="text-center">{t("features.title")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureKeys.map((key) => (
                <div key={key} className="text-center space-y-3">
                  <div className="flex justify-center">{featureIcons[key]}</div>
                  <h3 className="text-base font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`features.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
