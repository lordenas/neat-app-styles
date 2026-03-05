import { useState, useMemo } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Wrench, Code2, CheckCircle2, ArrowRight, Info, Wand2 } from "lucide-react";
import { createBuilderTemplateFromExample } from "@/lib/example-to-builder";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getCategoryBySlug,
  getCalcBySlug,
  getCalcsByCategory,
  type ExampleCalcField,
} from "@/data/example-calculators";

// ─── Result formatter ────────────────────────────────────────────────────────
function formatResult(value: number | string, format: string): string {
  if (typeof value === "string") return value;
  if (!isFinite(value)) return "—";
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
    case "percent":
      return `${value}%`;
    case "number":
    default:
      return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
  }
}

// ─── Single field ─────────────────────────────────────────────────────────────
function CalcField({
  field,
  value,
  onChange,
}: {
  field: ExampleCalcField;
  value: number;
  onChange: (v: number) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{field.label}</Label>
        <div className="grid grid-cols-2 gap-2">
          {field.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                value === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/50 text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "range") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{field.label}</Label>
          <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-foreground">
            {new Intl.NumberFormat("ru-RU").format(value)} {field.unit}
          </span>
        </div>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{field.min ?? 0}</span>
          <span>{field.max ?? 100}</span>
        </div>
      </div>
    );
  }

  // number
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{field.label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          min={field.min}
          step={field.step ?? 1}
          className="pr-10"
        />
        {field.unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExamplesCalc() {
  const navigate = useNavigate();
  const { categorySlug, calcSlug } = useParams<{ categorySlug: string; calcSlug: string }>();
  const category = getCategoryBySlug(categorySlug ?? "");
  const calc = getCalcBySlug(categorySlug ?? "", calcSlug ?? "");

  const relatedCalcs = useMemo(
    () => category && calc
      ? getCalcsByCategory(category.slug).filter((c) => c.slug !== calc.slug).slice(0, 4)
      : [],
    [category, calc],
  );

  const initialValues = useMemo(() => {
    if (!calc) return {};
    const map: Record<string, number> = {};
    calc.fields.forEach((f) => { map[f.key] = f.defaultValue; });
    return map;
  }, [calc]);

  const [values, setValues] = useState<Record<string, number>>(initialValues);

  const handleChange = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const results = useMemo(() => {
    if (!calc) return {};
    try {
      return calc.calculate(values);
    } catch {
      return {};
    }
  }, [values, calc]);

  if (!category || !calc) return <Navigate to="/examples" replace />;

  const embedCode = `<iframe src="https://neat-app-styles.lovable.app/examples/${category.slug}/${calc.slug}" width="100%" height="480" frameborder="0" title="${calc.name}"></iframe>`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{calc.seoTitle}</title>
        <meta name="description" content={calc.seoDescription} />
        <meta name="keywords" content={calc.keywords.join(", ")} />
        <link rel="canonical" href={`https://neat-app-styles.lovable.app/examples/${category.slug}/${calc.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://neat-app-styles.lovable.app/" },
            { "@type": "ListItem", "position": 2, "name": "Примеры", "item": "https://neat-app-styles.lovable.app/examples" },
            { "@type": "ListItem", "position": 3, "name": category.name, "item": `https://neat-app-styles.lovable.app/examples/${category.slug}` },
            { "@type": "ListItem", "position": 4, "name": calc.name, "item": `https://neat-app-styles.lovable.app/examples/${category.slug}/${calc.slug}` },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": calc.name,
          "description": calc.description,
          "url": `https://neat-app-styles.lovable.app/examples/${category.slug}/${calc.slug}`,
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RUB" },
          "featureList": calc.keywords,
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": calc.faq.map((item) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a },
          })),
        })}</script>
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        <div className="container max-w-5xl py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/examples" className="hover:text-foreground transition-colors">Примеры</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/examples/${category.slug}`} className="hover:text-foreground transition-colors">
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{calc.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* ── Main ── */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{calc.name}</h1>
                <p className="text-muted-foreground mt-2">{calc.description}</p>
              </div>

              {/* Calculator card */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Inputs */}
                <div className="p-5 sm:p-6 space-y-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Исходные данные
                  </h2>
                  {calc.fields.map((field) => (
                    <CalcField
                      key={field.key}
                      field={field}
                      value={values[field.key]}
                      onChange={(v) => handleChange(field.key, v)}
                    />
                  ))}
                </div>

                {/* Results */}
                <div className="border-t border-border bg-muted/30 p-5 sm:p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Результат
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {calc.results.map((res) => {
                      const rawVal = results[res.key];
                      const display = rawVal !== undefined
                        ? formatResult(rawVal as number | string, res.format)
                        : "—";
                      return (
                        <div
                          key={res.key}
                          className={`rounded-xl p-4 ${
                            res.highlight
                              ? "bg-primary/10 border border-primary/20 col-span-full sm:col-span-1"
                              : "bg-background border border-border"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">{res.label}</div>
                          <div
                            className={`font-bold tabular-nums ${
                              res.highlight ? "text-2xl text-primary" : "text-lg"
                            }`}
                          >
                            {display}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formula */}
                <div className="border-t border-border px-5 sm:px-6 py-3 bg-muted/10 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[11px] font-mono text-muted-foreground">{calc.formula}</span>
                  <button
                    onClick={() => {
                      const id = createBuilderTemplateFromExample(calc);
                      navigate(`/calc-builder/${id}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    <Wand2 className="h-3 w-3" /> Создать похожий в конструкторе
                  </button>
                </div>
              </div>

              {/* Description long */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="text-lg font-semibold">Описание</h2>
                <p>{calc.description}</p>
                <p>
                  Все расчёты выполняются мгновенно прямо в браузере. Калькулятор можно встроить на
                  любой сайт за 5 минут — в нашем конструкторе CalcHub вы можете создать точно такой
                  же инструмент, настроить цвета под свой бренд и получить готовый embed-код.
                </p>
              </div>

              {/* FAQ */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Часто задаваемые вопросы</h2>
                <Accordion type="single" collapsible className="border border-border rounded-xl overflow-hidden">
                  {calc.faq.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border last:border-0">
                      <AccordionTrigger className="px-5 py-4 text-sm font-medium text-left hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4 text-sm text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </div>

            {/* ── Sidebar ── */}
            <aside className="space-y-5">
              {/* Embed block */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Встроить на сайт</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{calc.embedNote}</p>
                <div className="bg-muted rounded-lg p-3 overflow-x-auto">
                  <code className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">
                    {embedCode}
                  </code>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    const id = createBuilderTemplateFromExample(calc);
                    navigate(`/calc-builder/${id}`);
                  }}
                >
                  <Wand2 className="h-3.5 w-3.5" /> Создать похожий в конструкторе
                </Button>
              </div>

              {/* Builder CTA */}
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Wand2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">Шаблон в 1 клик</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Откроет конструктор с уже созданными полями из этого примера.
                  Останется только написать формулы и настроить внешний вид.
                </p>
                <Button
                  size="sm"
                  variant="default"
                  className="w-full gap-2"
                  onClick={() => {
                    const id = createBuilderTemplateFromExample(calc);
                    navigate(`/calc-builder/${id}`);
                  }}
                >
                  <Wand2 className="h-3.5 w-3.5" /> Создать похожий в конструкторе
                </Button>
              </div>

              {/* Why embed */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Info className="h-4 w-4 text-primary" /> Зачем встраивать?
                </div>
                <ul className="space-y-2">
                  {[
                    "Дольше держит посетителей на странице",
                    "Повышает конверсию в заявку",
                    "Даёт уникальный полезный контент",
                    "Улучшает поведенческие SEO-факторы",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related */}
              {relatedCalcs.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h3 className="font-semibold text-sm">В этой же категории</h3>
                  <div className="space-y-2">
                    {relatedCalcs.map((rel) => (
                      <Link
                        key={rel.slug}
                        to={`/examples/${category.slug}/${rel.slug}`}
                        className="flex items-center justify-between gap-2 group p-2.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium group-hover:text-primary transition-colors">{rel.name}</div>
                          <div className="text-xs text-muted-foreground">{rel.shortDesc}</div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/examples/${category.slug}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Все в «{category.name}» <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
