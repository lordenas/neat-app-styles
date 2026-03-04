import { useState, useEffect } from "react";
import { CustomCalculator } from "@/types/custom-calc";
import { PlayerField } from "@/components/calc-player/PlayerField";
import { groupByRow } from "./BuilderCanvas";

interface BuilderPreviewProps {
  calculator: CustomCalculator;
}

export function BuilderPreview({ calculator }: BuilderPreviewProps) {
  const [values, setValues] = useState<Record<string, number | string | boolean>>({});

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
  };

  const sorted = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);
  const rows = groupByRow(sorted);

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
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
