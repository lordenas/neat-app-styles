import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  calcLoanInterest,
  type LoanInterestInput,
  type Payout,
  type DebtIncrease,
} from "@/lib/calculators/loan-interest";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function LoanInterestCalculatorPage() {
  const [principal, setPrincipal] = useState(500_000);
  const [initialRate, setInitialRate] = useState(10);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [debtIncreases, setDebtIncreases] = useState<DebtIncrease[]>([]);

  const result = useMemo(() => {
    const input: LoanInterestInput = {
      principal, startDate, endDate, initialRatePercent: initialRate,
      rateChanges: [], payouts, debtIncreases,
      payoutAppliesToInterestFirst: true,
    };
    return calcLoanInterest(input);
  }, [principal, startDate, endDate, initialRate, payouts, debtIncreases]);

  return (
    <CalculatorLayout calculatorId="loan-interest" categoryName="Финансы" categoryPath="/categories/finance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Проценты по займу (ст. 809 ГК)</h1>
          <p className="text-muted-foreground mt-1">Расчёт процентов по договору займа по ставке договора</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">Параметры</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма займа (₽)</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(principal)}
                  onChange={(e) => setPrincipal(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ставка (% годовых)</Label>
                <Input type="number" step={0.1} min={0} value={initialRate}
                  onChange={(e) => setInitialRate(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="space-y-1.5">
                <Label>Период</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Выдача</span>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Возврат</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Частичные выплаты</Label>
                {payouts.map((p, i) => (
                  <div key={i} className="flex gap-1 items-end">
                    <Input type="date" value={p.date} className="flex-1"
                      onChange={(e) => { const arr = [...payouts]; arr[i] = { ...arr[i], date: e.target.value }; setPayouts(arr); }} />
                    <Input type="text" inputMode="numeric" value={formatNumberInput(p.amount)} className="flex-1"
                      onChange={(e) => { const arr = [...payouts]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setPayouts(arr); }} />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setPayouts(payouts.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPayouts([...payouts, { date: new Date().toISOString().slice(0, 10), amount: 0 }])}>
                  + Добавить выплату
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Результат</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Сумма займа</p>
                      <p className="text-xl font-bold">{fmt(principal)} ₽</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Проценты ({result.totalDays} дн.)
                      </p>
                      <p className="text-xl font-bold text-destructive">{fmt(result.totalInterest)} ₽</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Итого к возврату</p>
                      <p className="text-xl font-bold">{fmt(result.totalDebtAndInterest)} ₽</p>
                    </div>
                  </div>

                  {result.rows.length > 0 && (
                    <div className="text-sm space-y-1 pt-2">
                      <p className="font-medium text-foreground">Расчёт по периодам:</p>
                      {result.rows
                        .filter((r): r is Extract<typeof r, { type: "period" }> => r.type === "period")
                        .slice(0, 10)
                        .map((r, i) => (
                          <div key={i} className="flex justify-between py-1 border-b border-border last:border-0">
                            <span className="text-muted-foreground text-xs">
                              {r.dateFrom} – {r.dateTo} ({r.days} дн., {r.ratePercent}%)
                            </span>
                            <span className="font-medium">{fmt(r.periodInterest)} ₽</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">О расчёте</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p><strong>Ст. 809 ГК РФ:</strong> проценты начисляются со дня, следующего за днём выдачи займа, по дату возврата включительно.</p>
                <p>Формула: P = S × D / 365 × R%, где S — остаток долга, D — кол-во дней, R — ставка.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
