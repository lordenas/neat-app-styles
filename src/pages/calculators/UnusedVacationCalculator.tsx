import React, { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Briefcase, Plus, Trash2 } from "lucide-react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { calcUnusedVacation, ExcludedPeriod } from "@/lib/calculators/unused-vacation";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { ChevronDown } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDays = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
const fmtDate = (d: Date) => format(d, "dd.MM.yyyy", { locale: ru });

function DatePicker({
  value,
  onChange,
  placeholder = "ДД.ММ.ГГГГ",
  id,
}: {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ? fmtDate(value) : "");

  // sync text when value changes externally
  const prevValue = value ? fmtDate(value) : "";

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^\d.]/g, "");
    // auto-insert dots
    if (v.length === 2 && text.length === 1) v = v + ".";
    if (v.length === 5 && text.length === 4) v = v + ".";
    if (v.length > 10) return;
    setText(v);

    if (v.length === 10) {
      const [d, m, y] = v.split(".").map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime()) && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
        onChange(date);
      }
    }
  };

  return (
    <div className="flex gap-1">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        onChange={handleTextChange}
        onBlur={() => { if (text !== prevValue) setText(prevValue); }}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 h-9 w-9">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); if (d) setText(fmtDate(d)); setOpen(false); }}
            locale={ru}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function UnusedVacationCalculator() {
  const [avgDailyPay, setAvgDailyPay] = useState(2048);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear() - 1, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [annualVacationDays, setAnnualVacationDays] = useState(28);
  const [usedVacationDays, setUsedVacationDays] = useState(0);
  const [excludedPeriods, setExcludedPeriods] = useState<ExcludedPeriod[]>([]);
  const [excludedOpen, setExcludedOpen] = useState(false);

  const result = calcUnusedVacation({
    avgDailyPay,
    startDate,
    endDate,
    annualVacationDays,
    usedVacationDays,
    excludedPeriods,
  });

  const addPeriod = () =>
    setExcludedPeriods((p) => [...p, { from: new Date(), to: new Date(), label: "" }]);

  const updatePeriod = (i: number, patch: Partial<ExcludedPeriod>) =>
    setExcludedPeriods((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const removePeriod = (i: number) =>
    setExcludedPeriods((p) => p.filter((_, idx) => idx !== i));

  const totalDays = differenceInCalendarDays(endDate, startDate) + 1;

  return (
    <CalculatorLayout calculatorId="unused-vacation" categoryName="Зарплатные" categoryPath="/categories/salary">
      <div className="space-y-6">

        {/* Параметры */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры расчёта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Даты */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date">Дата начала работы</Label>
                <DatePicker id="start-date" value={startDate} onChange={(d) => d && setStartDate(d)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date">Дата увольнения (или сегодня)</Label>
                <DatePicker id="end-date" value={endDate} onChange={(d) => d && setEndDate(d)} />
              </div>
            </div>

            {/* Остальные поля */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sdz">Средний дневной заработок</Label>
                <Input
                  id="sdz"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(avgDailyPay)}
                  onChange={(e) => setAvgDailyPay(Math.max(0, parseNumberInput(e.target.value)))}
                  inputEnd={<span className="text-xs text-muted-foreground">₽</span>}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avd">Дней отпуска в году</Label>
                <Input
                  id="avd"
                  type="number"
                  value={annualVacationDays}
                  onChange={(e) => setAnnualVacationDays(Math.max(1, +e.target.value))}
                  min={1}
                  inputEnd={<span className="text-xs text-muted-foreground">дн.</span>}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uvd">Использовано дней отпуска</Label>
                <Input
                  id="uvd"
                  type="number"
                  value={usedVacationDays}
                  onChange={(e) => setUsedVacationDays(Math.max(0, +e.target.value))}
                  min={0}
                  inputEnd={<span className="text-xs text-muted-foreground">дн.</span>}
                />
              </div>
            </div>

            {/* Исключаемые периоды */}
            <Collapsible open={excludedOpen} onOpenChange={setExcludedOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="font-medium text-foreground">
                    Исключаемые периоды
                    {excludedPeriods.length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">({excludedPeriods.length} шт., −{result.excludedDays} дн.)</span>
                    )}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", excludedOpen && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Больничные, отпуск без сохранения зарплаты свыше 14 дней, прогулы и другие периоды, не включаемые в стаж для отпуска (ст. 121 ТК РФ).
                </p>

                {excludedPeriods.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">С</Label>}
                      <DatePicker
                        value={p.from}
                        onChange={(d) => d && updatePeriod(i, { from: d })}
                        placeholder="Начало"
                      />
                    </div>
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">По</Label>}
                      <DatePicker
                        value={p.to}
                        onChange={(d) => d && updatePeriod(i, { to: d })}
                        placeholder="Конец"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("text-muted-foreground hover:text-destructive", i === 0 && "mt-5")}
                      onClick={() => removePeriod(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="gap-1.5" onClick={addPeriod}>
                  <Plus className="h-3.5 w-3.5" />
                  Добавить период
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Результат */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Результат</CardTitle>
              <CopyButton
                value={`Компенсация (до НДФЛ): ${fmt(result.compensation)} ₽\nНДФЛ 13%: ${fmt(result.ndfl)} ₽\nНа руки: ${fmt(result.netPay)} ₽\nОтработано месяцев: ${result.workedMonths}\nПоложено дней: ${fmtDays(result.earnedDays)}\nНеиспользовано: ${fmtDays(result.unusedDays)}`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 dark:bg-primary/[0.04] border border-primary/10 dark:border-primary/[0.08]">
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Компенсация за отпуск (до НДФЛ)</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{fmt(result.compensation)} ₽</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Отработано</p>
                <p className="text-base font-bold tabular-nums">{result.workedMonths} мес.</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{totalDays} кал. дней</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Неиспользовано</p>
                <p className="text-base font-bold tabular-nums">{fmtDays(result.unusedDays)} дн.</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">из {fmtDays(result.earnedDays)} положенных</p>
              </div>
              <div className="rounded-lg bg-destructive/8 border border-destructive/15 p-3.5">
                <p className="text-xs text-muted-foreground mb-1">НДФЛ 13%</p>
                <p className="text-base font-bold tabular-nums text-destructive">−{fmt(result.ndfl)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">налог к удержанию</p>
              </div>
              <div className="rounded-lg bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] p-3.5">
                <p className="text-xs text-muted-foreground mb-1">На руки</p>
                <p className="text-base font-bold tabular-nums text-[hsl(var(--success))]">{fmt(result.netPay)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">после вычета НДФЛ</p>
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-md bg-muted/30 border border-border px-4 py-3 text-xs text-muted-foreground font-mono leading-relaxed">
              Период: {fmtDate(startDate)} — {fmtDate(endDate)} ({totalDays} дн.){result.excludedDays > 0 ? ` − ${result.excludedDays} исключ. = ${totalDays - result.excludedDays} дн.` : ""}<br />
              Отработано месяцев: {result.workedMonths} мес.<br />
              Положено = {result.workedMonths >= 11 ? 12 : result.workedMonths} мес. × {annualVacationDays} дн. / 12 = {fmtDays(result.earnedDays)} дн.<br />
              Неиспользовано = {fmtDays(result.earnedDays)} − {usedVacationDays} = {fmtDays(result.unusedDays)} дн.<br />
              Компенсация = {fmt(avgDailyPay)} ₽ × {fmtDays(result.unusedDays)} дн. = {fmt(result.compensation)} ₽
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Компенсация за неиспользованный отпуск</strong> выплачивается при увольнении по ст. 127 ТК РФ за все неотгулянные дни.
            </p>
            <p>
              Если отработано <strong className="text-foreground">11 и более месяцев</strong> в рабочем году — положен полный отпуск (28 дней).
            </p>
            <p>
              <strong className="text-foreground">Исключаемые периоды</strong> (ст. 121 ТК РФ): отпуск за свой счёт свыше 14 дней, отстранение без оплаты, прогул — не входят в стаж для расчёта отпуска.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
