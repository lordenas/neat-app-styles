import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Badge } from "./badge";
import { Label } from "./label";
import { X, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../../lib/utils";

/** Склонение слова «элемент» по числу */
function pluralizeElement(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "элементов";
  if (last > 1 && last < 5) return "элемента";
  if (last === 1) return "элемент";
  return "элементов";
}

/**
 * Опция для компонента Multiselect.
 *
 * @prop value - Уникальное значение опции
 * @prop label - Отображаемый текст
 * @prop disabled - Блокирует выбор/снятие опции
 * @prop group - Имя группы для визуальной группировки в списке
 */
export interface MultiselectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Пропсы компонента Multiselect.
 */
export interface MultiselectProps {
  /** Метка поля */
  label: string;
  /** Массив опций с поддержкой `disabled` и `group` */
  options: MultiselectOption[];
  /** Текущие выбранные значения (массив `value`) */
  selected: string[];
  /** Колбэк при изменении выбора */
  onSelectedChange: (val: string[]) => void;
  /** Макс. количество отображаемых тегов. При превышении — текст «Выбрано N элементов» */
  maxDisplayed?: number;
  /** Плейсхолдер при пустом выборе */
  placeholder?: string;
  /** Включить поле поиска в выпадающем списке (по умолчанию `false`) */
  searchable?: boolean;
  /** Плейсхолдер поля поиска */
  searchPlaceholder?: string;
}

/**
 * Мульти-выбор с Badge-тегами и выпадающим списком.
 *
 * Поддерживает:
 * - Поиск/фильтрацию через `searchable`
 * - Группировку опций через `group`
 * - Блокировку отдельных опций через `disabled`
 * - Свёртку тегов через `maxDisplayed`
 * - Удаление тегов по клику на ×
 * - Закрытие по клику вне компонента
 *
 * @example
 * ```tsx
 * // Базовый
 * <Multiselect
 *   label="Отделы"
 *   options={[
 *     { value: "dev", label: "Разработка" },
 *     { value: "design", label: "Дизайн" },
 *   ]}
 *   selected={selected}
 *   onSelectedChange={setSelected}
 * />
 *
 * // С группами и disabled
 * <Multiselect
 *   label="Технологии"
 *   options={[
 *     { value: "react", label: "React", group: "Frontend" },
 *     { value: "vue", label: "Vue", group: "Frontend" },
 *     { value: "angular", label: "Angular", group: "Frontend", disabled: true },
 *     { value: "node", label: "Node.js", group: "Backend" },
 *   ]}
 *   selected={["react"]}
 *   onSelectedChange={setSelected}
 *   maxDisplayed={3}
 * />
 * ```
 */
export function Multiselect({
  label,
  options,
  selected,
  onSelectedChange,
  maxDisplayed,
  placeholder = "Выберите опции...",
  searchable = false,
  searchPlaceholder = "Поиск...",
}: MultiselectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setHighlightIndex(-1);
      if (searchable && searchRef.current) {
        searchRef.current.focus();
      }
    }
    if (!open) setSearch("");
  }, [open, searchable]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

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

  // Group filtered options
  const groups = new Map<string, MultiselectOption[]>();
  const ungrouped: MultiselectOption[] = [];
  for (const opt of filteredOptions) {
    if (opt.group) {
      const arr = groups.get(opt.group) || [];
      arr.push(opt);
      groups.set(opt.group, arr);
    } else {
      ungrouped.push(opt);
    }
  }

  // Flat list for keyboard navigation
  const flatOptions = useMemo(() => {
    const result: MultiselectOption[] = [...ungrouped];
    for (const opts of groups.values()) {
      result.push(...opts);
    }
    return result;
  }, [ungrouped, groups]);

  const hasResults = ungrouped.length > 0 || groups.size > 0;

  // Scroll highlight into view
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-multiselect-option]");
    items[highlightIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    const total = flatOptions.length;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % total);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + total) % total);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < total) {
          const opt = flatOptions[highlightIndex];
          if (!opt.disabled) toggle(opt.value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }, [open, flatOptions, highlightIndex, toggle]);

  // Track flat index for each option
  let flatIdx = -1;

  const renderOption = (option: MultiselectOption) => {
    const isSelected = selected.includes(option.value);
    const currentIdx = flatOptions.indexOf(option);
    return (
      <div
        key={option.value}
        data-multiselect-option
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
          option.disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-accent",
          isSelected && !option.disabled && "text-primary",
          currentIdx === highlightIndex && !option.disabled && "bg-accent",
        )}
        onClick={() => !option.disabled && toggle(option.value)}
        onMouseEnter={() => !option.disabled && setHighlightIndex(currentIdx)}
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
          tabIndex={0}
          className={cn(
            "flex flex-wrap items-center gap-1 min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-1.5 cursor-pointer transition-colors",
            open && "ring-2 ring-ring ring-offset-2 ring-offset-background"
          )}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
        >
          {selected.length === 0 && (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
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
            {searchable && (
              <div className="p-2 border-b">
                <div className="flex items-center gap-2 px-2 rounded-md border border-input bg-background">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={searchPlaceholder}
                    className="flex-1 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSearch(""); }}
                      className="shrink-0"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div ref={listRef} className="py-1 max-h-48 overflow-auto">
              {!hasResults && (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  Ничего не найдено
                </div>
              )}
              {ungrouped.map(renderOption)}
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
    </div>
  );
}
