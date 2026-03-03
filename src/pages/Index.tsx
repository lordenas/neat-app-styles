import { useState, useMemo, useRef, useCallback, useEffect, memo } from "react";
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
import { HeroIllustration } from "@/components/hero/HeroIllustration";
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

// Данные для анимированных счётчиков
const counterStats = [
  { key: "users",        target: 150,   suffix: "K+",  decimals: 0 },
  { key: "calculations", target: 2,     suffix: "M+",  decimals: 0 },
  { key: "countries",    target: 20,    suffix: "+",   decimals: 0 },
  { key: "uptime",       target: 99.9,  suffix: "%",   decimals: 1 },
] as const;

function useCountUp(target: number, decimals = 0, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        if (prefersReduced) { setCount(target); return; }
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
          setCount(parseFloat((eased * target).toFixed(decimals)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals, duration]);

  return { count, ref };
}



const faqKeys = ["faq1", "faq2", "faq3", "faq4", "faq5"] as const;

function CounterItem({ stat, icon }: { stat: typeof counterStats[number]; icon: React.ReactNode }) {
  const { t } = useTranslation();
  const { count, ref } = useCountUp(stat.target, stat.decimals);
  return (
    <div ref={ref} className="flex items-center gap-3 justify-center animate-in fade-in duration-500">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums">
          {stat.decimals > 0 ? count.toFixed(stat.decimals) : Math.round(count)}{stat.suffix}
        </p>
        <p className="text-xs text-muted-foreground">{t(`trust.${stat.key}.label`)}</p>
      </div>
    </div>
  );
}




const Index = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 }); // for illustration
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [chipOffsets, setChipOffsets] = useState<{ x: number; y: number }[]>([]);

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setParallax({ x: dx * 10, y: dy * -8 });

    // Individual chip offsets — each chip repels from mouse
    const mx = e.clientX;
    const my = e.clientY;
    const offsets = chipRefs.current.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      const chipCx = r.left + r.width / 2;
      const chipCy = r.top + r.height / 2;
      const vx = chipCx - mx;
      const vy = chipCy - my;
      const dist = Math.sqrt(vx * vx + vy * vy) || 1;
      const strength = Math.max(0, 1 - dist / 280) * 18;
      return { x: (vx / dist) * strength, y: (vy / dist) * strength };
    });
    setChipOffsets(offsets);
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
    setChipOffsets([]);
  }, []);

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
        <section ref={heroRef} onMouseMove={handleHeroMouseMove} onMouseLeave={handleHeroMouseLeave} className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-primary/5 via-[hsl(var(--section-bg))] to-background">
          {/* Ambient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-info/[0.05] blur-3xl animate-[pulse_10s_ease-in-out_infinite_2s]" />
          </div>

          <div className="container max-w-7xl relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* LEFT — text */}
              <div className="space-y-7 animate-in fade-in slide-in-from-left-6 duration-600">
                <Badge variant="secondary" className="text-sm px-4 py-1.5 gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("hero.badge")}
                </Badge>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                    {t("home.hero.title")}{" "}
                    <span className="text-primary">{t("home.hero.subtitle")}</span>
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                    {t("home.hero.description")}
                  </p>
                </div>

                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("home.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 text-base bg-card border-border-strong shadow-sm"
                    aria-label={t("home.searchPlaceholder")}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href="#categories">
                    <Button size="lg" className="gap-2 shadow-md">
                      {t("hero.cta")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(["calculators", "countries", "languages", "free"] as const).map((key) => (
                    <Badge key={key} variant="outline" className="text-sm px-3 py-1.5 bg-card/60">
                      {t(`hero.stats.${key}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* RIGHT — Glassmorphism Dashboard Illustration */}
              <div
                className="relative hidden lg:flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-600"
                style={{ minHeight: 500, perspective: "1100px" }}
                aria-hidden="true"
              >
                {/* Ambient glow blobs behind the illustration */}
                <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl -top-10 right-0 pointer-events-none" />
                <div className="absolute w-48 h-48 rounded-full bg-success/8 blur-2xl bottom-0 left-0 pointer-events-none" />

                {/* ── Main 3D tilt wrapper ── */}
                <div
                  className="relative z-10"
                  style={{
                    transform: `rotateY(${-12 + parallax.x * 0.55}deg) rotateX(${4 + parallax.y * 0.45}deg)`,
                    transformStyle: "preserve-3d",
                    transition: "transform 0.14s ease-out",
                  }}
                >
                  {/* ── Background blur layer (glass depth) ── */}
                  <div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(var(--background)/0.4) 100%)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid hsl(var(--border)/0.6)",
                      boxShadow: "0 32px 80px -16px hsl(var(--primary)/0.22), 0 8px 32px -8px hsl(var(--foreground)/0.1)",
                      transform: "translateZ(-8px) scale(1.04)",
                      borderRadius: "28px",
                    }}
                  />

                  {/* ── Grid of panels ── */}
                  <div className="relative grid grid-cols-5 grid-rows-3 gap-2.5 p-3 w-[420px]">

                    {/* ── CALCULATOR — spans col 1-2 rows 1-3 ── */}
                    <HeroCalculator parallax={parallax} />

                    {/* ── TOP RIGHT: Typewriter result card ── */}
                    <HeroResultCard />

                    {/* ── MID RIGHT: Mini bar chart ── */}
                    <HeroBarChart />

                    {/* ── BOTTOM RIGHT col 3-5: Sparkline + donut ── */}
                    <HeroSparkline />
                    <HeroDonut />
                  </div>
                </div>

                {/* Bottom glow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-14 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

                {/* Floating chips */}
                {[
                  { icon: <PiggyBank className="h-4 w-4 text-primary" />,   label: "Депозит", value: "+12.4%",  top: "2%",    left: "-6%",  animA: true,  delay: "0s"   },
                  { icon: <Receipt className="h-4 w-4 text-success" />,     label: "НДС",     value: "20%",     top: "8%",    right: "-8%", animA: false, delay: "0.4s" },
                  { icon: <TrendingUp className="h-4 w-4 text-success" />,  label: "Доход",   value: "↑ 8.3%", bottom: "26%", left: "-8%", animA: false, delay: "0.8s" },
                  { icon: <Car className="h-4 w-4 text-warning" />,         label: "Авто",    value: "15.9%",  bottom: "10%", right: "-6%",animA: true,  delay: "1.1s" },
                  { icon: <Scale className="h-4 w-4 text-destructive" />,   label: "Пени",    value: "×1/300", bottom: "-2%", left: "30%", animA: true,  delay: "1.5s" },
                ].map((fc, i) => {
                  const off = chipOffsets[i] ?? { x: 0, y: 0 };
                  return (
                    <div
                      key={i}
                      ref={(el) => { chipRefs.current[i] = el; }}
                      className="absolute z-20 flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg"
                      style={{
                        top: (fc as any).top,
                        bottom: (fc as any).bottom,
                        left: (fc as any).left,
                        right: (fc as any).right,
                        background: "hsl(var(--card)/0.85)",
                        backdropFilter: "blur(12px)",
                        borderColor: "hsl(var(--border)/0.7)",
                        boxShadow: "0 4px 16px hsl(var(--primary)/0.1)",
                        animation: `heroFloat${fc.animA ? "A" : "B"} ${4 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: fc.delay,
                        translate: `${off.x}px ${off.y}px`,
                        transition: "translate 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      }}
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10">{fc.icon}</div>
                      <div>
                        <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{fc.label}</p>
                        <p className="text-xs font-semibold text-foreground">{fc.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* Trust counters */}
        <section className="py-10 border-b border-border">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {counterStats.map((stat) => {
                const iconEl = trustStats.find(s => s.key === stat.key)?.icon;
                return <CounterItem key={stat.key} stat={stat} icon={iconEl} />;
              })}
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

        {/* Developer API section */}
        <section className="py-16 sm:py-20">
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: code preview */}
              <div className="relative order-2 lg:order-1">
                <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-muted/60 border-b">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                    <div className="flex-1 mx-3 rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground font-mono">
                      POST /api/calculate/mortgage
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3 font-mono text-[11px] sm:text-xs leading-relaxed">
                    <div className="text-muted-foreground">// Запрос</div>
                    <pre className="bg-muted/40 rounded-lg p-3 text-foreground overflow-x-auto whitespace-pre-wrap break-all sm:break-normal sm:whitespace-pre">{`curl -X POST \\
  https://api.calchub.io/calculate/mortgage \\
  -H "X-Api-Key: chk_your_key" \\
  -d '{"amount":5000000,"rate":16,"months":240}'`}</pre>
                    <div className="text-muted-foreground mt-2">// Ответ</div>
                    <pre className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-foreground overflow-x-auto whitespace-pre">{`{
  "monthlyPayment": 72450,
  "totalPayment": 17388000,
  "overpayment": 12388000,
  "schedule": [...]
}`}</pre>
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute -bottom-4 -right-4 w-48 h-48 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />
              </div>

              {/* Right: text */}
              <div className="space-y-6 order-1 lg:order-2">
                <Badge variant="secondary" className="gap-1.5 text-sm px-3 py-1">
                  <Code2 className="h-3.5 w-3.5" />
                  Для разработчиков
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                  REST API для{" "}
                  <span className="text-primary">вашего приложения</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Подключите 25+ финансовых калькуляторов к своему сервису через единый REST API.
                  Один запрос — готовый JSON с результатом и графиком платежей.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: Zap, text: "Один эндпоинт POST /api/calculate/:type для всех калькуляторов" },
                    { icon: Shield, text: "Авторизация через API-ключи с ролевыми лимитами" },
                    { icon: BarChart3, text: "Free: 1 000 запросов в месяц бесплатно" },
                    { icon: Crown, text: "Pro: неограниченные запросы, SLA и приоритетная поддержка" },
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
                  <Link to="/api-keys">
                    <Button size="lg" className="gap-2 shadow-md">
                      Получить API-ключ
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/api-keys">
                    <Button size="lg" variant="outline" className="gap-2">
                      Документация API
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
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
