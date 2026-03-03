import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
    defaults.config = {
      options: [
        { label: "Вариант 1", value: "opt1" },
        { label: "Вариант 2", value: "opt2" },
      ],
    };
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

// ─── Sortable Field Item ──────────────────────────────────────

interface SortableFieldItemProps {
  field: CalcField;
  allFields: CalcField[];
  onUpdate: (updated: CalcField) => void;
  onDelete: () => void;
  isOverlay?: boolean;
}

function SortableFieldItem({ field, allFields, onUpdate, onDelete, isOverlay }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        field.colSpan === 1 ? "col-span-1" : "col-span-2",
        isDragging && !isOverlay && "opacity-30 scale-[0.98]",
        isOverlay && "shadow-2xl rotate-1 opacity-95 scale-[1.02] cursor-grabbing",
        "transition-opacity duration-150"
      )}
    >
      <FieldCard
        field={field}
        allFields={allFields}
        onChange={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ─── Builder Canvas ──────────────────────────────────────────

interface BuilderCanvasProps {
  calculator: CustomCalculator;
  onChange: (calc: CustomCalculator) => void;
}

export function BuilderCanvas({ calculator, onChange }: BuilderCanvasProps) {
  const fields = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

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

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Could add live preview here if needed
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const fromIdx = fields.findIndex((f) => f.id === active.id);
    const toIdx = fields.findIndex((f) => f.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;

    const copy = [...fields];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setFields(copy);
  };

  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        {fields.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-10 text-center text-muted-foreground">
            <p className="text-sm font-medium mb-1">Калькулятор пуст</p>
            <p className="text-xs">Добавьте первое поле с помощью меню ниже</p>
          </div>
        ) : (
          <SortableContext items={fields.map((f) => f.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-2">
              {fields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  allFields={fields}
                  onUpdate={(updated) => updateField(field.id, updated)}
                  onDelete={() => deleteField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}

        <div className="pt-2">
          <FieldTypeMenu onAdd={addField} />
        </div>
      </div>

      {/* Drag overlay — floats above everything while dragging */}
      <DragOverlay dropAnimation={{
        duration: 180,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}>
        {activeField ? (
          <SortableFieldItem
            field={activeField}
            allFields={fields}
            onUpdate={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
