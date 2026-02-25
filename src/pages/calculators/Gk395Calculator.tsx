import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  type Gk395Input,
  type ExcludedPeriod,
  type PartialPayment,
  type DebtIncrease,
  calcGk395,
} from "@/lib/calculators/gk395";
import type { KeyRateEntry } from "@/lib/calculators/peni";
import keyRateData from "@/data/key-rate-ru.json";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function Gk395CalculatorPage() {
  const [sum, setSum] = useState(500000);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [excludedPeriods, setExcludedPeriods] = useState<ExcludedPeriod[]>([]);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [debtIncreases, setDebtIncreases] = useState<DebtIncrease[]>([]);

  const rates = keyRateData.rates as KeyRateEntry[];

  const result = useMemo(() => {
    const input: Gk395Input = { sum, startDate, endDate, excludedPeriods, partialPayments, debtIncreases };
    return calcGk395(input, rates);
  }, [sum, startDate, endDate, excludedPeriods, partialPayments, debtIncreases, rates]);

  return (
    <CalculatorLayout calculatorId="gk395" categoryName="Налоги" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Проценты по ст. 395 ГК РФ</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт процентов за пользование чужими денежными средствами по ключевой ставке ЦБ РФ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма долга (₽)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(sum)}
                  onChange={(e) => setSum(Math.max(0, parseNumberInput(e.target.value)))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Период</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">С</span>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">По</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Partial payments */}
              <div className="space-y-1.5">
                <Label>Частичные оплаты</Label>
                {partialPayments.map((p, i) => (
                  <div key={i} className="flex gap-1 items-end">
                    <Input type="date" value={p.date} className="flex-1"
                      onChange={(e) => { const arr = [...partialPayments]; arr[i] = { ...arr[i], date: e.target.value }; setPartialPayments(arr); }} />
                    <Input type="text" inputMode="numeric" value={formatNumberInput(p.amount)} className="flex-1"
                      onChange={(e) => { const arr = [...partialPayments]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setPartialPayments(arr); }} />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setPartialPayments(partialPayments.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPartialPayments([...partialPayments, { date: new Date().toISOString().slice(0, 10), amount: 0 }])}>
                  + Добавить оплату
                </Button>
              </div>

              {/* Debt increases */}
              <div className="space-y-1.5">
                <Label>Увеличение долга</Label>
                {debtIncreases.map((d, i) => (
                  <div key={i} className="flex gap-1 items-end">
                    <Input type="date" value={d.date} className="flex-1"
                      onChange={(e) => { const arr = [...debtIncreases]; arr[i] = { ...arr[i], date: e.target.value }; setDebtIncreases(arr); }} />
                    <Input type="text" inputMode="numeric" value={formatNumberInput(d.amount)} className="flex-1"
                      onChange={(e) => { const arr = [...debtIncreases]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setDebtIncreases(arr); }} />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setDebtIncreases(debtIncreases.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDebtIncreases([...debtIncreases, { date: new Date().toISOString().slice(0, 10), amount: 0 }])}>
                  + Увеличить долг
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Сумма долга</p>
                        <p className="text-xl font-bold">{fmt(sum)} ₽</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Проценты (ст. 395)</p>
                        <p className="text-xl font-bold text-destructive">{fmt(result.totalInterest)} ₽</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Итого с процентами</p>
                        <p className="text-xl font-bold">{fmt(result.totalDebtWithInterest)} ₽</p>
                      </div>
                    </div>

                    {result.breakdown.length > 0 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">Расчёт по периодам:</p>
                        {result.breakdown.filter(b => !b.isPayment && !b.isDebtIncrease).map((b, i) => (
                          <div key={i} className={`flex justify-between py-1 border-b border-border last:border-0 ${b.isExcluded ? "opacity-50" : ""}`}>
                            <span className="text-muted-foreground text-xs">
                              {b.periodLabel} ({b.days} дн., {b.ratePercent}%)
                            </span>
                            <span className="font-medium">{fmt(b.interest)} ₽</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Введите параметры для расчёта</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">О расчёте</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  <strong>Ст. 395 ГК РФ</strong> — проценты за пользование чужими денежными средствами начисляются по ключевой ставке ЦБ РФ, действующей в соответствующие периоды.
                </p>
                <p>
                  Формула: Сумма долга × Кол-во дней / Дней в году × Ключевая ставка %. Дни в году: 365 (в високосном — 366).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
