import * as React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Опция для Combobox.
 */
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Автокомплит / Combobox с поиском, creatable и disabled опциями.
 *
 * @example
 * ```tsx
 * <Combobox
 *   options={[{ value: "react", label: "React" }, { value: "vue", label: "Vue" }]}
 *   value={value}
 *   onValueChange={setValue}
 *   placeholder="Выберите фреймворк..."
 * />
 *
 * <Combobox options={options} value={val} onValueChange={setVal} creatable />
 * ```
 *
 * @prop options - Массив опций
 * @prop value - Текущее значение
 * @prop onValueChange - Колбэк при выборе
 * @prop placeholder - Текст-заглушка кнопки
 * @prop searchPlaceholder - Текст-заглушка поиска
 * @prop creatable - Разрешить создание новых опций
 * @prop onCreateOption - Колбэк при создании
 * @prop disabled - Заблокировать компонент
 * @prop emptyText - Текст при отсутствии результатов
 */
export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  creatable?: boolean;
  onCreateOption?: (value: string) => void;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Выберите...",
  searchPlaceholder = "Поиск...",
  creatable = false,
  onCreateOption,
  disabled = false,
  emptyText = "Ничего не найдено",
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const canCreate =
    creatable &&
    search.trim() &&
    !options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  const handleSelect = useCallback(
    (val: string) => {
      onValueChange?.(val === value ? "" : val);
      setOpen(false);
    },
    [onValueChange, value],
  );

  const handleCreate = useCallback(() => {
    const trimmed = search.trim();
    if (!trimmed) return;
    onCreateOption?.(trimmed);
    onValueChange?.(trimmed);
    setOpen(false);
  }, [search, onCreateOption, onValueChange]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "h-10 px-4 py-2 text-sm w-[260px]",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-1 w-[260px] rounded-md border bg-popover text-popover-foreground shadow-md",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          )}
        >
          {/* Search */}
          <div className="flex items-center border-b px-3">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filtered.length === 0 && !canCreate && (
              <p className="px-2 py-4 text-sm text-center text-muted-foreground">{emptyText}</p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  opt.value === value
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  opt.disabled && "pointer-events-none opacity-50",
                )}
              >
                <Check
                  className={cn("mr-2 h-4 w-4", opt.value === value ? "opacity-100" : "opacity-0")}
                />
                {opt.label}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
                Создать «{search.trim()}»
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
