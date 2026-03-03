import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { useSortable, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalcField, CalcFieldType, CustomCalculator } from "@/types/custom-calc";
import { FieldCard } from "./FieldCard";
import { FieldTypeMenu } from "./FieldTypeMenu";
import { cn } from "@/lib/utils";

// ─── Utilities ───────────────────────────────────────────────

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
    defaults.config = { options: [{ label: "Вариант 1", value: "opt1" }, { label: "Вариант 2", value: "opt2" }] };
  } else if (type === "result") {
    defaults.config = { format: "number", decimals: 2 };
  }
  return {
    id, type, label: "", key: `field_${id.slice(0, 6)}`,
    orderIndex: order, rowId: id,
    config: defaults.config ?? {},
    formula: type === "result" ? "" : undefined,
    visibility: null,
  };
}

/** Groups sorted fields into rows. Returns array of rows (each row = array of fields). */
export function groupByRow(sorted: CalcField[]): CalcField[][] {
  const rows: CalcField[][] = [];
  const seen = new Map<string, number>(); // rowId → row index
  for (const f of sorted) {
    const rid = f.rowId ?? f.id;
    if (seen.has(rid)) {
      rows[seen.get(rid)!].push(f);
    } else {
      seen.set(rid, rows.length);
      rows.push([f]);
    }
  }
  return rows;
}

type DropSide = "left" | "right" | "above" | "below";

interface DropTarget {
  id: string;
  side: DropSide;
}

/** Applies a drop operation and returns new fields array. */
function applyDrop(
  fields: CalcField[],
  activeId: string,
  overId: string,
  side: DropSide
): CalcField[] {
  const sorted = [...fields].sort((a, b) => a.orderIndex - b.orderIndex);
  const activeIdx = sorted.findIndex((f) => f.id === activeId);
  if (activeIdx === -1) return fields;

  const [moved] = sorted.splice(activeIdx, 1);
  const overIdx = sorted.findIndex((f) => f.id === overId);
  if (overIdx === -1) return fields;

  const overField = sorted[overIdx];
  const targetRowId = overField.rowId ?? overField.id;

  if (side === "left" || side === "right") {
    const rowCount = sorted.filter((f) => (f.rowId ?? f.id) === targetRowId).length;
    const insertAt = side === "right" ? overIdx + 1 : overIdx;
    if (rowCount < 4) {
      sorted.splice(insertAt, 0, { ...moved, rowId: targetRowId });
    } else {
      // Row full — insert as new row instead
      sorted.splice(insertAt, 0, { ...moved, rowId: moved.id });
    }
  } else {
    // above / below — insert as new standalone row
    const rowIndices = sorted.reduce((acc, f, i) => {
      if ((f.rowId ?? f.id) === targetRowId) acc.push(i);
      return acc;
    }, [] as number[]);
    const insertAt = side === "above" ? rowIndices[0] : rowIndices[rowIndices.length - 1] + 1;
    sorted.splice(insertAt, 0, { ...moved, rowId: moved.id });
  }

  return sorted.map((f, i) => ({ ...f, orderIndex: i }));
}

// ─── Field Card Wrapper (with drop indicators) ───────────────

interface FieldCardWrapperProps {
  field: CalcField;
  allFields: CalcField[];
  dropTarget: DropTarget | null;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  onUpdate: (updated: CalcField) => void;
  onDelete: () => void;
}

function FieldCardWrapper({ field, allFields, dropTarget, dragHandleProps, isDragging, onUpdate, onDelete }: FieldCardWrapperProps) {
  const isTarget = dropTarget?.id === field.id;
  const side = isTarget ? dropTarget!.side : null;

  return (
    <div
      className={cn(
        "relative rounded-lg transition-all duration-100",
        isDragging && "opacity-30 scale-[0.98]",
        isTarget && side === "left"  && "before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-primary before:rounded-full before:z-10",
        isTarget && side === "right" && "after:absolute after:inset-y-1 after:right-0 after:w-0.5 after:bg-primary after:rounded-full after:z-10",
        isTarget && side === "above" && "before:absolute before:inset-x-1 before:top-0 before:h-0.5 before:bg-primary before:rounded-full before:z-10",
        isTarget && side === "below" && "after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:bg-primary after:rounded-full after:z-10",
        isTarget && (side === "left" || side === "right") && "ring-1 ring-primary/30 ring-inset",
      )}
    >
      {isTarget && (side === "left" || side === "right") && (
        <div className={cn(
          "absolute inset-y-0 w-1/3 z-20 flex items-center justify-center pointer-events-none",
          side === "left" ? "left-0" : "right-0"
        )}>
          <div className="bg-primary/10 border border-primary/40 rounded text-primary text-[10px] px-1.5 py-0.5 font-medium whitespace-nowrap backdrop-blur-sm">
            {side === "left" ? "← В строку" : "В строку →"}
          </div>
        </div>
      )}
      <FieldCard
        field={field}
        allFields={allFields}
        onChange={onUpdate}
        onDelete={onDelete}
        dragHandleProps={dragHandleProps}
      />
    </div>
  );
}

// ─── Sortable Item (uses useSortable hook) ────────────────────

interface SortableFieldItemProps {
  field: CalcField;
  allFields: CalcField[];
  dropTarget: DropTarget | null;
  onUpdate: (updated: CalcField) => void;
  onDelete: () => void;
}

function SortableFieldItem({ field, allFields, dropTarget, onUpdate, onDelete }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <FieldCardWrapper
        field={field}
        allFields={allFields}
        dropTarget={dropTarget}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}

// ─── Overlay Card (no useSortable) ───────────────────────────

interface OverlayCardProps {
  field: CalcField;
  allFields: CalcField[];
}

function OverlayCard({ field, allFields }: OverlayCardProps) {
  return (
    <div className="shadow-2xl rotate-[0.8deg] opacity-95 scale-[1.02] cursor-grabbing pointer-events-none rounded-lg">
      <FieldCard
        field={field}
        allFields={allFields}
        onChange={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}

// ─── Builder Canvas ──────────────────────────────────────────

interface BuilderCanvasProps {
  calculator: CustomCalculator;
  onChange: (calc: CustomCalculator) => void;
}

const MAX_PER_ROW = 4;

export function BuilderCanvas({ calculator, onChange }: BuilderCanvasProps) {
  const fields = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

  const computeDropTarget = useCallback(
    ({ active, over }: DragMoveEvent): DropTarget | null => {
      if (!over || over.id === active.id) return null;

      const overRect = over.rect;
      const activeRect = active.rect.current.translated;
      if (!activeRect) return null;

      const activeCenter = {
        x: activeRect.left + activeRect.width / 2,
        y: activeRect.top + activeRect.height / 2,
      };
      const overCenter = {
        x: overRect.left + overRect.width / 2,
        y: overRect.top + overRect.height / 2,
      };

      const dx = activeCenter.x - overCenter.x;
      const dy = activeCenter.y - overCenter.y;

      // Prefer horizontal if the horizontal offset is noticeably larger
      const isHorizontal = Math.abs(dx) > Math.abs(dy) * 0.8;

      let side: DropSide;
      if (isHorizontal) {
        const overId = String(over.id);
        const overField = fields.find((f) => f.id === overId);
        if (overField) {
          const targetRowId = overField.rowId ?? overField.id;
          const rowCount = fields.filter((f) => (f.rowId ?? f.id) === targetRowId).length;
          if (rowCount < MAX_PER_ROW) {
            side = dx < 0 ? "left" : "right";
          } else {
            side = dy < 0 ? "above" : "below";
          }
        } else {
          side = dy < 0 ? "above" : "below";
        }
      } else {
        side = dy < 0 ? "above" : "below";
      }

      return { id: String(over.id), side };
    },
    [fields]
  );

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id);

  const handleDragMove = (event: DragMoveEvent) => {
    setDropTarget(computeDropTarget(event));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setDropTarget(null);
    if (!over || !dropTarget || active.id === over.id) return;
    setFields(applyDrop(fields, String(active.id), String(over.id), dropTarget.side));
  };

  const handleDragCancel = () => { setActiveId(null); setDropTarget(null); };

  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;
  const rows = groupByRow(fields);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-2">
        {fields.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-10 text-center text-muted-foreground">
            <p className="text-sm font-medium mb-1">Калькулятор пуст</p>
            <p className="text-xs">Добавьте первое поле с помощью меню ниже</p>
          </div>
        ) : (
          <SortableContext items={fields.map((f) => f.id)} strategy={rectSortingStrategy}>
            <div className="space-y-2">
              {rows.map((rowFields) => (
                <div
                  key={rowFields[0].rowId ?? rowFields[0].id}
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${rowFields.length}, 1fr)` }}
                >
                  {rowFields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      allFields={fields}
                      dropTarget={dropTarget}
                      onUpdate={(updated) => updateField(field.id, updated)}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </SortableContext>
        )}

        <div className="pt-2">
          <FieldTypeMenu onAdd={addField} />
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 160, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeField ? (
          <SortableFieldItem
            field={activeField}
            allFields={fields}
            dropTarget={null}
            onUpdate={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
