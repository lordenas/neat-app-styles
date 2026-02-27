import { useState, useMemo } from "react";
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
  Search,
  Users,
  BarChart3,
  Shield,
  Percent,
  Building2,
  Home,
  Car,
  Scale,
  Code2,
  Palette,
  Zap,
  Crown,
  MonitorSmartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  categories as calcCategories,
  calculatorsByCategory,
  getAvailableCalculatorsByCategory,
  type CategoryIconName,
} from "@/lib/calculators/calculator-data";

const iconMap: Record<CategoryIconName, React.ReactNode> = {
  DollarSign: <Calculator className="h-6 w-6" />,
  Percent: <Percent className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  Home: <Home className="h-6 w-6" />,
  Car: <Car className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
};

// Flatten all calculators with paths for search & popular
const allCalcsWithPaths = Object.values(calculatorsByCategory)
  .flat()
  .filter((c) => c.path);

const popularCalcIds = ["vat", "ndfl", "peni", "mortgage", "deposit", "refinancing"];
const popularCalcs = popularCalcIds
  .map((id) => allCalcsWithPaths.find((c) => c.id === id))
  .filter(Boolean) as typeof allCalcsWithPaths;

const featureIcons: Record<string, React.ReactNode> = {
  accurate: <Sparkles className="h-6 w-6" />,
  local: <Globe className="h-6 w-6" />,
  free: <CheckCircle2 className="h-6 w-6" />,
  private: <Lock className="h-6 w-6" />,
};
const featureKeys = ["accurate", "local", "free", "private"] as const;

const trustStats = [
  { key: "users", icon: <Users className="h-5 w-5" /> },
  { key: "calculations", icon: <BarChart3 className="h-5 w-5" /> },
  { key: "countries", icon: <Globe className="h-5 w-5" /> },
  { key: "uptime", icon: <Shield className="h-5 w-5" /> },
] as const;

const faqKeys = ["faq1", "faq2", "faq3", "faq4", "faq5"] as const;

const Index = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredCalcs = useMemo(() => {
    if (!search.trim()) return popularCalcs;
    const q = search.toLowerCase();
    return allCalcsWithPaths.filter((c) => {
      const name = t(`calculatorNames.${c.id}`, c.name).toLowerCase();
      const desc = t(`calculatorDescriptions.${c.id}`, c.description).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [search, t]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("site.name", "CalcHub"),
    description: t("site.description", ""),
    url: "https://neat-app-styles.lovable.app",
    inLanguage: i18n.language,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://neat-app-styles.lovable.app/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("home.hero.title", t("site.name", "CalcHub"))} — {t("site.name", "CalcHub")}</title>
        <meta name="description" content={t("site.description", "")} />
        <meta property="og:title" content={`${t("home.hero.title")} — ${t("site.name", "CalcHub")}`} />
        <meta property="og:description" content={t("site.description", "")} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://neat-app-styles.lovable.app/" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-primary/5 via-[hsl(var(--section-bg))] to-background">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.06] blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-info/[0.05] blur-3xl" />
          </div>

          <div className="container max-w-6xl relative text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Badge variant="secondary" className="text-sm px-4 py-1.5 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {t("home.hero.title")}{" "}
              <span className="text-primary">{t("home.hero.subtitle")}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("home.hero.description")}
            </p>

            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("home.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base bg-card border-border-strong shadow-sm"
                aria-label={t("home.searchPlaceholder")}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <a href="#categories">
                <Button size="lg" className="gap-2 shadow-md">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {(["calculators", "countries", "languages", "free"] as const).map((key) => (
                <Badge key={key} variant="outline" className="text-sm px-3 py-1.5 bg-card/60">
                  {t(`hero.stats.${key}`)}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Trust counters */}
        <section className="py-10 border-b border-border">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {trustStats.map(({ key, icon }) => (
                <div key={key} className="flex items-center gap-3 justify-center animate-in fade-in duration-500">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight">{t(`trust.${key}.value`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`trust.${key}.label`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="py-16 sm:py-20 scroll-mt-20">
          <div className="container max-w-6xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl">{t("home.categories.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("home.categories.subtitle")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {calcCategories.map((cat, i) => {
                const calcs = calculatorsByCategory[cat.id] ?? [];
                return (
                  <Link key={cat.id} to={`/categories/${cat.id}`} className="group" style={{ animationDelay: `${i * 60}ms` }}>
                    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                            {cat.icon ? iconMap[cat.icon] : <Calculator className="h-6 w-6" />}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base">{t(`category.${cat.id}`, cat.name)}</CardTitle>
                            <span className="text-xs text-muted-foreground">
                              {t("home.categories.count", { count: calcs.length, defaultValue: `${calcs.length}` })}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{t(`categoryDescription.${cat.id}`, cat.description)}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular */}
        <section className="py-16 sm:py-20 bg-[hsl(var(--section-bg))]">
          <div className="container max-w-6xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl">{t("home.popular.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("home.popular.subtitle")}</p>
            </div>
            {filteredCalcs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t("home.popular.noResults")}</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCalcs.map((calc) => (
                  <Link key={calc.id} to={calc.path ?? "/"} className="group">
                    <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border-subtle">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Calculator className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            {t(`calculatorNames.${calc.id}`, calc.name)}
                          </CardTitle>
                          <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{t(`calculatorDescriptions.${calc.id}`, calc.description)}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-20">
          <div className="container max-w-6xl space-y-10">
            <h2 className="text-2xl sm:text-3xl text-center">{t("features.title")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureKeys.map((key) => (
                <div key={key} className="text-center space-y-4 group">
                  <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                    {featureIcons[key]}
                  </div>
                  <h3 className="text-base font-semibold">{t(`features.${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 bg-[hsl(var(--section-bg))]">
          <div className="container max-w-3xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl">{t("faq.title")}</h2>
              <p className="text-muted-foreground">{t("faq.subtitle")}</p>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {faqKeys.map((key) => (
                <AccordionItem key={key} value={key} className="bg-card border rounded-lg px-5">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline text-left">
                    {t(`faq.${key}.q`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {t(`faq.${key}.a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Embed Widget section */}
        <section className="py-16 sm:py-20 bg-[hsl(var(--section-bg))]">
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: text */}
              <div className="space-y-6">
                <Badge variant="secondary" className="gap-1.5 text-sm px-3 py-1">
                  <Code2 className="h-3.5 w-3.5" />
                  Для партнёров
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                  Встройте калькулятор{" "}
                  <span className="text-primary">на свой сайт</span> за&nbsp;5 минут
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Настройте любой из 25+ калькуляторов под дизайн вашего сайта и получите готовый&nbsp;
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&lt;iframe&gt;</code>{" "}
                  или{" "}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">&lt;script&gt;</code> код для вставки.
                </p>

                <ul className="space-y-3">
                  {[
                    { icon: Palette, text: "Настройка цветов, шрифтов и скругления под ваш брендбук" },
                    { icon: MonitorSmartphone, text: "Адаптивный виджет — одинаково работает на десктопе и мобильном" },
                    { icon: Zap, text: "Free: 100 встраиваний в месяц с логотипом CalcHub" },
                    { icon: Crown, text: "Pro: White Label, без ограничений, кастомный логотип" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/embed-builder">
                    <Button size="lg" className="gap-2 shadow-md">
                      Открыть конструктор
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/partners">
                    <Button size="lg" variant="outline" className="gap-2">
                      Условия партнёрства
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: code preview card */}
              <div className="relative">
                <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-muted/60 border-b">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="flex-1 mx-3 rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground font-mono">
                      yoursite.com/mortgage
                    </div>
                  </div>

                  {/* Mock calculator widget */}
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="h-4 w-32 rounded bg-primary/20" />
                        <div className="h-3 w-24 rounded bg-muted" />
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    {/* Inputs */}
                    {[80, 60, 72].map((w) => (
                      <div key={w} className="space-y-1">
                        <div className="h-2.5 rounded bg-muted" style={{ width: `${w}%` }} />
                        <div className="h-10 rounded-lg border bg-muted/30" />
                      </div>
                    ))}
                    {/* Result */}
                    <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-2.5 w-20 rounded bg-primary/30" />
                        <div className="h-5 w-28 rounded bg-primary/50" />
                      </div>
                      <div className="h-8 w-20 rounded-lg bg-primary" />
                    </div>
                    {/* CalcHub watermark */}
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1 rounded-full bg-muted border px-2 py-0.5">
                        <span className="text-[10px] font-semibold text-primary">CalcHub</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code snippet floating */}
                <div className="absolute -bottom-4 -left-4 hidden lg:block rounded-xl border bg-card shadow-md px-4 py-3 max-w-[240px]">
                  <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed overflow-hidden">
{`<iframe
  src="calchub.app/mortgage
       ?embed=1&color=3b82f6"
  width="100%" height="600"
  style="border:none"
/>`}
                  </pre>
                </div>

                {/* Glow */}
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="container max-w-3xl text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl">{t("cta.title")}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{t("cta.description")}</p>
            <a href="#categories">
              <Button size="lg" className="gap-2 shadow-md">
                {t("cta.button")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
