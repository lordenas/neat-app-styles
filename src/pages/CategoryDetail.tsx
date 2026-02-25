import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
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
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  categories as calcCategories,
  calculatorsByCategory,
  type CategoryIconName,
} from "@/lib/calculators/calculator-data";

const iconMap: Record<CategoryIconName, React.ReactNode> = {
  DollarSign: <Calculator className="h-7 w-7" />,
  Percent: <Percent className="h-7 w-7" />,
  TrendingUp: <TrendingUp className="h-7 w-7" />,
  Building2: <Building2 className="h-7 w-7" />,
  Briefcase: <Briefcase className="h-7 w-7" />,
  Home: <Home className="h-7 w-7" />,
  Car: <Car className="h-7 w-7" />,
  Scale: <Scale className="h-7 w-7" />,
};

const CategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useTranslation();

  const category = calcCategories.find((c) => c.id === categoryId);
  if (!category) return <Navigate to="/categories" replace />;

  const calcs = calculatorsByCategory[category.id] ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{category.name} — {t("site.name")}</title>
        <meta name="description" content={category.description} />
        <link rel="canonical" href={`https://neat-app-styles.lovable.app/categories/${category.id}`} />
      </Helmet>

      <SiteHeader />

      <main id="main-content" className="py-12 sm:py-16">
        <div className="container max-w-4xl space-y-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/categories" className="hover:text-foreground transition-colors">Категории</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {category.icon ? iconMap[category.icon] : <Calculator className="h-7 w-7" />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{category.name}</h1>
              <p className="text-muted-foreground mt-1">{category.description}</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-base px-3 py-1 shrink-0">
              {calcs.length}
            </Badge>
          </div>

          {/* Calculator grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {calcs.map((calc) => (
              <Link key={calc.id} to={calc.path ?? "/"} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                        {calc.name}
                      </CardTitle>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription>{calc.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {calcs.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              В этой категории пока нет калькуляторов
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default CategoryDetail;
