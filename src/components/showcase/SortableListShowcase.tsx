import { useState, useCallback } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableItem {
  id: string;
  label: string;
}

const initialItems: SortableItem[] = [
  { id: "1", label: "📋 Дизайн макетов" },
  { id: "2", label: "⚙️ Настройка CI/CD" },
  { id: "3", label: "🔍 Code Review" },
  { id: "4", label: "📝 Написание тестов" },
  { id: "5", label: "🚀 Деплой на прод" },
];

export function SortableListShowcase() {
  const [items, setItems] = useState(initialItems);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverId(id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    setItems((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === dragId);
      const toIndex = prev.findIndex((i) => i.id === targetId);
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDragId(null);
    setOverId(null);
  }, [dragId]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setOverId(null);
  }, []);

  return (
    <div className="space-y-3 max-w-md">
      <p className="text-xs text-muted-foreground">Перетащите элементы для изменения порядка</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-sm cursor-grab active:cursor-grabbing transition-all",
              dragId === item.id && "opacity-50 scale-95",
              overId === item.id && dragId !== item.id && "border-primary ring-1 ring-primary/30"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Порядок: {items.map((i) => i.id).join(" → ")}
      </p>
    </div>
  );
}
