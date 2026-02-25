import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calcPropertyDeduction,
  MAX_PROPERTY_DEDUCTION,
  MAX_TAX_RETURN,
  type PreviousUsePeriod,
} from "@/lib/calculators/property-deduction";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const PURCHASE_YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i).reverse();
const CURRENT_YEAR = new Date().getFullYear();

export default function PropertyDeductionCalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState(10_000_000);
  const [purchaseYear, setPurchaseYear] = useState(CURRENT_YEAR);
  const [usedPreviously, setUsedPreviously] = useState(false);
  const [previousUsePeriod, setPreviousUsePeriod] = useState<PreviousUsePeriod>("after_2014");
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(1_200_000);

  const result = useMemo(() => {
    const incomeByYear: Record<number, number> = {};
    // Spread income across 3 years for illustration
    for (let y = purchaseYear; y <= Math.min(purchaseYear + 2, CURRENT_YEAR); y++) {
      incomeByYear[y] = annualIncome;
    }
    return calcPropertyDeduction({
      propertyPrice, purchaseYear, usedPreviously,
      previousUsePeriod: usedPreviously ? previousUsePeriod : null,
      returnedAmount: usedPreviously && previousUsePeriod === "after_2014" ? returnedAmount : 0,
      incomeByYear,
    });
  }, [propertyPrice, purchaseYear, usedPreviously, previousUsePeriod, returnedAmount, annualIncome]);

  return (
    <CalculatorLayout calculatorId="property-deduction" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Имущественный вычет</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт налогового вычета при покупке квартиры (возврат НДФЛ до 260 000 ₽)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Стоимость квартиры (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(propertyPrice)}
                  onChange={(e) => setPropertyPrice(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

              <div className="space-y-1.5">
                <Label>Год покупки</Label>
                <Select value={String(purchaseYear)} onValueChange={(v) => setPurchaseYear(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PURCHASE_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Годовой доход (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(annualIncome)}
                  onChange={(e) => setAnnualIncome(Math.max(0, parseNumberInput(e.target.value)))} />
                <p className="text-xs text-muted-foreground">Для расчёта НДФЛ за 3 года</p>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="used-prev" checked={usedPreviously} onCheckedChange={(v) => setUsedPreviously(!!v)} />
                <Label htmlFor="used-prev" className="text-sm">Ранее использовал вычет</Label>
              </div>

              {usedPreviously && (
                <>
                  <div className="space-y-1.5">
                    <Label>Когда использовали</Label>
                    <div className="flex gap-2">
                      <Badge variant={previousUsePeriod === "before_2014" ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5" onClick={() => setPreviousUsePeriod("before_2014")}>
                        До 2014
                      </Badge>
                      <Badge variant={previousUsePeriod === "after_2014" ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5" onClick={() => setPreviousUsePeriod("after_2014")}>
                        После 2014
                      </Badge>
                    </div>
                  </div>

                  {previousUsePeriod === "after_2014" && (
                    <div className="space-y-1.5">
                      <Label>Уже возвращено (₽)</Label>
                      <Input type="text" inputMode="numeric"
                        value={formatNumberInput(returnedAmount)}
                        onChange={(e) => setReturnedAmount(Math.max(0, parseNumberInput(e.target.value)))} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Налоговый вычет</p>
                      <p className="text-xl font-bold">{fmt(result.unusedDeduction)} ₽</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Возврат НДФЛ (13%)</p>
                      <p className="text-xl font-bold text-primary">{fmt(result.taxToReturn)} ₽</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Доступно сейчас</p>
                      <p className="text-xl font-bold">{fmt(result.availableFromEnteredYears)} ₽</p>
                    </div>
                  </div>

                  {result.remainingForFutureYears > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p className="text-muted-foreground">
                        Остаток на будущие годы: <strong className="text-foreground">{fmt(result.remainingForFutureYears)} ₽</strong>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">О вычете</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Максимальный вычет при покупке жилья — <strong>{fmt(MAX_PROPERTY_DEDUCTION)} ₽</strong>. Возврат НДФЛ — до <strong>{fmt(MAX_TAX_RETURN)} ₽</strong> (13% от вычета).</p>
                <p>С 2014 года неиспользованный остаток можно перенести на другую квартиру. До 2014 — вычет давался один раз.</p>
                <p>Возврат ограничен суммой уплаченного НДФЛ за соответствующие годы. Остаток переносится на следующие годы.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
