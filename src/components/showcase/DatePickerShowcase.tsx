import { useState, useRef, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { DateRange } from "react-day-picker";

/* ── smart mask helpers ── */

function daysInMonth(month: number, year?: number): number {
  if (month === 2) {
    if (!year) return 29;
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Smart date mask: дд.мм.гггг
 * Validates ranges as user types and blocks invalid input.
 */
function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";

  const parts: string[] = [];

  // ── Day ──
  const d1 = parseInt(digits[0]);
  if (d1 > 3) {
    parts.push("0" + digits[0]);
  } else {
    if (digits.length === 1) return digits[0];
    const dayVal = parseInt(digits.slice(0, 2));
    if (dayVal < 1 || dayVal > 31) return digits[0];
    parts.push(digits.slice(0, 2));
  }

  const day = parseInt(parts[0]);
  const dayLen = parts[0].length === 2 ? (d1 > 3 ? 1 : 2) : 1;
  const rest = digits.slice(dayLen);

  if (rest.length === 0) return parts[0] + ".";

  // ── Month ──
  const m1 = parseInt(rest[0]);
  let monthStr: string;
  let monthDigitsUsed: number;

  if (m1 > 1) {
    monthStr = "0" + rest[0];
    monthDigitsUsed = 1;
  } else {
    if (rest.length === 1) return parts[0] + "." + rest[0];
    const monthVal = parseInt(rest.slice(0, 2));
    if (monthVal < 1 || monthVal > 12) return parts[0] + "." + rest[0];
    monthStr = rest.slice(0, 2);
    monthDigitsUsed = 2;
  }

  const month = parseInt(monthStr);
  // cross-validate: day must fit in this month
  const maxDay = daysInMonth(month);
  if (day > maxDay) {
    // block this month digit
    return parts[0] + ".";
  }

  const yearDigits = rest.slice(monthDigitsUsed);
  if (yearDigits.length === 0) return parts[0] + "." + monthStr + ".";

  // ── Year ──
  let yyyy = yearDigits.slice(0, 4);

  // final validation when year is complete
  if (yyyy.length === 4) {
    const y = parseInt(yyyy);
    const exactMax = daysInMonth(month, y);
    if (day > exactMax) {
      // e.g. 29.02 but not a leap year — block last year digit
      return parts[0] + "." + monthStr + "." + yyyy.slice(0, 3);
    }
  }

  return parts[0] + "." + monthStr + "." + yyyy;
}

function parseMaskedDate(masked: string): Date | undefined {
  if (masked.length !== 10) return undefined;
  const [dd, mm, yyyy] = masked.split(".");
  const d = parseInt(dd, 10), m = parseInt(mm, 10), y = parseInt(yyyy, 10);
  if (!d || !m || !y || m < 1 || m > 12 || d < 1) return undefined;
  const maxDay = daysInMonth(m, y);
  if (d > maxDay) return undefined;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
  return undefined;
}

export function DatePickerShowcase() {
  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6">
      {/* Single date — calendar only */}
      <div className="space-y-1.5">
        <Label>Только календарь</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd.MM.yyyy", { locale: ru }) : "дд.мм.гггг"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {date && (
          <p className="helper-text">Выбрано: {format(date, "d MMMM yyyy", { locale: ru })}</p>
        )}
      </div>

      {/* Single date — input + calendar */}
      <DateInputPicker />

      {/* Date range */}
      <div className="space-y-1.5">
        <Label>Диапазон дат (Date Range Picker)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[320px] justify-start text-left font-normal",
                !range?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, "dd.MM.yyyy", { locale: ru })} — {format(range.to, "dd.MM.yyyy", { locale: ru })}
                  </>
                ) : (
                  format(range.from, "dd.MM.yyyy", { locale: ru })
                )
              ) : (
                "Выберите период"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {range?.from && range?.to && (
          <p className="helper-text">
            Период: {differenceInDays(range.to, range.from)} дней
          </p>
        )}
      </div>

      {/* Period picker */}
      <PeriodPicker />
    </div>
  );
}

function DateInputPicker() {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(date ? format(date, "dd.MM.yyyy") : "");
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateMask(e.target.value);
    setInputValue(masked);
    const parsed = parseMaskedDate(masked);
    if (parsed) setDate(parsed);
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    setDate(d);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label>Ввод + календарь (с маской)</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center w-[260px] rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="дд.мм.гггг"
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:outline-none h-10 px-3 text-sm"
          />
          <PopoverTrigger asChild>
            <Button variant="ghost" className="rounded-l-none px-2 shrink-0 h-10 hover:bg-transparent">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {date && (
        <p className="helper-text">Выбрано: {format(date, "d MMMM yyyy", { locale: ru })}</p>
      )}
    </div>
  );
}

function PeriodPicker() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <div className="space-y-1.5">
      <Label>Period Picker (два поля)</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {startDate ? format(startDate, "dd.MM.yyyy", { locale: ru }) : "Начало"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">—</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {endDate ? format(endDate, "dd.MM.yyyy", { locale: ru }) : "Конец"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(d) => startDate ? d < startDate : false}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      {startDate && endDate && (
        <p className="helper-text">
          Период: {differenceInDays(endDate, startDate)} дней
        </p>
      )}
    </div>
  );
}
