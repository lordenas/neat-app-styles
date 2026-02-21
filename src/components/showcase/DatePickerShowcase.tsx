import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { DateRange } from "react-day-picker";

export function DatePickerShowcase() {
  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-6">
      {/* Single date */}
      <div className="space-y-1.5">
        <Label>Выберите дату</Label>
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
