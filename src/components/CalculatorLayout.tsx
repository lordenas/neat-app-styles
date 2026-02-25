import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { calculatorMetadata, calculatorsByCategory, categories } from "@/lib/calculators/calculator-data";

type CalculatorLayoutProps = {
  calculatorId: string;
  categoryName?: string;
  categoryPath?: string;
  title?: ReactNode;
  children: ReactNode;
};

export function CalculatorLayout({
  calculatorId,
  categoryName,
  categoryPath,
  title,
  children,
}: CalculatorLayoutProps) {
  const meta = calculatorMetadata[calculatorId] ?? {
    name: calculatorId,
    description: "",
    searches: [],
  };

  // Find the category this calculator belongs to
  const currentCategoryId = Object.entries(calculatorsByCategory).find(
    ([, calcs]) => calcs.some((c) => c.id === calculatorId)
  )?.[0];

  const relatedCalcs = currentCategoryId
    ? (calculatorsByCategory[currentCategoryId] ?? []).filter((c) => c.id !== calculatorId)
    : [];

  const otherCategories = categories.filter((c) => c.id !== currentCategoryId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{meta.name} — CalcHub</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={`${meta.name} — CalcHub`} />
        <meta property="og:description" content={meta.description} />
        <link rel="canonical" href={`https://neat-app-styles.lovable.app/${calculatorId}`} />
      </Helmet>

      <SiteHeader />

      <div className="border-b border-border-subtle bg-muted/30">
        <div className="container max-w-6xl py-2 flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 group"
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Назад</span>
          </Link>

          <span className="text-border-subtle select-none">·</span>

          <Breadcrumb>
            <BreadcrumbList className="text-xs gap-1 sm:gap-1.5">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {categoryName && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={categoryPath ?? "/"} className="text-muted-foreground hover:text-foreground transition-colors">{categoryName}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{meta.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main id="main-content" className="flex-grow">
        <div className="container max-w-6xl py-8">
          {title && <div className="mb-6">{title}</div>}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>

            {/* Right sidebar */}
            <aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Ad block */}
              <div className="section-card">
                <p className="text-xs text-muted-foreground mb-2">Реклама</p>
                <div className="rounded-md bg-muted/50 border border-dashed border-border-subtle flex items-center justify-center h-60">
                  <span className="text-xs text-muted-foreground">Рекламный блок</span>
                </div>
              </div>

              {/* Related calculators */}
              {relatedCalcs.length > 0 && (
                <div className="section-card space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {categoryName ?? "Похожие калькуляторы"}
                  </p>
                  <nav aria-label="Похожие калькуляторы" className="space-y-1">
                    {relatedCalcs.map((c) => (
                      <Link
                        key={c.id}
                        to={c.path ?? "#"}
                        className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Other categories */}
              {otherCategories.length > 0 && (
                <div className="section-card space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Другие категории</p>
                  <nav aria-label="Другие категории калькуляторов" className="space-y-1">
                    {otherCategories.slice(0, 5).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/categories/${cat.id}`}
                        className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </nav>
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
