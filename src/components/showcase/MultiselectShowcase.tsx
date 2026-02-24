import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Склонение слова «элемент» по числу */
function pluralizeElement(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "элементов";
  if (last > 1 && last < 5) return "элемента";
  if (last === 1) return "элемент";
  return "элементов";
}

export interface MultiselectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Мульти-выбор с Badge-тегами и выпадающим списком.
 *
 * @prop options - Массив опций с поддержкой disabled и group
 * @prop selected - Текущие выбранные значения
 * @prop onSelectedChange - Колбэк изменения выбора
 * @prop maxDisplayed - Макс. кол-во тегов
 * @prop label - Метка поля
 *
 * @example
 * ```tsx
 * <Multiselect
 *   label="Отделы"
 *   options={[
 *     { value: "dev", label: "Разработка", group: "Технологии" },
 *     { value: "design", label: "Дизайн", group: "Технологии" },
 *     { value: "hr", label: "HR", group: "Бизнес", disabled: true },
 *   ]}
 *   selected={["dev"]}
 *   onSelectedChange={setSelected}
 * />
 * ```
 */
function Multiselect({
  label,
  options,
  selected,
  onSelectedChange,
  maxDisplayed,
}: {
  label: string;
  options: MultiselectOption[];
  selected: string[];
  onSelectedChange: (val: string[]) => void;
  maxDisplayed?: number;
}) {
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

  const toggle = (value: string) => {
    const opt = options.find((o) => o.value === value);
    if (opt?.disabled) return;
    onSelectedChange(
      selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]
    );
  };

  const remove = (value: string) => {
    const opt = options.find((o) => o.value === value);
    if (opt?.disabled) return;
    onSelectedChange(selected.filter((s) => s !== value));
  };

  const getLabel = (value: string) => options.find((o) => o.value === value)?.label ?? value;

  const showCollapsed = maxDisplayed !== undefined && selected.length > maxDisplayed;

  // Group options
  const groups = new Map<string, MultiselectOption[]>();
  const ungrouped: MultiselectOption[] = [];
  for (const opt of options) {
    if (opt.group) {
      const arr = groups.get(opt.group) || [];
      arr.push(opt);
      groups.set(opt.group, arr);
    } else {
      ungrouped.push(opt);
    }
  }

  const renderOption = (option: MultiselectOption) => {
    const isSelected = selected.includes(option.value);
    return (
      <div
        key={option.value}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
          option.disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-accent",
          isSelected && !option.disabled && "text-primary"
        )}
        onClick={() => !option.disabled && toggle(option.value)}
      >
        <div className={cn(
          "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
          isSelected ? "bg-primary border-primary" : "border-input",
          option.disabled && "opacity-50"
        )}>
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        {option.label}
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
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
          {showCollapsed ? (
            <span className="text-sm text-foreground">
              Выбрано {selected.length} {pluralizeElement(selected.length)}
            </span>
          ) : (
            selected.map((s) => {
              const opt = options.find((o) => o.value === s);
              return (
                <Badge
                  key={s}
                  variant="secondary"
                  className={cn("gap-1 text-xs", opt?.disabled && "opacity-60")}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(s);
                  }}
                >
                  {getLabel(s)}
                  {!opt?.disabled && <X className="h-3 w-3" />}
                </Badge>
              );
            })
          )}
          <ChevronDown className={cn(
            "ml-auto h-4 w-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )} />
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md animate-fade-in">
            <div className="py-1 max-h-48 overflow-auto">
              {/* Ungrouped options first */}
              {ungrouped.map(renderOption)}

              {/* Grouped options */}
              {Array.from(groups.entries()).map(([group, opts]) => (
                <div key={group}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group}
                  </div>
                  {opts.map(renderOption)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="helper-text">Выбрано: {selected.length} из {options.length}</p>
    </div>
  );
}

/* ─── Showcase data ─── */
const flatOptions: MultiselectOption[] = [
  { value: "dev", label: "Разработка" },
  { value: "design", label: "Дизайн" },
  { value: "mgmt", label: "Управление" },
  { value: "analytics", label: "Аналитика" },
  { value: "qa", label: "Тестирование" },
  { value: "devops", label: "DevOps" },
  { value: "marketing", label: "Маркетинг" },
  { value: "support", label: "Поддержка" },
];

const groupedOptions: MultiselectOption[] = [
  { value: "react", label: "React", group: "Frontend" },
  { value: "vue", label: "Vue", group: "Frontend" },
  { value: "angular", label: "Angular", group: "Frontend", disabled: true },
  { value: "node", label: "Node.js", group: "Backend" },
  { value: "python", label: "Python", group: "Backend" },
  { value: "go", label: "Go", group: "Backend", disabled: true },
  { value: "postgres", label: "PostgreSQL", group: "Database" },
  { value: "mongo", label: "MongoDB", group: "Database" },
  { value: "redis", label: "Redis", group: "Database" },
];

const disabledOptions: MultiselectOption[] = [
  { value: "free", label: "Бесплатный" },
  { value: "starter", label: "Стартер" },
  { value: "pro", label: "Pro", disabled: true },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

export function MultiselectShowcase() {
  const [selected1, setSelected1] = useState<string[]>(["dev", "design"]);
  const [selected2, setSelected2] = useState<string[]>(["react", "node", "angular", "postgres"]);
  const [selected3, setSelected3] = useState<string[]>(["free", "pro"]);

  return (
    <div className="space-y-6">
      <Multiselect
        label="Multiselect (базовый)"
        options={flatOptions}
        selected={selected1}
        onSelectedChange={setSelected1}
      />
      <Multiselect
        label="С группами и disabled (maxDisplayed=3)"
        options={groupedOptions}
        selected={selected2}
        onSelectedChange={setSelected2}
        maxDisplayed={3}
      />
      <Multiselect
        label="С заблокированными опциями"
        options={disabledOptions}
        selected={selected3}
        onSelectedChange={setSelected3}
      />
    </div>
  );
}
