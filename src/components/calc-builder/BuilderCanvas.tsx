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
import { useSortable, SortableContext } from "@dnd-kit/sortable";
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
  id: string;       // field id (for left/right) or rowId (for above/below)
  side: DropSide;
  rowId?: string;   // always set for above/below
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

// ─── Field Card Wrapper ───────────────────────────────────────

interface FieldCardWrapperProps {
  field: CalcField;
  isSelected: boolean;
  dropTarget: DropTarget | null;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  onSelect: () => void;
}

function FieldCardWrapper({ field, isSelected, dropTarget, dragHandleProps, isDragging, onSelect }: FieldCardWrapperProps) {
  const isTarget = dropTarget?.id === field.id && (dropTarget?.side === "left" || dropTarget?.side === "right");
  const side = isTarget ? dropTarget!.side : null;

  return (
    <div
      className={cn(
        "relative rounded-lg transition-all duration-150",
        isTarget && side === "left"  && "before:absolute before:inset-y-0 before:-left-1 before:w-1 before:bg-primary before:rounded-full before:z-10 before:shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]",
        isTarget && side === "right" && "after:absolute after:inset-y-0 after:-right-1 after:w-1 after:bg-primary after:rounded-full after:z-10 after:shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]",
        isTarget && "ring-2 ring-primary/50 ring-inset",
      )}
    >
      <FieldCard
        field={field}
        isSelected={isSelected}
        onSelect={onSelect}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      />
    </div>
  );
}

// ─── Sortable Item ────────────────────────────────────────────

interface SortableFieldItemProps {
  field: CalcField;
  isSelected: boolean;
  dropTarget: DropTarget | null;
  onSelect: () => void;
}

function SortableFieldItem({ field, isSelected, dropTarget, onSelect }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = isDragging
    ? { transition, opacity: 0.25 }
    : { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} data-field-id={field.id}>
      <FieldCardWrapper
        field={field}
        isSelected={isSelected}
        dropTarget={dropTarget}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        onSelect={onSelect}
      />
    </div>
  );
}

// ─── Overlay Card ─────────────────────────────────────────────

function OverlayCard({ field }: { field: CalcField }) {
  return (
    <div className="shadow-2xl rotate-[0.8deg] opacity-95 scale-[1.02] cursor-grabbing pointer-events-none rounded-lg">
      <FieldCard
        field={field}
        isSelected={false}
        onSelect={() => {}}
      />
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────

function DropPlaceholder({ inline }: { inline?: boolean }) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-primary/60 rounded-lg bg-primary/5",
        "flex items-center justify-center",
        "animate-fade-in",
        inline ? "h-full min-h-[4rem]" : "h-16 w-full"
      )}
    >
      <span className="text-xs text-primary/70 font-medium select-none">Сюда</span>
    </div>
  );
}

// ─── Builder Canvas ──────────────────────────────────────────

interface BuilderCanvasProps {
  calculator: CustomCalculator;
  onChange: (calc: CustomCalculator) => void;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
}

const MAX_PER_ROW = 4;

/**
 * Returns the Y-center of the row containing the given field, based on DOM rects.
 * Used to determine if the cursor is in the same horizontal band as a row.
 */
function getRowYCenter(rowFields: CalcField[]): { top: number; bottom: number } | null {
  let minTop = Infinity, maxBottom = -Infinity;
  for (const f of rowFields) {
    const el = document.querySelector(`[data-field-id="${f.id}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top < minTop) minTop = r.top;
    if (r.bottom > maxBottom) maxBottom = r.bottom;
  }
  return minTop === Infinity ? null : { top: minTop, bottom: maxBottom };
}

export function BuilderCanvas({ calculator, onChange, selectedFieldId, onSelectField }: BuilderCanvasProps) {
  const fields = [...calculator.fields].sort((a, b) => a.orderIndex - b.orderIndex);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  // Debounce ref: prevents flickering by only updating dropTarget after a brief stable period
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTargetRef = useRef<DropTarget | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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
    ({ active, over, activatorEvent, delta }: DragMoveEvent): DropTarget | null => {
      const activeRect = active.rect.current.translated;
      if (!activeRect) return null;

      // Use actual cursor position (activator + delta) instead of dragged element center
      // This makes large blocks behave the same as small ones
      const pointerEvent = activatorEvent as PointerEvent;
      const cursorX = pointerEvent.clientX + delta.x;
      const cursorY = pointerEvent.clientY + delta.y;

      const rows = groupByRow(fields);
      const activeFieldId = String(active.id);

      // ── Step 1: Find which row the cursor is vertically closest to ──
      // Score each row by vertical distance from cursorY to row center.
      // If cursorY is within the row's Y-band, score = 0 (same row).
      let bestRowScore = Infinity;
      let bestRow: CalcField[] | null = null;

      for (const row of rows) {
        // Skip rows that only contain the active field
        const otherFields = row.filter((f) => f.id !== activeFieldId);
        if (otherFields.length === 0) continue;

        const bounds = getRowYCenter(row);
        if (!bounds) continue;

        const rowMid = (bounds.top + bounds.bottom) / 2;
        // If cursor is inside the row band, vertical score = 0 (strong preference)
        const vertScore = cursorY >= bounds.top - 8 && cursorY <= bounds.bottom + 8
          ? 0
          : Math.abs(cursorY - rowMid);

        if (vertScore < bestRowScore) {
          bestRowScore = vertScore;
          bestRow = row;
        }
      }

      if (!bestRow) return null;

      const otherInRow = bestRow.filter((f) => f.id !== activeFieldId);
      if (otherInRow.length === 0) return null;

      const overRowBounds = getRowYCenter(bestRow);
      const inSameRowBand = overRowBounds
        ? cursorY >= overRowBounds.top - 8 && cursorY <= overRowBounds.bottom + 8
        : false;

      // ── Step 2 (vertical edge): top/bottom 20% of any field → above/below row ──
      // Check against the closest field vertically to see if we're in edge zone
      const firstEl = document.querySelector(`[data-field-id="${otherInRow[0].id}"]`);
      if (firstEl && inSameRowBand) {
        const firstRect = firstEl.getBoundingClientRect();
        const relY = cursorY - firstRect.top;
        if (relY < firstRect.height * 0.20 || relY > firstRect.height * 0.80) {
          const rowId = otherInRow[0].rowId ?? otherInRow[0].id;
          const dy = cursorY - (firstRect.top + firstRect.height / 2);
          return { id: otherInRow[0].id, side: dy < 0 ? "above" : "below", rowId };
        }
      }

      if (!inSameRowBand) {
        // Between rows → pick closest field vertically, then above/below
        let closestF = otherInRow[0];
        let closestDY = Infinity;
        for (const f of otherInRow) {
          const el = document.querySelector(`[data-field-id="${f.id}"]`);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const d = Math.abs(cursorY - (r.top + r.height / 2));
          if (d < closestDY) { closestDY = d; closestF = f; }
        }
        const rowId = closestF.rowId ?? closestF.id;
        const el = document.querySelector(`[data-field-id="${closestF.id}"]`);
        const dy = el ? cursorY - (el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2) : -1;
        return { id: closestF.id, side: dy < 0 ? "above" : "below", rowId };
      }

      // ── Step 3: Find the nearest GAP between fields (not field center) ──
      // Build list of rects for all fields in row (excluding active)
      type FieldRect = { field: CalcField; left: number; right: number; cx: number };
      const rects: FieldRect[] = [];
      for (const f of otherInRow) {
        const el = document.querySelector(`[data-field-id="${f.id}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        rects.push({ field: f, left: r.left, right: r.right, cx: r.left + r.width / 2 });
      }
      if (rects.length === 0) return null;

      // Sort left-to-right
      rects.sort((a, b) => a.cx - b.cx);

      // Build gaps: [before first, between each pair, after last]
      // Each gap: { x: gap center X, fieldId: adjacent field id, side }
      type Gap = { x: number; fieldId: string; side: "left" | "right" };
      const gaps: Gap[] = [];

      // Before first field
      gaps.push({ x: rects[0].left - 20, fieldId: rects[0].field.id, side: "left" });

      // Between consecutive fields
      for (let i = 0; i < rects.length - 1; i++) {
        const gapX = (rects[i].right + rects[i + 1].left) / 2;
        // "right of i" and "left of i+1" are the same gap — use the one that makes more sense
        // We anchor to the field cursor is closer to
        const distToI = Math.abs(cursorX - rects[i].cx);
        const distToNext = Math.abs(cursorX - rects[i + 1].cx);
        if (distToI <= distToNext) {
          gaps.push({ x: gapX, fieldId: rects[i].field.id, side: "right" });
        } else {
          gaps.push({ x: gapX, fieldId: rects[i + 1].field.id, side: "left" });
        }
      }

      // After last field
      gaps.push({ x: rects[rects.length - 1].right + 20, fieldId: rects[rects.length - 1].field.id, side: "right" });

      // Find the nearest gap
      let bestGap = gaps[0];
      let bestGapDist = Math.abs(cursorX - gaps[0].x);
      for (const gap of gaps) {
        const d = Math.abs(cursorX - gap.x);
        if (d < bestGapDist) { bestGapDist = d; bestGap = gap; }
      }

      // Check capacity
      const targetRowId = otherInRow[0].rowId ?? otherInRow[0].id;
      const rowCountWithoutActive = fields.filter(
        (f) => (f.rowId ?? f.id) === targetRowId && f.id !== activeFieldId
      ).length;
      const activeField = fields.find((f) => f.id === activeFieldId);
      const activeInSameRow = activeField && (activeField.rowId ?? activeField.id) === targetRowId;

      if (rowCountWithoutActive < MAX_PER_ROW || activeInSameRow) {
        return { id: bestGap.fieldId, side: bestGap.side };
      }

      // Row full → above/below
      const rowId = targetRowId;
      return { id: bestGap.fieldId, side: cursorY < (overRowBounds ? (overRowBounds.top + overRowBounds.bottom) / 2 : 0) ? "above" : "below", rowId };
    },
    [fields]
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setDropTarget(null);
  };

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const target = computeDropTarget(event);
      pendingTargetRef.current = target;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDropTarget(pendingTargetRef.current);
      }, 40); // 40ms debounce — snappy but no flicker
    },
    [computeDropTarget]
  );

  const handleDragEnd = ({ active }: DragEndEvent) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const pending = pendingTargetRef.current ?? dropTarget;
    setActiveId(null);
    setDropTarget(null);
    pendingTargetRef.current = null;
    if (!pending || pending.id === String(active.id)) return;
    setFields(applyDrop(fields, String(active.id), pending.id, pending.side));
  };

  const handleDragCancel = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setActiveId(null);
    setDropTarget(null);
    pendingTargetRef.current = null;
  };

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
          <SortableContext items={fields.map((f) => f.id)} strategy={() => null}>
            <div className="space-y-3">
              {rows.map((rowFields) => {
                const rowId = rowFields[0].rowId ?? rowFields[0].id;
                const isRowAbove = dropTarget?.rowId === rowId && dropTarget?.side === "above";
                const isRowBelow = dropTarget?.rowId === rowId && dropTarget?.side === "below";

                // Inject horizontal placeholders
                const rowItems: Array<{ key: string; type: "field" | "placeholder"; field?: CalcField }> = [];
                for (const field of rowFields) {
                  const isLeftTarget = dropTarget?.id === field.id && dropTarget?.side === "left";
                  const isRightTarget = dropTarget?.id === field.id && dropTarget?.side === "right";
                  if (isLeftTarget) rowItems.push({ key: `ph-left-${field.id}`, type: "placeholder" });
                  rowItems.push({ key: field.id, type: "field", field });
                  if (isRightTarget) rowItems.push({ key: `ph-right-${field.id}`, type: "placeholder" });
                }

                const draggingField = activeId ? fields.find((f) => f.id === String(activeId)) : null;
                const activeRowId = draggingField ? (draggingField.rowId ?? draggingField.id) : null;
                const isActiveRow = activeRowId === rowId;
                const showAbovePlaceholder = isRowAbove && !isActiveRow;
                const showBelowPlaceholder = isRowBelow && !isActiveRow;

                return (
                  <div key={rowId} className="space-y-3">
                    {/* Placeholder row ABOVE */}
                    {showAbovePlaceholder && <DropPlaceholder />}

                    <div
                      className="relative grid gap-2 transition-all duration-150"
                      style={{ gridTemplateColumns: `repeat(${rowItems.length}, 1fr)` }}
                    >
                      {rowItems.map((item) =>
                        item.type === "placeholder" ? (
                          <DropPlaceholder key={item.key} inline />
                        ) : (
                          <SortableFieldItem
                            key={item.field!.id}
                            field={item.field!}
                            allFields={fields}
                            dropTarget={dropTarget}
                            onUpdate={(updated) => updateField(item.field!.id, updated)}
                            onDelete={() => deleteField(item.field!.id)}
                          />
                        )
                      )}
                    </div>

                    {/* Placeholder row BELOW */}
                    {showBelowPlaceholder && <DropPlaceholder />}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        )}

        <div className="pt-2">
          <FieldTypeMenu onAdd={addField} />
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeField ? (
          <OverlayCard field={activeField} allFields={fields} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
