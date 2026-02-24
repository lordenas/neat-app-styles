import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { format, differenceInDays } from "date-fns";
import { ru, enUS, de, ja, fr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";

/**
 * Locale-aware date mask system.
 * Supports 7 locales: RU, DE, UK, US, JP, ISO, FR.
 * Each locale defines part order (DMY/MDY/YMD), separator, placeholder,
 * time format (24h/12h), and date-fns locale for Calendar.
 *
 * @example
 * ```tsx
 * <DatePickerShowcase />
 * ```
 */


type DatePart = "day" | "month" | "year";

interface DateLocaleConfig {
  /** e.g. "ru", "en-US", "de", "ja" */
  code: string;
  label: string;
  /** Order of parts, e.g. ["day","month","year"] */
  order: [DatePart, DatePart, DatePart];
  /** Separator char, e.g. "." or "/" or "-" */
  sep: string;
  /** Placeholder, e.g. "дд.мм.гггг" */
  placeholder: string;
  /** date-fns locale */
  fnsLocale: typeof ru;
  /** date-fns format string */
  fnsFormat: string;
  /** Default 24h or 12h for this locale */
  use24h: boolean;
  /** Time placeholder */
  timePlaceholder: string;
}

const DATE_LOCALES: DateLocaleConfig[] = [
  { code: "ru",    label: "🇷🇺 Россия (дд.мм.гггг)",    order: ["day","month","year"], sep: ".", placeholder: "дд.мм.гггг",   fnsLocale: ru,   fnsFormat: "dd.MM.yyyy", use24h: true,  timePlaceholder: "чч:мм" },
  { code: "de",    label: "🇩🇪 Deutschland (TT.MM.JJJJ)", order: ["day","month","year"], sep: ".", placeholder: "TT.MM.JJJJ",   fnsLocale: de,   fnsFormat: "dd.MM.yyyy", use24h: true,  timePlaceholder: "SS:MM" },
  { code: "en-GB", label: "🇬🇧 UK (dd/mm/yyyy)",           order: ["day","month","year"], sep: "/", placeholder: "dd/mm/yyyy",    fnsLocale: enUS, fnsFormat: "dd/MM/yyyy", use24h: true,  timePlaceholder: "hh:mm" },
  { code: "en-US", label: "🇺🇸 US (mm/dd/yyyy)",           order: ["month","day","year"], sep: "/", placeholder: "mm/dd/yyyy",    fnsLocale: enUS, fnsFormat: "MM/dd/yyyy", use24h: false, timePlaceholder: "hh:mm" },
  { code: "ja",    label: "🇯🇵 日本 (yyyy/mm/dd)",         order: ["year","month","day"], sep: "/", placeholder: "yyyy/mm/dd",    fnsLocale: ja,   fnsFormat: "yyyy/MM/dd", use24h: true,  timePlaceholder: "時:分" },
  { code: "iso",   label: "ISO 8601 (yyyy-mm-dd)",         order: ["year","month","day"], sep: "-", placeholder: "yyyy-mm-dd",    fnsLocale: enUS, fnsFormat: "yyyy-MM-dd", use24h: true,  timePlaceholder: "hh:mm" },
  { code: "fr",    label: "🇫🇷 France (jj/mm/aaaa)",       order: ["day","month","year"], sep: "/", placeholder: "jj/mm/aaaa",    fnsLocale: fr,   fnsFormat: "dd/MM/yyyy", use24h: true,  timePlaceholder: "hh:mm" },
];

/* ── helpers ── */

function daysInMonth(month: number, year?: number): number {
  if (month === 2) {
    if (!year) return 29;
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Generic smart mask that works for any part order and separator */
function applyDateMaskLocale(raw: string, config: DateLocaleConfig): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";

  const { order, sep } = config;
  const results: string[] = [];
  let cursor = 0;
  let dayVal: number | undefined;
  let monthVal: number | undefined;
  let yearVal: number | undefined;

  for (let i = 0; i < 3; i++) {
    const part = order[i];
    if (cursor >= digits.length) break;

    if (part === "year") {
      const yearDigits = digits.slice(cursor, cursor + 4);
      cursor += yearDigits.length;

      if (yearDigits.length === 4) {
        yearVal = parseInt(yearDigits);
        // Final leap-year validation when year complete and day+month known
        if (dayVal && monthVal && dayVal > daysInMonth(monthVal, yearVal)) {
          results.push(yearDigits.slice(0, 3));
          return results.join(sep);
        }
      }
      results.push(yearDigits);
    } else if (part === "month") {
      const m1 = parseInt(digits[cursor]);
      let monthStr: string;

      if (m1 > 1) {
        monthStr = "0" + digits[cursor];
        cursor += 1;
      } else {
        if (cursor + 1 >= digits.length) {
          // single digit so far
          results.push(digits[cursor]);
          cursor += 1;
          break;
        }
        const mv = parseInt(digits.slice(cursor, cursor + 2));
        if (mv < 1 || mv > 12) {
          results.push(digits[cursor]);
          cursor += 1;
          break;
        }
        monthStr = digits.slice(cursor, cursor + 2);
        cursor += 2;
      }

      monthVal = parseInt(monthStr);

      // Cross-validate with existing day
      if (dayVal && dayVal > daysInMonth(monthVal)) {
        // Can't use this month — block
        if (results.length > 0) return results.join(sep) + sep;
        return "";
      }
      results.push(monthStr);
    } else {
      // day
      const d1 = parseInt(digits[cursor]);
      let dayStr: string;

      if (d1 > 3) {
        dayStr = "0" + digits[cursor];
        cursor += 1;
      } else {
        if (cursor + 1 >= digits.length) {
          results.push(digits[cursor]);
          cursor += 1;
          break;
        }
        const dv = parseInt(digits.slice(cursor, cursor + 2));
        if (dv < 1 || dv > 31) {
          results.push(digits[cursor]);
          cursor += 1;
          break;
        }
        dayStr = digits.slice(cursor, cursor + 2);
        cursor += 2;
      }

      dayVal = parseInt(dayStr);

      // Cross-validate with existing month (and year if known)
      if (monthVal && dayVal > daysInMonth(monthVal, yearVal)) {
        if (results.length > 0) return results.join(sep) + sep;
        return "";
      }
      results.push(dayStr);
    }
  }

  return results.join(sep);
}

function getFullLength(config: DateLocaleConfig): number {
  // e.g. dd.mm.yyyy = 10, yyyy-mm-dd = 10
  return 10;
}

function parseMaskedDateLocale(masked: string, config: DateLocaleConfig): Date | undefined {
  if (masked.length !== getFullLength(config)) return undefined;
  const parts = masked.split(config.sep);
  if (parts.length !== 3) return undefined;

  let d = 0, m = 0, y = 0;
  config.order.forEach((part, i) => {
    const val = parseInt(parts[i], 10);
    if (part === "day") d = val;
    else if (part === "month") m = val;
    else y = val;
  });

  if (!d || !m || !y || m < 1 || m > 12 || d < 1) return undefined;
  if (d > daysInMonth(m, y)) return undefined;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) return date;
  return undefined;
}

function formatDateLocale(date: Date, config: DateLocaleConfig): string {
  return format(date, config.fnsFormat);
}

/* ═══════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════ */

export function DatePickerShowcase() {
  const [localeIdx, setLocaleIdx] = useState(0);
  const locale = DATE_LOCALES[localeIdx];

  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6">
      {/* Locale switcher */}
      <div className="space-y-1.5">
        <Label>Локаль / Date format</Label>
        <div className="flex flex-wrap gap-1">
          {DATE_LOCALES.map((l, i) => (
            <Button
              key={l.code}
              variant={i === localeIdx ? "default" : "outline"}
              size="sm"
              onClick={() => { setLocaleIdx(i); setDate(undefined); setRange(undefined); }}
              className="text-xs"
            >
              {l.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Маска: <code className="bg-muted px-1 rounded">{locale.placeholder}</code> · Разделитель: <code className="bg-muted px-1 rounded">{locale.sep}</code> · Порядок: <Badge variant="outline" className="text-xs font-mono">{locale.order.join(" → ")}</Badge>
        </p>
      </div>

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
              {date ? formatDateLocale(date, locale) : locale.placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={locale.fnsLocale}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {date && (
          <p className="helper-text">Выбрано: {format(date, "d MMMM yyyy", { locale: locale.fnsLocale })}</p>
        )}
      </div>

      {/* Single date — input + calendar */}
      <DateInputPicker locale={locale} />

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
                    {formatDateLocale(range.from, locale)} — {formatDateLocale(range.to, locale)}
                  </>
                ) : (
                  formatDateLocale(range.from, locale)
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
              locale={locale.fnsLocale}
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
      <PeriodPicker locale={locale} />

      {/* DateTime picker */}
      <DateTimePicker locale={locale} />
    </div>
  );
}

function DateInputPicker({ locale }: { locale: DateLocaleConfig }) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(date ? formatDateLocale(date, locale) : "");
  }, [date, locale]);

  // Reset on locale change
  useEffect(() => {
    setDate(undefined);
    setInputValue("");
  }, [locale.code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const masked = applyDateMaskLocale(newVal, locale);
    setInputValue(masked);
    const parsed = parseMaskedDateLocale(masked, locale);
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
            placeholder={locale.placeholder}
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
            locale={locale.fnsLocale}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {date && (
        <p className="helper-text">Выбрано: {format(date, "d MMMM yyyy", { locale: locale.fnsLocale })}</p>
      )}
    </div>
  );
}

function PeriodPicker({ locale }: { locale: DateLocaleConfig }) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Reset on locale change
  useEffect(() => {
    setStartDate(undefined);
    setEndDate(undefined);
  }, [locale.code]);

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
              {startDate ? formatDateLocale(startDate, locale) : locale.placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              locale={locale.fnsLocale}
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
              {endDate ? formatDateLocale(endDate, locale) : locale.placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(d) => startDate ? d < startDate : false}
              locale={locale.fnsLocale}
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

/* ═══════════════════════════════════════════════
   DateTime Picker — date + time with masks
   ═══════════════════════════════════════════════ */

function applyTimeMask(raw: string, use24h: boolean): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";

  const maxH = use24h ? 23 : 12;
  const h1 = parseInt(digits[0]);
  const maxH1 = use24h ? 2 : 1;

  let hourStr: string;
  let hourDigitsUsed: number;

  if (h1 > maxH1) {
    hourStr = "0" + digits[0];
    hourDigitsUsed = 1;
  } else {
    if (digits.length === 1) return digits[0];
    const hv = parseInt(digits.slice(0, 2));
    if (hv > maxH) return digits[0];
    hourStr = digits.slice(0, 2);
    hourDigitsUsed = 2;
  }

  const rest = digits.slice(hourDigitsUsed);
  if (rest.length === 0) return hourStr;

  const m1 = parseInt(rest[0]);
  if (m1 > 5) return hourStr + ":" + "0" + rest[0];
  if (rest.length === 1) return hourStr + ":" + rest[0];

  const mv = parseInt(rest.slice(0, 2));
  if (mv > 59) return hourStr + ":" + rest[0];

  return hourStr + ":" + rest.slice(0, 2);
}

/** Apply time mask preserving cursor position */
function applyTimeMaskWithCursor(
  input: HTMLInputElement,
  use24h: boolean
): { value: string; cursor: number } {
  const raw = input.value;
  const cursorBefore = input.selectionStart ?? raw.length;
  const masked = applyTimeMask(raw, use24h);

  // Count digits before cursor in raw
  let digitsBefore = 0;
  for (let i = 0; i < cursorBefore && i < raw.length; i++) {
    if (/\d/.test(raw[i])) digitsBefore++;
  }

  // Find position in masked string after the same number of digits
  let newCursor = 0;
  let counted = 0;
  for (let i = 0; i < masked.length; i++) {
    if (counted >= digitsBefore) { newCursor = i; break; }
    if (/\d/.test(masked[i])) counted++;
    newCursor = i + 1;
  }

  return { value: masked, cursor: newCursor };
}

function parseTime(masked: string): { hours: number; minutes: number } | undefined {
  if (masked.length !== 5) return undefined;
  const [hh, mm] = masked.split(":");
  const h = parseInt(hh, 10);
  const m = parseInt(mm, 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return undefined;
  return { hours: h, minutes: m };
}

function DateTimePicker({ locale }: { locale: DateLocaleConfig }) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [use24h, setUse24h] = useState(locale.use24h);
  const [amPm, setAmPm] = useState<"AM" | "PM">("AM");
  const timeRef = useRef<HTMLInputElement>(null);
  const timePopoverRef = useRef<HTMLInputElement>(null);
  const isEditingTimeRef = useRef(false);

  // Sync use24h from locale
  useEffect(() => {
    setUse24h(locale.use24h);
  }, [locale.code]);

  // Reset on locale change
  useEffect(() => {
    setDate(undefined);
    setDateInput("");
    setTimeInput("");
    setAmPm("AM");
  }, [locale.code]);

  // Sync inputs from date — skip time sync when user is actively editing
  useEffect(() => {
    if (date) {
      setDateInput(formatDateLocale(date, locale));
      if (!isEditingTimeRef.current) {
        if (use24h) {
          setTimeInput(format(date, "HH:mm"));
        } else {
          const h = date.getHours();
          setAmPm(h >= 12 ? "PM" : "AM");
          setTimeInput(format(date, "hh:mm"));
        }
      }
    }
  }, [date, locale, use24h]);

  const updateDateTime = useCallback((newDateStr: string, newTimeStr: string, currentAmPm: "AM" | "PM") => {
    const parsedDate = parseMaskedDateLocale(newDateStr, locale);
    const parsedTime = parseTime(newTimeStr);
    if (parsedDate && parsedTime) {
      const dt = new Date(parsedDate);
      let h = parsedTime.hours;
      if (!use24h) {
        if (currentAmPm === "PM" && h < 12) h += 12;
        if (currentAmPm === "AM" && h === 12) h = 0;
      }
      dt.setHours(h, parsedTime.minutes, 0, 0);
      isEditingTimeRef.current = true;
      setDate(dt);
      requestAnimationFrame(() => { isEditingTimeRef.current = false; });
    }
    // Don't set date when time is incomplete — avoids resetting to 00:00
  }, [locale, use24h]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateMaskLocale(e.target.value, locale);
    setDateInput(masked);
    updateDateTime(masked, timeInput, amPm);
  };

  const handleTimeChangeWithCursor = (inputEl: HTMLInputElement) => {
    const { value, cursor } = applyTimeMaskWithCursor(inputEl, use24h);
    isEditingTimeRef.current = true;
    setTimeInput(value);
    updateDateTime(dateInput, value, amPm);
    requestAnimationFrame(() => {
      inputEl.setSelectionRange(cursor, cursor);
      isEditingTimeRef.current = false;
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTimeChangeWithCursor(e.target);
  };

  const handlePopoverTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTimeChangeWithCursor(e.target);
  };

  const toggleAmPm = () => {
    const next = amPm === "AM" ? "PM" : "AM";
    setAmPm(next);
    updateDateTime(dateInput, timeInput, next);
  };

  const handleCalendarSelect = (d: Date | undefined) => {
    if (d) {
      const parsedTime = parseTime(timeInput);
      if (parsedTime) {
        let h = parsedTime.hours;
        if (!use24h) {
          if (amPm === "PM" && h < 12) h += 12;
          if (amPm === "AM" && h === 12) h = 0;
        }
        d.setHours(h, parsedTime.minutes, 0, 0);
      }
      setDate(d);
    }
    setOpen(false);
  };

  const setNow = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    setDate(now);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label>DateTime Picker (дата + время)</Label>
        <button
          onClick={() => {
            const next = !use24h;
            setUse24h(next);
            // Re-format time for the new mode
            if (date) {
              if (next) {
                setTimeInput(format(date, "HH:mm"));
              } else {
                const h = date.getHours();
                setAmPm(h >= 12 ? "PM" : "AM");
                setTimeInput(format(date, "hh:mm"));
              }
            }
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {use24h ? "24ч" : "12ч"}
        </button>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center w-[340px] rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors">
          <input
            value={dateInput}
            onChange={handleDateChange}
            placeholder={locale.placeholder}
            className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:outline-none h-10 pl-3 text-sm"
          />
          <span className="text-muted-foreground/40 px-1 select-none">|</span>
          <div className="flex items-center gap-1 pr-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={timeRef}
              value={timeInput}
              onChange={handleTimeChange}
              placeholder={locale.timePlaceholder}
              className="w-[48px] bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:outline-none h-10 text-sm text-center"
            />
            {!use24h && (
              <button
                onClick={toggleAmPm}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-1"
              >
                {amPm}
              </button>
            )}
          </div>
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
            locale={locale.fnsLocale}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          <div className="border-t px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <input
                ref={timePopoverRef}
                value={timeInput}
                onChange={handlePopoverTimeChange}
                placeholder={locale.timePlaceholder}
                className="w-[52px] bg-muted/50 rounded px-2 py-1 text-sm text-center border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {!use24h && (
                <button
                  onClick={toggleAmPm}
                  className="text-xs font-medium bg-muted/50 rounded px-2 py-1 border border-input hover:bg-muted transition-colors"
                >
                  {amPm}
                </button>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={setNow}>
              Сейчас
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {date && (
        <p className="helper-text">
          Выбрано: {format(date, "d MMMM yyyy", { locale: locale.fnsLocale })}, {format(date, use24h ? "HH:mm" : "hh:mm a")}
        </p>
      )}
    </div>
  );
}
