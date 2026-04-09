import * as React from "react";
import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import type { DateRange } from "react-day-picker";

/**
 * Пресет для быстрого выбора диапазона.
 */
export interface DateRangePreset {
  label: string;
  range: DateRange;
}

const defaultPresets: DateRangePreset[] = [
  { label: "Сегодня", range: { from: new Date(), to: new Date() } },
  { label: "Последние 7 дней", range: { from: subDays(new Date(), 6), to: new Date() } },
  { label: "Последние 30 дней", range: { from: subDays(new Date(), 29), to: new Date() } },
  { label: "Этот месяц", range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
  { label: "С начала года", range: { from: startOfYear(new Date()), to: new Date() } },
];

/**
 * DateRangePicker — два календаря с пресетами для быстрого выбора диапазона дат.
 *
 * @example
 * ```tsx
 * <DateRangePicker value={range} onValueChange={setRange} />
 * <DateRangePicker presets={customPresets} placeholder="Период отчёта" />
 * ```
 *
 * @prop value - Текущий диапазон
 * @prop onValueChange - Колбэк при изменении диапазона
 * @prop presets - Массив пресетов (по умолчанию: Сегодня, 7/30 дней, Месяц, Год)
 * @prop placeholder - Текст-заглушка
 * @prop disabled - Заблокировать компонент
 * @prop align - Выравнивание поповера
 */
export interface DateRangePickerProps {
  value?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  presets?: DateRangePreset[];
  placeholder?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  presets = defaultPresets,
  placeholder = "Выберите период",
  disabled = false,
  align = "start",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handlePreset = (preset: DateRangePreset) => {
    onValueChange?.(preset.range);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-[320px] justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd.MM.yyyy", { locale: ru })} — {format(value.to, "dd.MM.yyyy", { locale: ru })}
              </>
            ) : (
              format(value.from, "dd.MM.yyyy", { locale: ru })
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          {/* Presets sidebar */}
          <div className="border-r p-2 space-y-0.5 min-w-[140px]">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Быстрый выбор</p>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p)}
                className="block w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Calendars */}
          <Calendar
            mode="range"
            selected={value}
            onSelect={onValueChange}
            numberOfMonths={2}
            locale={ru}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
