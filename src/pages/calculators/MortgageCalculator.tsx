import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateMortgage, buildRefinancingSchedule } from "@/lib/calculators/refinancing";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function MortgageCalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState(10_000_000);
  const [downPayment, setDownPayment] = useState(2_000_000);
  const [annualRate, setAnnualRate] = useState(18);
  const [termYears, setTermYears] = useState(20);

  const result = useMemo(() => calculateMortgage(propertyPrice, downPayment, annualRate, termYears), [propertyPrice, downPayment, annualRate, termYears]);

  const schedule = useMemo(() => {
    if (result.principal <= 0) return null;
    return buildRefinancingSchedule(result.principal, annualRate, result.termMonths, "year");
  }, [result.principal, annualRate, result.termMonths]);

  const downPercent = propertyPrice > 0 ? Math.round((downPayment / propertyPrice) * 100) : 0;

  return (
    <CalculatorLayout calculatorId="mortgage" categoryName="Финансы" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ипотечный калькулятор</h1>
          <p className="text-muted-foreground mt-1">Расчёт аннуитетных платежей по ипотеке с графиком погашения</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">Параметры</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Стоимость квартиры (₽)</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(propertyPrice)}
                  onChange={(e) => setPropertyPrice(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>Первоначальный взнос (₽) — {downPercent}%</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(downPayment)}
                  onChange={(e) => setDownPayment(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ставка (% годовых)</Label>
                <Input type="number" step={0.1} min={0} max={100} value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="space-y-1.5">
                <Label>Срок (лет)</Label>
                <Input type="number" min={1} max={50} value={termYears}
                  onChange={(e) => setTermYears(Math.max(1, Number(e.target.value) || 1))} />
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Результат</CardTitle></CardHeader>
              <CardContent>
                {result.principal > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Сумма кредита</p>
                        <p className="text-lg font-bold">{fmt(result.principal)} ₽</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Ежемесячный платёж</p>
                        <p className="text-lg font-bold text-primary">{fmt(result.monthlyPayment)} ₽</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Переплата</p>
                        <p className="text-lg font-bold text-destructive">{fmt(result.totalInterest)} ₽</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Общая выплата</p>
                        <p className="text-lg font-bold">{fmt(result.totalPayment)} ₽</p>
                      </div>
                    </div>

                    {schedule && schedule.rows.length > 0 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">График по годам:</p>
                        <div className="grid grid-cols-5 gap-1 text-xs font-medium text-muted-foreground border-b border-border pb-1">
                          <span>Год</span><span>Платёж</span><span>Долг</span><span>Проценты</span><span>Остаток</span>
                        </div>
                        {schedule.rows.slice(0, 10).map((r, i) => (
                          <div key={i} className="grid grid-cols-5 gap-1 text-xs py-0.5 border-b border-border/50">
                            <span>{r.year}</span>
                            <span>{fmt(r.payment)}</span>
                            <span>{fmt(r.principal)}</span>
                            <span className="text-destructive">{fmt(r.interest)}</span>
                            <span>{fmt(r.balance)}</span>
                          </div>
                        ))}
                        {schedule.rows.length > 10 && (
                          <p className="text-xs text-muted-foreground">... ещё {schedule.rows.length - 10} лет</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Первоначальный взнос не может превышать стоимость квартиры</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">О расчёте</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Расчёт по формуле аннуитетного платежа: M = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), где P — сумма кредита, r — месячная ставка, n — срок в месяцах.</p>
                <p>Переплата — разница между суммой всех платежей и суммой кредита.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
