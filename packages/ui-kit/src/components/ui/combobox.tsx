import * as React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

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
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlightIndex(-1);
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

  const filtered = useMemo(() => {
    if (!search) return options.filter((o) => !o.disabled);
    const q = search.toLowerCase();
    return options.filter((o) => !o.disabled && o.label.toLowerCase().includes(q));
  }, [options, search]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [filtered.length]);

  // Scroll highlighted into view
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-combobox-option]");
    items[highlightIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    const total = filtered.length + (canCreate ? 1 : 0);
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
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex].value);
        } else if (highlightIndex === filtered.length && canCreate) {
          handleCreate();
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

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
        onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
          <div ref={listRef} className="max-h-[200px] overflow-y-auto p-1">
            {filtered.length === 0 && !canCreate && (
              <p className="px-2 py-4 text-sm text-center text-muted-foreground">{emptyText}</p>
            )}
            {filtered.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                data-combobox-option
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  idx === highlightIndex
                    ? "bg-accent text-accent-foreground"
                    : opt.value === value
                      ? "bg-accent/50 text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
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
                data-combobox-option
                onClick={handleCreate}
                onMouseEnter={() => setHighlightIndex(filtered.length)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary transition-colors",
                  highlightIndex === filtered.length ? "bg-accent" : "hover:bg-accent",
                )}
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
