import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  calculateMicroloan,
  type MicroloanInput,
  type RateUnit,
  type OverduePeriodUnit,
} from "@/lib/calculators/microloan";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function MicroloanCalculatorPage() {
  const [amount, setAmount] = useState(30000);
  const [termDays, setTermDays] = useState(30);
  const [rate, setRate] = useState(0.8);
  const [rateUnit, setRateUnit] = useState<RateUnit>("day");
  const [hasOverdue, setHasOverdue] = useState(false);
  const [overduePeriod, setOverduePeriod] = useState(10);
  const [overdueUnit, setOverdueUnit] = useState<OverduePeriodUnit>("days");
  const [overdueRate, setOverdueRate] = useState(2);
  const [overdueRateUnit, setOverdueRateUnit] = useState<RateUnit>("day");
  const [penaltyAmount, setPenaltyAmount] = useState(0);

  const result = useMemo(() => {
    const input: MicroloanInput = { amount, termDays, rate, rateUnit, hasOverdue, overduePeriod, overdueUnit, overdueRate, overdueRateUnit, penaltyAmount };
    return calculateMicroloan(input);
  }, [amount, termDays, rate, rateUnit, hasOverdue, overduePeriod, overdueUnit, overdueRate, overdueRateUnit, penaltyAmount]);

  return (
    <CalculatorLayout calculatorId="microloan" categoryName="Финансы" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор микрозайма</h1>
          <p className="text-muted-foreground mt-1">Расчёт процентов, переплаты и штрафов по микрозайму</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">Параметры</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма займа (₽)</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(amount)}
                  onChange={(e) => setAmount(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>Срок (дней)</Label>
                <Input type="number" min={1} max={365} value={termDays}
                  onChange={(e) => setTermDays(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div className="space-y-1.5">
                <Label>Процентная ставка</Label>
                <div className="flex gap-2 items-end">
                  <Input type="number" step={0.01} min={0} value={rate} className="flex-1"
                    onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))} />
                  <div className="flex gap-1">
                    <Badge variant={rateUnit === "day" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setRateUnit("day")}>% / день</Badge>
                    <Badge variant={rateUnit === "month" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setRateUnit("month")}>% / мес</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="overdue" checked={hasOverdue} onCheckedChange={(v) => setHasOverdue(!!v)} />
                <Label htmlFor="overdue" className="text-sm">Есть просрочка</Label>
              </div>

              {hasOverdue && (
                <div className="space-y-3 pl-2 border-l-2 border-destructive/30">
                  <div className="space-y-1.5">
                    <Label>Период просрочки</Label>
                    <div className="flex gap-2 items-end">
                      <Input type="number" min={0} value={overduePeriod} className="flex-1"
                        onChange={(e) => setOverduePeriod(Math.max(0, Number(e.target.value) || 0))} />
                      <div className="flex gap-1">
                        <Badge variant={overdueUnit === "days" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setOverdueUnit("days")}>дн.</Badge>
                        <Badge variant={overdueUnit === "months" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setOverdueUnit("months")}>мес.</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ставка просрочки</Label>
                    <div className="flex gap-2 items-end">
                      <Input type="number" step={0.01} min={0} value={overdueRate} className="flex-1"
                        onChange={(e) => setOverdueRate(Math.max(0, Number(e.target.value) || 0))} />
                      <div className="flex gap-1">
                        <Badge variant={overdueRateUnit === "day" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setOverdueRateUnit("day")}>%/д</Badge>
                        <Badge variant={overdueRateUnit === "month" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setOverdueRateUnit("month")}>%/м</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Штраф (₽)</Label>
                    <Input type="text" inputMode="numeric" value={formatNumberInput(penaltyAmount)}
                      onChange={(e) => setPenaltyAmount(Math.max(0, parseNumberInput(e.target.value)))} />
                  </div>
                </div>
              )}
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
                      <p className="text-xl font-bold">{fmt(amount)} ₽</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Проценты</p>
                      <p className="text-xl font-bold text-destructive">{fmt(result.interestAccrued)} ₽</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">К возврату</p>
                      <p className="text-xl font-bold">{fmt(result.totalToRepay)} ₽</p>
                    </div>
                  </div>

                  {hasOverdue && result.overdueTotal > 0 && (
                    <div className="bg-destructive/5 rounded-lg p-4">
                      <p className="text-sm font-medium text-destructive mb-1">Просрочка</p>
                      <p className="text-sm">Проценты за просрочку: {fmt(result.overdueInterest)} ₽</p>
                      <p className="text-sm">Итого штрафы: {fmt(result.overdueTotal)} ₽</p>
                      <p className="text-lg font-bold text-destructive mt-2">Всего к оплате: {fmt(result.grandTotal)} ₽</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
