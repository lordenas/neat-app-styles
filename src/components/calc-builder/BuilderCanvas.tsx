import { useState, useRef } from "react";
import { CalcField, CalcFieldType, CustomCalculator } from "@/types/custom-calc";
import { FieldCard } from "./FieldCard";
import { FieldTypeMenu } from "./FieldTypeMenu";
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
    colSpan: 2,
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

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    // Slight delay so ghost image captures the element
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnter = (id: string) => {
    if (id !== dragId) setOverId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    const fromIdx = fields.findIndex((f) => f.id === dragId);
    const toIdx = fields.findIndex((f) => f.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const copy = [...fields];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setFields(copy);

    setDragId(null);
    setOverId(null);
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = "";
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className="space-y-2">
      {fields.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-10 text-center text-muted-foreground">
          <p className="text-sm font-medium mb-1">Калькулятор пуст</p>
          <p className="text-xs">Добавьте первое поле с помощью меню ниже</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {fields.map((field) => {
            const isDragging = dragId === field.id;
            const isOver = overId === field.id;
            return (
              <div
                key={field.id}
                ref={isDragging ? dragNode : null}
                className={cn(
                  "transition-all duration-150",
                  field.colSpan === 1 ? "col-span-1" : "col-span-2",
                  isDragging && "opacity-40",
                  isOver && "ring-2 ring-primary ring-offset-1 rounded-lg"
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, field.id)}
                onDragEnter={() => handleDragEnter(field.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, field.id)}
                onDragEnd={handleDragEnd}
              >
                <FieldCard
                  field={field}
                  allFields={fields}
                  onChange={(updated) => updateField(field.id, updated)}
                  onDelete={() => deleteField(field.id)}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2">
        <FieldTypeMenu onAdd={addField} />
      </div>
    </div>
  );
}
