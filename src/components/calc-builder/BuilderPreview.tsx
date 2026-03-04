import { useState, useEffect } from "react";
import { CustomCalculator, CalcPage } from "@/types/custom-calc";
import { PlayerField } from "@/components/calc-player/PlayerField";
import { groupByRow } from "./BuilderCanvas";
import { evaluateAllFormulas } from "@/lib/calc-engine";

interface BuilderPreviewProps {
  calculator: CustomCalculator;
  currentPage?: number;
  onNavigatePage?: (target: "next" | "prev" | number) => void;
}

export function BuilderPreview({ calculator, currentPage = 0, onNavigatePage }: BuilderPreviewProps) {
  const [values, setValues] = useState<Record<string, number | string | boolean>>({});
  const [manualResults, setManualResults] = useState<Record<string, number>>({});

  const pages: CalcPage[] = calculator.pages?.length ? calculator.pages : [];

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

  const sorted = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);

  const pageId = pages[currentPage]?.id;
  const pageFields = pages.length > 0 && pageId
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
                  onNavigatePage={onNavigatePage}
                  manualResults={manualResults}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
