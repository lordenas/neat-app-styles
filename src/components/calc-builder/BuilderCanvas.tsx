import { useState } from "react";
import { CalcField, CalcFieldType, CustomCalculator } from "@/types/custom-calc";
import { FieldCard } from "./FieldCard";
import { FieldTypeMenu } from "./FieldTypeMenu";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

function nanoid(len = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function createField(type: CalcFieldType, order: number): CalcField {
  const id = nanoid();
  const defaults: Partial<CalcField> = {};

  if (type === "number" || type === "slider") {
    defaults.config = { min: 0, max: 1000000, step: 1 };
  } else if (type === "select" || type === "radio") {
    defaults.config = { options: [
      { label: "Вариант 1", value: "opt1" },
      { label: "Вариант 2", value: "opt2" },
    ]};
  } else if (type === "result") {
    defaults.config = { format: "number", decimals: 2 };
  }

  return {
    id,
    type,
    label: "",
    key: `field_${id.slice(0, 6)}`,
    orderIndex: order,
    config: defaults.config ?? {},
    formula: type === "result" ? "" : undefined,
    visibility: null,
  };
}

interface BuilderCanvasProps {
  calculator: CustomCalculator;
  onChange: (calc: CustomCalculator) => void;
}

export function BuilderCanvas({ calculator, onChange }: BuilderCanvasProps) {
  const fields = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);

  const setFields = (newFields: CalcField[]) =>
    onChange({ ...calculator, fields: newFields.map((f, i) => ({ ...f, orderIndex: i })) });

  const addField = (type: CalcFieldType) => {
    const newField = createField(type, fields.length);
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updated: CalcField) =>
    setFields(fields.map((f) => (f.id === id ? updated : f)));

  const deleteField = (id: string) =>
    setFields(fields.filter((f) => f.id !== id));

  const moveField = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const copy = [...fields];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setFields(copy);
  };

  return (
    <div className="space-y-2">
      {fields.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-10 text-center text-muted-foreground">
          <p className="text-sm font-medium mb-1">Калькулятор пуст</p>
          <p className="text-xs">Добавьте первое поле с помощью меню ниже</p>
        </div>
      ) : (
        fields.map((field, i) => (
          <div key={field.id} className="flex gap-1 items-start">
            {/* Move buttons */}
            <div className="flex flex-col gap-0.5 pt-2 shrink-0">
              <Button
                variant="ghost" size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => moveField(i, -1)}
                disabled={i === 0}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => moveField(i, 1)}
                disabled={i === fields.length - 1}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <FieldCard
                field={field}
                allFields={fields}
                onChange={(updated) => updateField(field.id, updated)}
                onDelete={() => deleteField(field.id)}
              />
            </div>
          </div>
        ))
      )}

      <div className="pt-2">
        <FieldTypeMenu onAdd={addField} />
      </div>
    </div>
  );
}
