import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  "Разработка",
  "Дизайн",
  "Управление",
  "Аналитика",
  "Тестирование",
  "DevOps",
  "Маркетинг",
  "Поддержка",
];

export function MultiselectShowcase() {
  const [selected, setSelected] = useState<string[]>(["Разработка", "Дизайн"]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((s) => s !== option) : [...prev, option]
    );
  };

  const remove = (option: string) => {
    setSelected((prev) => prev.filter((s) => s !== option));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Multiselect</Label>
        <div ref={ref} className="relative">
          <div
            className={cn(
              "flex flex-wrap items-center gap-1 min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-1.5 cursor-pointer transition-colors",
              open && "ring-2 ring-ring ring-offset-2 ring-offset-background"
            )}
            onClick={() => setOpen(!open)}
          >
            {selected.length === 0 && (
              <span className="text-sm text-muted-foreground">Выберите опции...</span>
            )}
            {selected.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(s);
                }}
              >
                {s}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <ChevronDown className={cn(
              "ml-auto h-4 w-4 text-muted-foreground shrink-0 transition-transform",
              open && "rotate-180"
            )} />
          </div>

          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md animate-fade-in">
              <div className="py-1 max-h-48 overflow-auto">
                {options.map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <div
                      key={option}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent",
                        isSelected && "text-primary"
                      )}
                      onClick={() => toggle(option)}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-primary border-primary" : "border-input"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <p className="helper-text">Выбрано: {selected.length} из {options.length}</p>
      </div>
    </div>
  );
}
