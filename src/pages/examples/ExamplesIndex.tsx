import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Wrench, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exampleCategories, exampleCalcs, getCalcsByCategory } from "@/data/example-calculators";

const BASE = "https://neat-app-styles.lovable.app";

export default function ExamplesIndex() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": `${BASE}/` },
      { "@type": "ListItem", "position": 2, "name": "Примеры калькуляторов", "item": `${BASE}/examples` },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Примеры онлайн-калькуляторов",
    "description": "Коллекция бесплатных онлайн-калькуляторов: финансы, бизнес, авто, ремонт, здоровье и повседневные расчёты.",
    "url": `${BASE}/examples`,
    "hasPart": [
      ...exampleCategories.map((cat) => ({
        "@type": "CollectionPage",
        "name": `${cat.name} — онлайн-калькуляторы`,
        "description": cat.description,
        "url": `${BASE}/examples/${cat.slug}`,
      })),
      ...exampleCalcs.map((c) => ({
        "@type": "WebApplication",
        "name": c.name,
        "description": c.shortDesc,
        "url": `${BASE}/examples/${c.categorySlug}/${c.slug}`,
        "applicationCategory": "UtilitiesApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RUB" },
      })),
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Примеры калькуляторов онлайн — финансы, авто, ремонт, здоровье | CalcHub</title>
        <meta
          name="description"
          content="Готовые онлайн-калькуляторы: скидка, проценты, ИМТ, расход топлива, стоимость ремонта и другие. Используйте бесплатно или встройте на свой сайт."
        />
        <meta name="keywords" content="онлайн калькулятор, калькулятор скидки, ИМТ калькулятор, расход топлива, стоимость ремонта, маржа бизнес" />
        <link rel="canonical" href={`${BASE}/examples`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
      </Helmet>

      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="py-14 sm:py-20 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container max-w-5xl text-center space-y-5">
            <Badge variant="secondary" className="gap-1.5">
              <Wrench className="h-3 w-3" /> Примеры из конструктора
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Бесплатные онлайн‑калькуляторы
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Используйте прямо сейчас — или встройте любой калькулятор на свой сайт одной строкой кода.
              Каждый создан в нашем конструкторе и показывает, что можно сделать за 5 минут.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              <Link to="/calc-landing">
                <Button size="lg" className="gap-2">
                  <Wrench className="h-4 w-4" /> Создать свой калькулятор
                </Button>
              </Link>
              <a href="#categories">
                <Button size="lg" variant="outline">Смотреть примеры</Button>
              </a>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="border-b border-border bg-muted/30">
          <div className="container max-w-5xl py-4 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Калькуляторов", value: "21" },
              { label: "Категорий", value: "6" },
              { label: "Встраиваний", value: "∞" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <section id="categories" className="py-14">
          <div className="container max-w-5xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Примеры калькуляторов</span>
            </nav>

            <div className="space-y-12">
              {exampleCategories.map((cat) => {
                const calcs = getCalcsByCategory(cat.slug);
                const iconBg = colorMap[cat.color] ?? "bg-primary/10 text-primary";
                return (
                  <section key={cat.slug} id={cat.slug}>
                    {/* Category header */}
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${iconBg}`}>
                          {cat.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{cat.name}</h2>
                          <p className="text-sm text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>
                      <Link
                        to={`/examples/${cat.slug}`}
                        className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                      >
                        Все {calcs.length} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {calcs.map((calc) => (
                        <Link
                          key={calc.slug}
                          to={`/examples/${cat.slug}/${calc.slug}`}
                          className="group rounded-xl border border-border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                              {calc.name}
                            </h3>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{calc.shortDesc}</p>
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={`/examples/${cat.slug}`}
                      className="sm:hidden mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Смотреть все в {cat.name} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-border bg-muted/20">
          <div className="container max-w-3xl text-center space-y-5">
            <div className="text-4xl">🚀</div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Создайте свой калькулятор за 5 минут
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Все эти калькуляторы сделаны в нашем конструкторе без программирования.
              Настройте под свой бренд и получите готовый виджет для встройки.
            </p>
            <Link to="/calc-landing">
              <Button size="lg" className="gap-2 mt-2">
                <Wrench className="h-4 w-4" /> Попробовать бесплатно
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
