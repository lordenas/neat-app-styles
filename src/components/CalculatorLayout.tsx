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
import { calculatorMetadata } from "@/lib/calculators/calculator-data";

type CalculatorLayoutProps = {
  calculatorId: string;
  categoryName?: string;
  categoryPath?: string;
  children: ReactNode;
};

export function CalculatorLayout({
  calculatorId,
  categoryName,
  categoryPath,
  children,
}: CalculatorLayoutProps) {
  const meta = calculatorMetadata[calculatorId] ?? {
    name: calculatorId,
    description: "",
    searches: [],
  };

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

      <div className="border-b border-border">
        <div className="container max-w-6xl py-3 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Link>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {categoryName && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={categoryPath ?? "/"}>{categoryName}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{meta.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main id="main-content" className="flex-grow">
        <div className="container max-w-6xl py-8">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
