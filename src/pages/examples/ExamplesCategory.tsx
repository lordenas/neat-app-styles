import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ChevronRight, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryBySlug, getCalcsByCategory } from "@/data/example-calculators";

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function ExamplesCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = getCategoryBySlug(categorySlug ?? "");
  if (!category) return <Navigate to="/examples" replace />;

  const calcs = getCalcsByCategory(category.slug);
  const iconBg = colorMap[category.color] ?? "bg-primary/10 text-primary";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{category.name} — бесплатные онлайн-калькуляторы | CalcHub</title>
        <meta name="description" content={`${category.name}: ${category.description}. Бесплатные онлайн-калькуляторы — используйте или встройте на сайт.`} />
        <meta name="keywords" content={calcs.map((c) => c.keywords.slice(0, 2).join(", ")).join(", ")} />
        <link rel="canonical" href={`https://neat-app-styles.lovable.app/examples/${category.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://neat-app-styles.lovable.app/" },
            { "@type": "ListItem", "position": 2, "name": "Примеры", "item": "https://neat-app-styles.lovable.app/examples" },
            { "@type": "ListItem", "position": 3, "name": category.name, "item": `https://neat-app-styles.lovable.app/examples/${category.slug}` },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${category.name} — онлайн калькуляторы`,
          "description": category.description,
          "url": `https://neat-app-styles.lovable.app/examples/${category.slug}`,
          "hasPart": calcs.map((c) => ({
            "@type": "WebApplication",
            "name": c.name,
            "description": c.shortDesc,
            "url": `https://neat-app-styles.lovable.app/examples/${category.slug}/${c.slug}`,
            "applicationCategory": "UtilitiesApplication",
          })),
        })}</script>
      </Helmet>

      <SiteHeader />

      <main id="main-content" className="py-10 sm:py-14">
        <div className="container max-w-4xl space-y-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/examples" className="hover:text-foreground transition-colors">Примеры</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${iconBg}`}>
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{category.name}</h1>
              <p className="text-muted-foreground mt-0.5">{category.description}</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-base px-3 py-1 shrink-0">
              {calcs.length}
            </Badge>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {calcs.map((calc) => (
              <Link
                key={calc.slug}
                to={`/examples/${category.slug}/${calc.slug}`}
                className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold group-hover:text-primary transition-colors">{calc.name}</h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </div>
                <p className="text-sm text-muted-foreground">{calc.shortDesc}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {calc.keywords.slice(0, 2).map((kw) => (
                    <span key={kw} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-border bg-primary/5 px-6 py-7 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Нужен похожий калькулятор?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Создайте собственный за 5 минут в нашем конструкторе — без кода. Настройте под свой бренд и встройте на сайт.
              </p>
            </div>
            <Link to="/calc-landing">
              <Button className="gap-2 shrink-0">
                <Wrench className="h-4 w-4" /> Создать калькулятор
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
