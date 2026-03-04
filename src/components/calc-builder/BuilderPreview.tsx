import { useState, useEffect } from "react";
import { CustomCalculator, CalcPage } from "@/types/custom-calc";
import { PlayerField } from "@/components/calc-player/PlayerField";
import { groupByRow } from "./BuilderCanvas";
import { evaluateAllFormulas, resolveVisibility } from "@/lib/calc-engine";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuilderPreviewProps {
  calculator: CustomCalculator;
}

export function BuilderPreview({ calculator }: BuilderPreviewProps) {
  const [values, setValues] = useState<Record<string, number | string | boolean>>({});
  const [manualResults, setManualResults] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);

  const pages: CalcPage[] = calculator.pages?.length ? calculator.pages : [];
  const totalPages = pages.length;

  useEffect(() => {
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
    setManualResults({});
    setCurrentPage(0);
  }, [calculator.fields.length]);

  const onChange = (key: string, value: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    const defaults: Record<string, number | string | boolean> = {};
    for (const field of calculator.fields) {
      if (field.type === "result" || field.type === "button" || field.type === "label") continue;
      const def = field.config.defaultValue;
      if (def !== undefined) defaults[field.key] = def;
      else if (field.type === "number" || field.type === "slider") defaults[field.key] = field.config.min ?? 0;
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
    const allFields = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);
    const results = evaluateAllFormulas(allFields, values);
    const manualFields = allFields.filter(
      (f) => f.type === "result" && f.config.manualCalculation
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

  const goTo = (target: number) => {
    if (target < 0 || target >= totalPages) return;
    setCurrentPage(target);
  };

  const handleNavigatePage = (target: "next" | "prev" | number) => {
    if (target === "next") goTo(currentPage + 1);
    else if (target === "prev") goTo(currentPage - 1);
    else goTo(target);
  };

  const sorted = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);

  // Filter fields for current page
  const pageId = pages[currentPage]?.id;
  const pageFields = totalPages > 0 && pageId
    ? sorted.filter((f) => (f.pageId ?? pages[0]?.id) === pageId)
    : sorted;

  const rows = groupByRow(pageFields);

  return (
    <div>
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Добавьте поля в калькулятор
        </div>
      ) : (
        <div className="space-y-4">
          {/* Page progress dots */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === currentPage
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {pages[currentPage]?.title || `Страница ${currentPage + 1}`} · {currentPage + 1} / {totalPages}
              </span>
            </div>
          )}

          {rows.map((rowFields) => (
            <div
              key={rowFields[0].rowId ?? rowFields[0].id}
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${rowFields.length}, 1fr)` }}
            >
              {rowFields.map((field) => (
                <PlayerField
                  key={field.id}
                  field={field}
                  allFields={sorted}
                  values={values}
                  onChange={onChange}
                  onReset={handleReset}
                  onTriggerCalculate={handleTriggerCalculate}
                  onNavigatePage={handleNavigatePage}
                  manualResults={manualResults}
                />
              ))}
            </div>
          ))}

          {/* Prev/Next nav */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="gap-1.5"
              >
                Далее
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
