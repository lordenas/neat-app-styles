import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  calcPropertySaleTax,
  DEFAULT_COEFFICIENT,
  FIXED_DEDUCTION,
  type PropertySaleTaxInput,
} from "@/lib/calculators/property-sale-tax";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { Home, Gift, CheckCircle2, ShieldX } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtInt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

const ACQUISITION_TYPES = [
  { id: "purchase" as const, label: "Покупка", icon: <Home className="h-4 w-4" />, desc: "Возмездное приобретение" },
  { id: "other" as const, label: "Наследство / дарение", icon: <Gift className="h-4 w-4" />, desc: "Безвозмездное получение" },
];

const DEDUCTION_TYPES = [
  { id: true, label: "Вычет 1 000 000 ₽", desc: "Стандартный имущественный вычет" },
  { id: false, label: "Расходы на покупку", desc: "Фактически понесённые расходы" },
];

const YEARS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

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
    <CalculatorLayout
      calculatorId="property-sale-tax"
      categoryName="Налоги"
      categoryPath="/categories/taxes"
      title={
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Налог с продажи квартиры</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт НДФЛ при продаже недвижимости с учётом срока владения и кадастровой стоимости
          </p>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Parameters bar ── */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-4">
            {/* Prices row */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <Label className="text-xs text-muted-foreground">Цена продажи, ₽</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(salePrice)}
                  onChange={(e) => setSalePrice(Math.max(0, parseNumberInput(e.target.value)))}
                  className="text-base font-semibold tabular-nums h-10" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <Label className="text-xs text-muted-foreground">Кадастровая стоимость, ₽</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(cadastralValue)}
                  onChange={(e) => setCadastralValue(Math.max(0, parseNumberInput(e.target.value)))}
                  className="h-10" />
              </div>
              <div className="space-y-1.5 w-28 shrink-0">
                <Label className="text-xs text-muted-foreground">Коэффициент</Label>
                <Input type="number" step={0.1} min={0} max={1} value={coefficient}
                  onChange={(e) => setCoefficient(Number(e.target.value) || DEFAULT_COEFFICIENT)}
                  className="h-10" />
              </div>
            </div>

            {/* Years held */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <Label className="text-xs text-muted-foreground">Срок владения (лет)</Label>
              <div className="flex flex-wrap gap-1.5">
                {YEARS_OPTIONS.map((y) => (
                  <button key={y} onClick={() => setYearsHeld(y)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all h-9 w-10",
                      yearsHeld === y ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}>{y}</button>
                ))}
                <Input type="number" min={0} max={50} value={yearsHeld}
                  onChange={(e) => setYearsHeld(Math.max(0, Number(e.target.value) || 0))}
                  className="h-9 w-20 text-sm" />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4">
              {([
                [isSoleHousing, setIsSoleHousing, "sole", "Единственное жильё"],
                [ownershipBefore2016, setOwnershipBefore2016, "before2016", "Право собственности до 2016"],
                [saleAfter2025, setSaleAfter2025, "after2025", "Продажа после 01.01.2025"],
              ] as const).map(([checked, setter, id, label]) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox id={id} checked={checked} onCheckedChange={(v) => setter(!!v)} />
                  <Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Acquisition type cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACQUISITION_TYPES.map((t) => (
            <button key={t.id} onClick={() => setAcquisitionType(t.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                acquisitionType === t.id ? "border-primary bg-primary/8 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}>
              <div className={cn("mt-0.5 rounded-md p-1.5", acquisitionType === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                {t.icon}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", acquisitionType === t.id && "text-primary")}>{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Deduction type cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEDUCTION_TYPES.map((t) => (
            <button key={String(t.id)} onClick={() => setUseFixedDeduction(t.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                useFixedDeduction === t.id ? "border-primary bg-primary/8 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}>
              <div className={cn("mt-0.5 rounded-md p-1.5 shrink-0", useFixedDeduction === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                <span className="text-xs font-bold">₽</span>
              </div>
              <div>
                <p className={cn("text-sm font-semibold", useFixedDeduction === t.id && "text-primary")}>{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {!useFixedDeduction && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Расходы на покупку, ₽</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(purchaseExpenses)}
                  onChange={(e) => setPurchaseExpenses(Math.max(0, parseNumberInput(e.target.value)))}
                  className="h-10 text-base font-semibold tabular-nums" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Results ── */}
        <div className="space-y-4">
          {/* Hero stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Налогооблагаемый доход</p>
              <p className="text-2xl font-bold tabular-nums">{fmtInt(result.taxableIncome)}</p>
              <p className="text-xs text-muted-foreground">{result.useSalePriceForIncome ? "цена продажи" : "кадастр × коэф."}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">База после вычета</p>
              <p className="text-2xl font-bold tabular-nums">{fmtInt(result.taxableBase)}</p>
              <p className="text-xs text-muted-foreground">₽</p>
            </div>
            <div className={cn(
              "rounded-xl border p-5 space-y-1 text-center",
              result.noTax ? "border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.08)]" : "border-destructive/30 bg-destructive/8"
            )}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Налог (НДФЛ)</p>
              <p className={cn("text-2xl font-bold tabular-nums", result.noTax ? "text-[hsl(var(--success))]" : "text-destructive")}>
                {result.noTax ? "0" : fmt(result.tax)}
              </p>
              <p className="text-xs text-muted-foreground">₽</p>
            </div>
          </div>

          {/* Status banner */}
          <div className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3",
            result.noTax ? "border-[hsl(var(--success)/0.2)] bg-[hsl(var(--success)/0.05)]" : "border-border bg-muted/20"
          )}>
            {result.noTax
              ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-[hsl(var(--success))] shrink-0" />
              : <ShieldX className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            }
            <div className="text-sm text-muted-foreground">
              <p>{result.explanation}</p>
              {!result.noTax && (
                <p className="mt-0.5">Минимальный срок владения: <strong className="text-foreground">{result.minPeriodYears} лет</strong></p>
              )}
            </div>
          </div>

          {/* Breakdown table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Детализация расчёта</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["Цена продажи", fmt(salePrice) + " ₽"],
                    ["Кадастровая стоимость × " + coefficient, fmt(result.cadastralIncome) + " ₽"],
                    ["Налогооблагаемый доход", fmt(result.taxableIncome) + " ₽"],
                    ["Вычет", fmt(useFixedDeduction ? FIXED_DEDUCTION : purchaseExpenses) + " ₽"],
                    ["Налогооблагаемая база", fmt(result.taxableBase) + " ₽"],
                  ].map(([label, value], i) => (
                    <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{label}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">{value}</td>
                    </tr>
                  ))}
                  {result.rateBreakdown && !result.noTax && (
                    <>
                      <tr className="border-b border-border bg-muted/10">
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">До 2 400 000 ₽ × 13%</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmt(result.rateBreakdown.taxAt13)} ₽</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">Свыше 2 400 000 ₽ × 15%</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmt(result.rateBreakdown.taxAt15)} ₽</td>
                      </tr>
                    </>
                  )}
                  <tr className="border-t-2 border-border">
                    <td className="px-4 py-3 text-sm font-semibold">Итого НДФЛ</td>
                    <td className={cn("px-4 py-3 text-right tabular-nums font-bold text-base", result.noTax ? "text-[hsl(var(--success))]" : "text-destructive")}>
                      {result.noTax ? "0 ₽" : fmt(result.tax) + " ₽"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">О расчёте</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>Доход от продажи берётся как максимум из цены продажи и 70% кадастровой стоимости. С 2025 года действует прогрессивная шкала НДФЛ: 13% до 2 400 000 ₽ и 15% свыше.</p>
            <p>Минимальный срок владения: 3 года (наследство, дарение, единственное жильё, право до 2016) или 5 лет в остальных случаях.</p>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
