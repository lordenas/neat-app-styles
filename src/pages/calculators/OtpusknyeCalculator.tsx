import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Umbrella } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { calcOtpusknye, type ExcludedPeriod } from "@/lib/calculators/otpusknye";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OtpusknyeCalculator() {
  const [totalEarnings, setTotalEarnings] = useState(720000);
  const [fullMonths, setFullMonths] = useState(10);
  const [vacationDays, setVacationDays] = useState(28);
  const [partialMonths, setPartialMonths] = useState<ExcludedPeriod[]>([
    { excludedDays: 10, totalDaysInMonth: 31 },
    { excludedDays: 5, totalDaysInMonth: 30 },
  ]);

  const addPartial = () => setPartialMonths([...partialMonths, { excludedDays: 0, totalDaysInMonth: 30 }]);
  const removePartial = (i: number) => setPartialMonths(partialMonths.filter((_, idx) => idx !== i));
  const updatePartial = (i: number, field: keyof ExcludedPeriod, val: number) => {
    const copy = [...partialMonths];
    copy[i] = { ...copy[i], [field]: val };
    setPartialMonths(copy);
  };

  const result = calcOtpusknye({ totalEarnings, fullMonths, partialMonths, vacationDays });

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор отпускных</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Расчёт суммы отпускных по ТК РФ (ПП №922) с учётом среднего дневного заработка
      </p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="otpusknye" categoryName="Зарплатные" categoryPath="/categories/salary" title={title}>
      <div className="space-y-6">
        {/* Main params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры расчёта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="earn">Заработок за 12 мес. (₽)</Label>
                <Input
                  id="earn"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(totalEarnings)}
                  onChange={(e) => setTotalEarnings(Math.max(0, parseNumberInput(e.target.value)))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fm">Полных месяцев</Label>
                <Input
                  id="fm"
                  type="number"
                  value={fullMonths}
                  onChange={(e) => setFullMonths(Math.min(12, Math.max(0, +e.target.value)))}
                  min={0}
                  max={12}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vd">Дней отпуска</Label>
                <Input
                  id="vd"
                  type="number"
                  value={vacationDays}
                  onChange={(e) => setVacationDays(Math.max(1, +e.target.value))}
                  min={1}
                />
              </div>
            </div>

            {/* Partial months */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Неполные месяцы</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Месяцы с больничным, отпуском без содержания и т.п.</p>
                </div>
                <Button variant="outline" size="sm" onClick={addPartial}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Добавить
                </Button>
              </div>

              {partialMonths.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">Все месяцы отработаны полностью</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-0.5">
                    <span className="text-xs text-muted-foreground">Пропущено дней</span>
                    <span className="text-xs text-muted-foreground">Дней в месяце</span>
                    <span />
                  </div>
                  {partialMonths.map((pm, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        type="number"
                        value={pm.excludedDays}
                        onChange={(e) => updatePartial(i, "excludedDays", +e.target.value)}
                        min={0}
                        max={pm.totalDaysInMonth}
                      />
                      <Input
                        type="number"
                        value={pm.totalDaysInMonth}
                        onChange={(e) => updatePartial(i, "totalDaysInMonth", +e.target.value)}
                        min={28}
                        max={31}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePartial(i)}
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Результат</CardTitle>
              <CopyButton
                value={`Отпускные (до НДФЛ): ${fmt(result.vacationPay)} ₽\nНДФЛ 13%: ${fmt(result.ndfl)} ₽\nНа руки: ${fmt(result.netPay)} ₽\nСДЗ: ${fmt(result.avgDailyPay)} ₽\nРасчётные дни: ${fmt(result.calcDays)}`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Hero metric */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <Umbrella className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Отпускные (до вычета НДФЛ)</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{fmt(result.vacationPay)} ₽</p>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">СДЗ</p>
                <p className="text-base font-bold tabular-nums">{fmt(result.avgDailyPay)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">ср. дневной заработок</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Расч. дней</p>
                <p className="text-base font-bold tabular-nums">{fmt(result.calcDays)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">по формуле ПП 922</p>
              </div>
              <div className="rounded-lg bg-destructive/8 dark:bg-destructive/[0.05] border border-destructive/15 dark:border-destructive/10 p-3.5">
...
              <div className="rounded-lg bg-[hsl(var(--success)/0.08)] dark:bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.2)] dark:border-[hsl(var(--success)/0.12)] p-3.5">
                <p className="text-xs text-muted-foreground mb-1">На руки</p>
                <p className="text-base font-bold tabular-nums text-[hsl(var(--success))]">{fmt(result.netPay)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">после вычета НДФЛ</p>
              </div>
            </div>

            {/* Formula explanation */}
            <div className="rounded-md bg-muted/30 border border-border px-4 py-3 text-xs text-muted-foreground font-mono leading-relaxed">
              СДЗ = {fmt(totalEarnings)} ₽ / {fmt(result.calcDays)} дн. = {fmt(result.avgDailyPay)} ₽<br />
              Отпускные = {fmt(result.avgDailyPay)} ₽ × {vacationDays} дн. = {fmt(result.vacationPay)} ₽
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Средний дневной заработок</strong> рассчитывается по формуле Постановления Правительства №922:
              заработок делится на количество расчётных дней, где каждый полный месяц = 29,3 дня.
            </p>
            <p>
              В <strong className="text-foreground">неполных месяцах</strong> расчётные дни = 29,3 × (отработанные дни / всего дней в месяце).
            </p>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
