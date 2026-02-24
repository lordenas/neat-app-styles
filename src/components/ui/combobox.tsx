import * as React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

/**
 * Опция для Combobox.
 *
 * @prop value - Уникальное значение
 * @prop label - Отображаемый текст
 * @prop disabled - Запрещает выбор опции
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
 *   searchPlaceholder="Поиск..."
 * />
 *
 * // Creatable — можно добавлять новые опции
 * <Combobox options={options} value={val} onValueChange={setVal} creatable />
 * ```
 *
 * @prop options - Массив опций
 * @prop value - Текущее значение
 * @prop onValueChange - Колбэк при выборе
 * @prop placeholder - Текст-заглушка кнопки
 * @prop searchPlaceholder - Текст-заглушка поиска
 * @prop creatable - Разрешить создание новых опций из поиска
 * @prop onCreateOption - Колбэк при создании новой опции
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

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const canCreate = creatable && search.trim() && !options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  const handleSelect = useCallback((val: string) => {
    onValueChange?.(val === value ? "" : val);
    setOpen(false);
  }, [onValueChange, value]);

  const handleCreate = useCallback(() => {
    const trimmed = search.trim();
    if (!trimmed) return;
    onCreateOption?.(trimmed);
    onValueChange?.(trimmed);
    setOpen(false);
  }, [search, onCreateOption, onValueChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-[260px] justify-between font-normal", !value && "text-muted-foreground", className)}
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0 pointer-events-auto" align="start">
        <div className="flex items-center border-b px-3">
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
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
                opt.value === value ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                opt.disabled && "pointer-events-none opacity-50",
              )}
            >
              <Check className={cn("mr-2 h-4 w-4", opt.value === value ? "opacity-100" : "opacity-0")} />
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
      </PopoverContent>
    </Popover>
  );
}
