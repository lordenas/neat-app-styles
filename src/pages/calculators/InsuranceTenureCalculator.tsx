import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ShieldCheck } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { calcInsuranceTenure, type TenurePeriod } from "@/lib/calculators/insurance-tenure";

export default function InsuranceTenureCalculator() {
  const [periods, setPeriods] = useState<TenurePeriod[]>([
    { startDate: "2015-03-01", endDate: "2020-06-15" },
    { startDate: "2020-09-01", endDate: "2025-01-31" },
  ]);

  const addPeriod = () => setPeriods([...periods, { startDate: "", endDate: "" }]);
  const removePeriod = (i: number) => setPeriods(periods.filter((_, idx) => idx !== i));
  const updatePeriod = (i: number, field: keyof TenurePeriod, val: string) => {
    const copy = [...periods];
    copy[i] = { ...copy[i], [field]: val };
    setPeriods(copy);
  };

  const validPeriods = periods.filter((p) => p.startDate && p.endDate);
  const result = calcInsuranceTenure(validPeriods);

  const sickBgClass =
    result.sickPayPercent === 100
      ? "bg-[hsl(var(--success)/0.08)] dark:bg-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.2)] dark:border-[hsl(var(--success)/0.12)]"
      : result.sickPayPercent === 80
      ? "bg-primary/5 dark:bg-primary/[0.04] border-primary/10 dark:border-primary/[0.08]"
      : "bg-destructive/8 dark:bg-destructive/[0.05] border-destructive/15 dark:border-destructive/10";

  const sickTextClass =
    result.sickPayPercent === 100
      ? "text-[hsl(var(--success))]"
      : result.sickPayPercent === 80
      ? "text-primary"
      : "text-destructive";

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор страхового стажа</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Расчёт страхового стажа по периодам работы и процента оплаты больничного листа
      </p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="insurance-tenure" categoryName="Зарплатные" categoryPath="/categories/salary" title={title}>
      <div className="space-y-6">

        {/* Periods */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Периоды работы</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Укажите все периоды трудовой деятельности</p>
              </div>
              <Button variant="outline" size="sm" onClick={addPeriod}>
                <Plus className="h-3.5 w-3.5 mr-1" />Добавить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center px-0.5 mb-1">
              <span className="text-xs text-muted-foreground w-6 text-center">#</span>
              <span className="text-xs text-muted-foreground">Дата начала</span>
              <span className="text-xs text-muted-foreground">Дата окончания</span>
              <span className="w-8" />
            </div>
            {periods.map((p, i) => {
              const days =
                p.startDate && p.endDate
                  ? Math.max(0, Math.floor((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / 86400000) + 1)
                  : null;
              const isValid = p.startDate && p.endDate && new Date(p.endDate) >= new Date(p.startDate);
              return (
                <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start">
                  <span
                    className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      isValid ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <Input type="date" value={p.startDate} onChange={(e) => updatePeriod(i, "startDate", e.target.value)} />
                    <p className="h-3" />
                  </div>
                  <div>
                    <Input type="date" value={p.endDate} onChange={(e) => updatePeriod(i, "endDate", e.target.value)} />
                    <p className="text-[10px] text-muted-foreground mt-0.5 pl-1 h-3">
                      {days !== null && isValid ? `${days.toLocaleString("ru-RU")} дн.` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePeriod(i)}
                    className="h-8 w-8 shrink-0 mt-1 text-muted-foreground hover:text-destructive"
                    disabled={periods.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Результат</CardTitle>
              <CopyButton
                value={`Страховой стаж: ${result.totalYears} л. ${result.totalMonths} мес. ${result.totalDays} дн.\nОплата больничного: ${result.sickPayPercent}%\n${result.sickPayDescription}`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Общий страховой стаж</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  {result.totalYears} л.{" "}
                  <span className="text-2xl">{result.totalMonths} мес.</span>{" "}
                  <span className="text-xl text-muted-foreground">{result.totalDays} дн.</span>
                </p>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Всего дней</p>
                <p className="text-base font-bold tabular-nums">{result.rawDays.toLocaleString("ru-RU")}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">суммарно за все периоды</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Периодов</p>
                <p className="text-base font-bold tabular-nums">{validPeriods.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">учтено в расчёте</p>
              </div>
              <div className={`rounded-lg p-3.5 col-span-2 sm:col-span-1 ${sickBgClass}`}>
                <p className="text-xs text-muted-foreground mb-1">Оплата больничного</p>
                <p className={`text-base font-bold tabular-nums ${sickTextClass}`}>{result.sickPayPercent}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">от среднего заработка</p>
              </div>
            </div>

            {/* Sick pay full card */}
            <div className={`rounded-lg border p-4 ${sickBgClass}`}>
              <p className={`text-sm font-semibold ${sickTextClass}`}>{result.sickPayDescription}</p>
            </div>

            {/* Scale */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Шкала оплаты (ст. 7 № 255-ФЗ)</p>
              {[
                { label: "менее 5 лет", pct: 60, active: result.sickPayPercent === 60 },
                { label: "5 – 8 лет",   pct: 80, active: result.sickPayPercent === 80 },
                { label: "8 лет и более", pct: 100, active: result.sickPayPercent === 100 },
              ].map(({ label, pct, active }) => (
                <div
                  key={pct}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? "bg-primary/5 border border-primary/15 font-medium" : "text-muted-foreground"
                  }`}
                >
                  <span>{label}</span>
                  <span className={active ? "text-primary font-bold" : ""}>{pct}%</span>
                </div>
              ))}
            </div>

            {/* Formula */}
            <div className="rounded-md bg-muted/30 border border-border px-4 py-3 text-xs text-muted-foreground font-mono leading-relaxed">
              Стаж = {result.rawDays.toLocaleString("ru-RU")} дн. = {result.totalYears} × 365 + {result.totalMonths} × 30 + {result.totalDays} дн.
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Страховой стаж</strong> — суммарная продолжительность периодов работы и иной деятельности, в течение которых уплачивались взносы в ФСС.
            </p>
            <p>
              Процент оплаты больничного определяется по <strong className="text-foreground">ст. 7 Федерального закона №255-ФЗ</strong>.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
