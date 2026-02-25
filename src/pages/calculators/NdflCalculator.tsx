import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  INCOME_TYPE_OPTIONS,
  PROGRESSIVE_BRACKETS_2025,
  SVO_BRACKETS,
  PROPERTY_SALE_BRACKETS,
  calculateProgressiveNdfl,
  calculateFlatNdfl,
  getDefaultRateForIncomeType,
  type IncomeType,
} from "@/lib/calculators/ndfl";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

export default function NdflCalculatorPage() {
  const { t } = useTranslation();

  const [income, setIncome] = useState(100000);
  const [incomeType, setIncomeType] = useState<IncomeType>("salary");
  const [isNonResident, setIsNonResident] = useState(false);
  const [direction, setDirection] = useState<"fromGross" | "fromNet">("fromGross");
  const [manualRate, setManualRate] = useState<number | null>(null);

  const typeOption = INCOME_TYPE_OPTIONS.find((o) => o.id === incomeType);

  const result = useMemo(() => {
    if (income <= 0) return null;

    let tax: number;
    let effectiveRate: number;

    if (isNonResident) {
      effectiveRate = manualRate ?? getDefaultRateForIncomeType(incomeType, true);
      if (direction === "fromGross") {
        tax = calculateFlatNdfl(income, effectiveRate);
      } else {
        const gross = income / (1 - effectiveRate / 100);
        tax = calculateFlatNdfl(gross, effectiveRate);
        return { gross: Math.round(gross * 100) / 100, tax, net: income, effectiveRate };
      }
      return { gross: income, tax, net: Math.round((income - tax) * 100) / 100, effectiveRate };
    }

    if (incomeType === "manual") {
      effectiveRate = manualRate ?? 13;
      if (direction === "fromGross") {
        tax = calculateFlatNdfl(income, effectiveRate);
      } else {
        const gross = income / (1 - effectiveRate / 100);
        tax = calculateFlatNdfl(gross, effectiveRate);
        return { gross: Math.round(gross * 100) / 100, tax, net: income, effectiveRate };
      }
      return { gross: income, tax, net: Math.round((income - tax) * 100) / 100, effectiveRate };
    }

    // Progressive or scale-based
    let brackets = PROGRESSIVE_BRACKETS_2025;
    if (typeOption?.useSvoScale) brackets = SVO_BRACKETS;
    if (typeOption?.usePropertySaleScale) brackets = PROPERTY_SALE_BRACKETS;

    if (typeOption?.useProgressive || typeOption?.useSvoScale || typeOption?.usePropertySaleScale) {
      if (direction === "fromGross") {
        tax = calculateProgressiveNdfl(income, brackets);
        effectiveRate = income > 0 ? Math.round((tax / income) * 10000) / 100 : 0;
        return { gross: income, tax, net: Math.round((income - tax) * 100) / 100, effectiveRate };
      } else {
        // Iterative search for gross from net using progressive scale
        let lo = income, hi = income * 2;
        for (let i = 0; i < 100; i++) {
          const mid = (lo + hi) / 2;
          const t = calculateProgressiveNdfl(mid, brackets);
          if (mid - t < income) lo = mid;
          else hi = mid;
        }
        const gross = Math.round(((lo + hi) / 2) * 100) / 100;
        tax = calculateProgressiveNdfl(gross, brackets);
        effectiveRate = gross > 0 ? Math.round((tax / gross) * 10000) / 100 : 0;
        return { gross, tax, net: income, effectiveRate };
      }
    }

    // Flat rate
    effectiveRate = typeOption?.defaultRatePercent ?? 13;
    if (direction === "fromGross") {
      tax = calculateFlatNdfl(income, effectiveRate);
      return { gross: income, tax, net: Math.round((income - tax) * 100) / 100, effectiveRate };
    } else {
      const gross = income / (1 - effectiveRate / 100);
      tax = calculateFlatNdfl(gross, effectiveRate);
      return { gross: Math.round(gross * 100) / 100, tax, net: income, effectiveRate };
    }
  }, [income, incomeType, isNonResident, direction, manualRate, typeOption]);

  const fmt = (v: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <CalculatorLayout calculatorId="ndfl" categoryName="Налоги" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор НДФЛ</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт НДФЛ с учётом прогрессивной шкалы 2025 года, все виды дохода
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма дохода (₽)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(income)}
                  onChange={(e) => setIncome(Math.max(0, parseNumberInput(e.target.value)))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Направление</Label>
                <div className="flex gap-2">
                  <Badge variant={direction === "fromGross" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setDirection("fromGross")}>
                    Из «грязной»
                  </Badge>
                  <Badge variant={direction === "fromNet" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setDirection("fromNet")}>
                    Из «чистой»
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Вид дохода</Label>
                <Select value={incomeType} onValueChange={(v) => { setIncomeType(v as IncomeType); setManualRate(null); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="non-res" checked={isNonResident} onChange={(e) => setIsNonResident(e.target.checked)} className="rounded" />
                <Label htmlFor="non-res" className="cursor-pointer text-sm">Нерезидент РФ</Label>
              </div>

              {(incomeType === "manual" || isNonResident) && (
                <div className="space-y-1.5">
                  <Label>Ставка (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={manualRate ?? getDefaultRateForIncomeType(incomeType, isNonResident)}
                    onChange={(e) => setManualRate(Number(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Доход до НДФЛ</p>
                      <p className="text-xl font-bold">{fmt(result.gross)} ₽</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        НДФЛ ({result.effectiveRate}%)
                      </p>
                      <p className="text-xl font-bold text-destructive">{fmt(result.tax)} ₽</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">На руки</p>
                      <p className="text-xl font-bold">{fmt(result.net)} ₽</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Введите сумму дохода</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Прогрессивная шкала НДФЛ 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {PROGRESSIVE_BRACKETS_2025.map((b, i) => {
                    const prev = i === 0 ? 0 : PROGRESSIVE_BRACKETS_2025[i - 1].limit;
                    const from = new Intl.NumberFormat("ru-RU").format(prev);
                    const to = b.limit === Infinity ? "∞" : new Intl.NumberFormat("ru-RU").format(b.limit);
                    return (
                      <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{from} — {to} ₽</span>
                        <Badge variant="outline">{b.ratePercent}%</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
