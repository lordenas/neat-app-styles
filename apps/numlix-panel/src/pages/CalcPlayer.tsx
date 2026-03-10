import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { CustomCalculator, CalcPage } from "@/types/custom-calc";
import { useGetPublicCalculatorQuery } from "@/services/api/calculatorsApi";
import { PlayerField } from "@/components/calc-player/PlayerField";
import { groupByRow } from "@/components/calc-builder/BuilderCanvas";
import { buildThemeVars } from "@/components/calc-builder/ThemePanel";
import { evaluateAllFormulas, resolveVisibility } from "@/lib/calc-engine";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Slide animation helpers ──────────────────────────────────

type SlideDir = "left" | "right";

function usePageSlide(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(0);
  // Direction of the INCOMING page: "left" = new page slides in from right, "right" = from left
  const [enterDir, setEnterDir] = useState<SlideDir>("left");

  const goTo = useCallback(
    (target: number, dir?: SlideDir) => {
      if (target < 0 || target >= totalPages || target === currentPage) return;
      const autoDir = dir ?? (target > currentPage ? "left" : "right");
      setEnterDir(autoDir);
      setCurrentPage(target);
    },
    [currentPage, totalPages],
  );

  const next = useCallback(
    () => goTo(currentPage + 1, "left"),
    [goTo, currentPage],
  );
  const prev = useCallback(
    () => goTo(currentPage - 1, "right"),
    [goTo, currentPage],
  );

  return { currentPage, enterDir, goTo, next, prev };
}

// ── Progress bar ─────────────────────────────────────────────

function PageProgress({
  pages,
  current,
}: {
  pages: CalcPage[];
  current: number;
}) {
  if (pages.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex gap-1.5 flex-1">
        {pages.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < current
                ? "bg-primary"
                : i === current
                  ? "bg-primary/60"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {current + 1} / {pages.length}
      </span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────

export default function CalcPlayer() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: calculatorFromApi,
    isLoading,
    isError,
  } = useGetPublicCalculatorQuery(slug ?? "", { skip: !slug });
  const calculator = calculatorFromApi ?? null;
  const [values, setValues] = useState<
    Record<string, number | string | boolean>
  >({});
  const [manualResults, setManualResults] = useState<Record<string, number>>(
    {},
  );

  const pages: CalcPage[] = calculator?.pages?.length
    ? calculator.pages
    : [{ id: "__single__", title: "", orderIndex: 0 }];

  const { currentPage, enterDir, goTo, next, prev } = usePageSlide(
    pages.length,
  );

  useEffect(() => {
    if (!calculator) return;
    const defaults: Record<string, number | string | boolean> = {};
    for (const field of calculator.fields) {
      if (field.type === "result") continue;
      const def = field.config.defaultValue;
      if (def !== undefined) {
        defaults[field.key] = def;
      } else if (field.type === "number" || field.type === "slider") {
        defaults[field.key] = field.config.min ?? 0;
      } else if (field.type === "checkbox") {
        defaults[field.key] = false;
      } else if (field.type === "select" || field.type === "radio") {
        const first = field.config.options?.[0]?.value;
        if (first) defaults[field.key] = first;
      } else {
        defaults[field.key] = "";
      }
    }
    setValues(defaults);
  }, [calculator]);

  const notFound = !slug || isError || (!isLoading && !calculator);

  // Auto-advance + conditional routes: check current page on every values change
  useEffect(() => {
    if (!calculator) return;
    const currentPages: CalcPage[] = calculator.pages?.length
      ? calculator.pages
      : [{ id: "__single__", title: "", orderIndex: 0 }];
    const page = currentPages[currentPage];
    const allFields = [...calculator.fields].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    // 1. Check conditional page routes (specific target pages) — first match wins
    if (page?.routes?.length) {
      for (const route of page.routes) {
        const noCondition = !route.condition.rules?.length;
        const satisfied =
          noCondition || resolveVisibility(route.condition, values, allFields);
        if (satisfied) {
          const target = route.targetPageIndex;
          if (
            target !== currentPage &&
            target >= 0 &&
            target < currentPages.length
          ) {
            goTo(target);
            return;
          }
        }
      }
    }

    // 2. Auto-advance to next page
    if (page?.autoAdvance?.rules?.length) {
      const satisfied = resolveVisibility(page.autoAdvance, values, allFields);
      if (satisfied && currentPage < currentPages.length - 1) {
        next();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, currentPage, calculator]);

  const onChange = (key: string, value: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    if (!calculator) return;
    const defaults: Record<string, number | string | boolean> = {};
    for (const field of calculator.fields) {
      if (
        field.type === "result" ||
        field.type === "button" ||
        field.type === "label"
      )
        continue;
      const def = field.config.defaultValue;
      if (def !== undefined) defaults[field.key] = def;
      else if (field.type === "number" || field.type === "slider")
        defaults[field.key] = field.config.min ?? 0;
      else if (field.type === "checkbox") defaults[field.key] = false;
      else if (field.type === "select" || field.type === "radio") {
        const first = field.config.options?.[0]?.value;
        if (first) defaults[field.key] = first;
      } else defaults[field.key] = "";
    }
    setValues(defaults);
    setManualResults({});
  };

  const handleTriggerCalculate = (targetFieldId?: string) => {
    if (!calculator) return;
    const allFields = [...calculator.fields].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    const results = evaluateAllFormulas(allFields, values);
    const manualFields = allFields.filter(
      (f) => f.type === "result" && f.config.manualCalculation,
    );
    const fieldsToCalc = targetFieldId
      ? manualFields.filter((f) => f.id === targetFieldId)
      : manualFields;
    const newManual: Record<string, number> = { ...manualResults };
    for (const f of fieldsToCalc) {
      newManual[f.key] = results[f.key];
    }
    setManualResults(newManual);
  };

  const handleNavigatePage = (target: "next" | "prev" | number) => {
    if (target === "next") next();
    else if (target === "prev") prev();
    else goTo(target);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">
            Загрузка...
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Калькулятор не найден</h1>
            <p className="text-muted-foreground text-sm">
              Калькулятор с адресом{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                /c/{slug}
              </code>{" "}
              не существует или был удалён.
            </p>
            <Button asChild>
              <Link to="/calc-builder">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Создать калькулятор
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!calculator) return null;

  const allSorted = [...calculator.fields].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const currentPageId = pages[currentPage]?.id;

  // Fields for current page
  const pageFields = allSorted.filter(
    (f) =>
      (f.pageId ?? pages[0]?.id) === currentPageId ||
      currentPageId === "__single__",
  );

  const hasMultiplePages = pages.length > 1;
  const themeVars = calculator.theme ? buildThemeVars(calculator.theme) : {};
  const bgStyle: React.CSSProperties = calculator.theme?.bgColor
    ? { backgroundColor: calculator.theme.bgColor }
    : {};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-8 px-4" style={{ ...themeVars, ...bgStyle }}>
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="mb-6 px-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calculator className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {calculator.title}
              </h1>
            </div>
            {calculator.description && (
              <p className="text-muted-foreground text-sm">
                {calculator.description}
              </p>
            )}
          </div>

          {/* Page progress */}
          <PageProgress pages={pages} current={currentPage} />

          {/* Card wrapper */}
          <div
            className="rounded-xl bg-card border border-border shadow-sm p-6"
            style={{
              backgroundColor: calculator.theme?.cardColor ?? undefined,
              fontFamily: calculator.theme?.fontFamily
                ? `'${calculator.theme.fontFamily}', sans-serif`
                : undefined,
            }}
          >
            {/* Slide container */}
            <div className="overflow-hidden">
              <div
                key={currentPage}
                className={cn(
                  enterDir === "left"
                    ? "animate-[slide-in-from-right_0.3s_cubic-bezier(0.25,0.46,0.45,0.94)]"
                    : "animate-[slide-in-from-left_0.3s_cubic-bezier(0.25,0.46,0.45,0.94)]",
                )}
              >
                {/* Page title */}
                {hasMultiplePages && pages[currentPage]?.title && (
                  <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                    {pages[currentPage].title}
                  </p>
                )}

                <div className="space-y-5">
                  {groupByRow(pageFields).map((rowFields) => (
                    <div
                      key={rowFields[0].rowId ?? rowFields[0].id}
                      className="grid gap-5"
                      style={{
                        gridTemplateColumns: `repeat(${rowFields.length}, 1fr)`,
                      }}
                    >
                      {rowFields.map((field) => (
                        <PlayerField
                          key={field.id}
                          field={field}
                          allFields={allSorted}
                          values={values}
                          onChange={onChange}
                          onTriggerCalculate={handleTriggerCalculate}
                          onReset={handleReset}
                          onNavigatePage={handleNavigatePage}
                          manualResults={manualResults}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Default prev/next navigation if no button handles it */}
                {hasMultiplePages && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prev}
                      disabled={currentPage === 0}
                      className="gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={next}
                      disabled={currentPage === pages.length - 1}
                      className="gap-1.5"
                    >
                      Далее
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* /card */}

          <div className="mt-10 text-center">
            <Link
              to="/calc-builder"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Создайте свой калькулятор →
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
