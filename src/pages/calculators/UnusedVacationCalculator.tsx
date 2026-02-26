import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { calcUnusedVacation } from "@/lib/calculators/unused-vacation";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDays = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

export default function UnusedVacationCalculator() {
  const [avgDailyPay, setAvgDailyPay] = useState(2048);
  const [workedMonths, setWorkedMonths] = useState(8);
  const [annualVacationDays, setAnnualVacationDays] = useState(28);
  const [usedVacationDays, setUsedVacationDays] = useState(0);

  const result = calcUnusedVacation({ avgDailyPay, workedMonths, annualVacationDays, usedVacationDays });

  return (
    <CalculatorLayout calculatorId="unused-vacation" categoryName="Зарплатные" categoryPath="/categories/salary">
      <div className="space-y-6">

        {/* Параметры */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры расчёта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sdz">Средний дневной заработок (₽)</Label>
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
                <Label htmlFor="wm">Отработано месяцев</Label>
                <Input
                  id="wm"
                  type="number"
                  value={workedMonths}
                  onChange={(e) => setWorkedMonths(Math.max(0, +e.target.value))}
                  min={0}
                  max={600}
                  inputEnd={<span className="text-xs text-muted-foreground">мес.</span>}
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
          </CardContent>
        </Card>

        {/* Результат */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Результат</CardTitle>
              <CopyButton
                value={`Компенсация (до НДФЛ): ${fmt(result.compensation)} ₽\nНДФЛ 13%: ${fmt(result.ndfl)} ₽\nНа руки: ${fmt(result.netPay)} ₽\nПоложено дней: ${fmtDays(result.earnedDays)}\nНеиспользовано: ${fmtDays(result.unusedDays)}`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
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
                <p className="text-xs text-muted-foreground mb-1">Положено дней</p>
                <p className="text-base font-bold tabular-nums">{fmtDays(result.earnedDays)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">за период работы</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Неиспользовано</p>
                <p className="text-base font-bold tabular-nums">{fmtDays(result.unusedDays)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">дней к компенсации</p>
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
              Положено = {workedMonths} мес. × {annualVacationDays} дн. / 12 = {fmtDays(result.earnedDays)} дн.<br />
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
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
