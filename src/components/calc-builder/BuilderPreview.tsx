import { useState, useEffect } from "react";
import { CustomCalculator } from "@/types/custom-calc";
import { PlayerField } from "@/components/calc-player/PlayerField";
import { cn } from "@/lib/utils";

interface BuilderPreviewProps {
  calculator: CustomCalculator;
}

export function BuilderPreview({ calculator }: BuilderPreviewProps) {
  const [values, setValues] = useState<Record<string, number | string | boolean>>({});

  // Initialize defaults
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

  const sorted = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div>
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Добавьте поля в калькулятор
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sorted.map((field) => (
            <div
              key={field.id}
              className={cn(field.colSpan === 1 ? "col-span-1" : "col-span-2")}
            >
              <PlayerField
                field={field}
                allFields={sorted}
                values={values}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
