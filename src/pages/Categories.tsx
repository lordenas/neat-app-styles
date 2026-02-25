import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Calculator,
  Percent,
  TrendingUp,
  Building2,
  Briefcase,
  Home,
  Car,
  Scale,
  ArrowRight,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  categories as calcCategories,
  calculatorsByCategory,
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

const Categories = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const q = search.toLowerCase().trim();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Калькуляторы по категориям — {t("site.name")}</title>
        <meta name="description" content="Все финансовые, юридические, налоговые и автомобильные калькуляторы — удобно сгруппированы по категориям." />
        <link rel="canonical" href="https://neat-app-styles.lovable.app/categories" />
      </Helmet>

      <SiteHeader />

      <main id="main-content" className="py-12 sm:py-16">
        <div className="container max-w-5xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Калькуляторы по категориям
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Выберите нужную категорию или найдите калькулятор через поиск
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск калькулятора…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-card border-border-strong"
                aria-label="Поиск калькулятора"
              />
            </div>
          </div>

          {/* Category blocks */}
          <div className="space-y-10">
            {calcCategories.map((cat) => {
              const calcs = calculatorsByCategory[cat.id] ?? [];
              const filtered = q
                ? calcs.filter(
                    (c) =>
                      c.name.toLowerCase().includes(q) ||
                      c.description.toLowerCase().includes(q)
                  )
                : calcs;

              if (q && filtered.length === 0) return null;

              return (
                <section key={cat.id} id={cat.id}>
                  <Link to={`/categories/${cat.id}`} className="flex items-center gap-3 mb-4 group">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {cat.icon ? iconMap[cat.icon] : <Calculator className="h-6 w-6" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{cat.name}</h2>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto shrink-0">
                      {filtered.length}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((calc) => (
                      <Link key={calc.id} to={calc.path ?? "/"} className="group">
                        <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                                {calc.name}
                              </CardTitle>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs">
                              {calc.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            {q &&
              calcCategories.every((cat) => {
                const calcs = calculatorsByCategory[cat.id] ?? [];
                return !calcs.some(
                  (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q)
                );
              }) && (
                <p className="text-center text-muted-foreground py-12">
                  Ничего не найдено по запросу «{search}»
                </p>
              )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Categories;
