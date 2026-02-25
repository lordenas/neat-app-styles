import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type PenaltyContractInput,
  type RateType,
  calcPenaltyContract,
} from "@/lib/calculators/penalty-contract";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const rateTypeLabels: Record<RateType, string> = {
  percent_per_year: "% годовых",
  percent_per_day: "% в день",
  fixed_per_day: "₽ в день",
};

export default function PenaltyContractCalculatorPage() {
  const [sum, setSum] = useState(500000);
  const [rateType, setRateType] = useState<RateType>("percent_per_day");
  const [rateValue, setRateValue] = useState(0.1);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [workdaysOnly, setWorkdaysOnly] = useState(false);

  const result = useMemo(() => {
    const input: PenaltyContractInput = {
      sum, startDate, endDate, workdaysOnly,
      excludedPeriods: [], rateType, rateValue,
      partialPayments: [], additionalDebts: [], showPerDebt: false,
    };
    return calcPenaltyContract(input);
  }, [sum, startDate, endDate, workdaysOnly, rateType, rateValue]);

  return (
    <CalculatorLayout calculatorId="penalty-contract" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Неустойка по договору</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт неустойки (пени, штрафа) за нарушение обязательств по договору
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма задолженности (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(sum)}
                  onChange={(e) => setSum(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

              <div className="space-y-1.5">
                <Label>Тип ставки</Label>
                <Select value={rateType} onValueChange={(v) => setRateType(v as RateType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(rateTypeLabels) as RateType[]).map((k) => (
                      <SelectItem key={k} value={k}>{rateTypeLabels[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Размер ставки</Label>
                <Input type="number" step={0.01} min={0} value={rateValue}
                  onChange={(e) => setRateValue(Math.max(0, Number(e.target.value) || 0))} />
              </div>

              <div className="space-y-1.5">
                <Label>Учёт дней</Label>
                <div className="flex gap-2">
                  <Badge variant={!workdaysOnly ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setWorkdaysOnly(false)}>
                    Календарные
                  </Badge>
                  <Badge variant={workdaysOnly ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setWorkdaysOnly(true)}>
                    Рабочие
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Период просрочки</Label>
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
                        <p className="text-xs font-medium text-muted-foreground mb-1">Задолженность</p>
                        <p className="text-xl font-bold">{fmt(sum)} ₽</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Неустойка</p>
                        <p className="text-xl font-bold text-destructive">{fmt(result.totalPenaltyCapped)} ₽</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Итого к оплате</p>
                        <p className="text-xl font-bold">{fmt(result.totalDebtAndPenalty)} ₽</p>
                      </div>
                    </div>

                    {result.breakdown.length > 0 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">Расчёт по периодам:</p>
                        {result.breakdown.filter(b => !b.isPayment && !b.isAdditionalDebt).slice(0, 10).map((b, i) => (
                          <div key={i} className={`flex justify-between py-1 border-b border-border last:border-0 ${b.isExcluded ? "opacity-50" : ""}`}>
                            <span className="text-muted-foreground text-xs">{b.periodLabel} ({b.days} дн.)</span>
                            <span className="font-medium">{fmt(b.penalty)} ₽</span>
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
                <p>Неустойка по договору начисляется за каждый день просрочки исполнения обязательств. Размер определяется условиями договора.</p>
                <p>Поддерживаются три типа ставок: процент годовых, процент в день, фиксированная сумма в день. Можно учитывать только рабочие дни по производственному календарю РФ.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
