import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  calcPropertySaleTax,
  DEFAULT_COEFFICIENT,
  type PropertySaleTaxInput,
} from "@/lib/calculators/property-sale-tax";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function PropertySaleTaxCalculatorPage() {
  const [ownershipBefore2016, setOwnershipBefore2016] = useState(false);
  const [acquisitionType, setAcquisitionType] = useState<"purchase" | "other">("purchase");
  const [isSoleHousing, setIsSoleHousing] = useState(false);
  const [yearsHeld, setYearsHeld] = useState(2);
  const [salePrice, setSalePrice] = useState(8_000_000);
  const [cadastralValue, setCadastralValue] = useState(7_000_000);
  const [coefficient, setCoefficient] = useState(DEFAULT_COEFFICIENT);
  const [useFixedDeduction, setUseFixedDeduction] = useState(true);
  const [purchaseExpenses, setPurchaseExpenses] = useState(5_000_000);
  const [saleAfter2025, setSaleAfter2025] = useState(true);

  const result = useMemo(() => {
    const input: PropertySaleTaxInput = {
      ownershipBefore2016, acquisitionType, isSoleHousing, yearsHeld,
      salePrice, cadastralValue, coefficient, useFixedDeduction, purchaseExpenses, saleAfter2025,
    };
    return calcPropertySaleTax(input);
  }, [ownershipBefore2016, acquisitionType, isSoleHousing, yearsHeld, salePrice, cadastralValue, coefficient, useFixedDeduction, purchaseExpenses, saleAfter2025]);

  return (
    <CalculatorLayout calculatorId="property-sale-tax" categoryName="Налоги" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Налог с продажи квартиры</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт НДФЛ при продаже недвижимости с учётом срока владения и кадастровой стоимости
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Цена продажи (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(salePrice)}
                  onChange={(e) => setSalePrice(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

              <div className="space-y-1.5">
                <Label>Кадастровая стоимость (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(cadastralValue)}
                  onChange={(e) => setCadastralValue(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

              <div className="space-y-1.5">
                <Label>Понижающий коэффициент</Label>
                <Input type="number" step={0.1} min={0} max={1} value={coefficient}
                  onChange={(e) => setCoefficient(Number(e.target.value) || DEFAULT_COEFFICIENT)} />
              </div>

              <div className="space-y-1.5">
                <Label>Срок владения (лет)</Label>
                <Input type="number" min={0} max={50} value={yearsHeld}
                  onChange={(e) => setYearsHeld(Math.max(0, Number(e.target.value) || 0))} />
              </div>

              <div className="space-y-1.5">
                <Label>Способ приобретения</Label>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={acquisitionType === "purchase" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5" onClick={() => setAcquisitionType("purchase")}>
                    Покупка
                  </Badge>
                  <Badge variant={acquisitionType === "other" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5" onClick={() => setAcquisitionType("other")}>
                    Наследство/дарение
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="sole" checked={isSoleHousing} onCheckedChange={(v) => setIsSoleHousing(!!v)} />
                  <Label htmlFor="sole" className="text-sm">Единственное жильё</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="before2016" checked={ownershipBefore2016} onCheckedChange={(v) => setOwnershipBefore2016(!!v)} />
                  <Label htmlFor="before2016" className="text-sm">Право собственности до 2016</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="after2025" checked={saleAfter2025} onCheckedChange={(v) => setSaleAfter2025(!!v)} />
                  <Label htmlFor="after2025" className="text-sm">Продажа после 01.01.2025</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Вычет</Label>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={useFixedDeduction ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5" onClick={() => setUseFixedDeduction(true)}>
                    1 000 000 ₽
                  </Badge>
                  <Badge variant={!useFixedDeduction ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5" onClick={() => setUseFixedDeduction(false)}>
                    Расходы на покупку
                  </Badge>
                </div>
              </div>

              {!useFixedDeduction && (
                <div className="space-y-1.5">
                  <Label>Расходы на покупку (₽)</Label>
                  <Input type="text" inputMode="numeric"
                    value={formatNumberInput(purchaseExpenses)}
                    onChange={(e) => setPurchaseExpenses(Math.max(0, parseNumberInput(e.target.value)))} />
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Доход для расчёта</p>
                      <p className="text-xl font-bold">{fmt(result.taxableIncome)} ₽</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.useSalePriceForIncome ? "Цена продажи" : "Кадастр × коэф."}
                      </p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Налогооблагаемая база</p>
                      <p className="text-xl font-bold">{fmt(result.taxableBase)} ₽</p>
                    </div>
                    <div className={`rounded-lg p-4 ${result.noTax ? "bg-green-500/10" : "bg-destructive/10"}`}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Налог (НДФЛ)</p>
                      <p className={`text-xl font-bold ${result.noTax ? "text-green-600" : "text-destructive"}`}>
                        {result.noTax ? "0 ₽" : `${fmt(result.tax)} ₽`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                    <p>{result.explanation}</p>
                    <p className="mt-1">Минимальный срок владения: <strong>{result.minPeriodYears} лет</strong></p>
                  </div>

                  {result.rateBreakdown && (
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-foreground">Разбивка по ставкам:</p>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">До 2 400 000 ₽ × 13%</span>
                        <span>{fmt(result.rateBreakdown.taxAt13)} ₽</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Свыше 2 400 000 ₽ × 15%</span>
                        <span>{fmt(result.rateBreakdown.taxAt15)} ₽</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">О расчёте</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Доход от продажи берётся как максимум из цены продажи и 70% кадастровой стоимости. С 2025 года действует прогрессивная шкала НДФЛ: 13% до 2 400 000 ₽ и 15% свыше.</p>
                <p>Минимальный срок владения: 3 года (наследство, дарение, единственное жильё, право до 2016) или 5 лет в остальных случаях.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
