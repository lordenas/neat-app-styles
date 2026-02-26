import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INCOME_ICONS: Record<string, string> = {
  salary: "💼",
  svo: "🎖️",
  property_sale: "🏠",
  rent: "🔑",
  securities: "📈",
  dividends: "💰",
  deposit_interest: "🏦",
  prize: "🎁",
  manual: "✏️",
};

export default function NdflCalculatorPage() {
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

    let brackets = PROGRESSIVE_BRACKETS_2025;
    if (typeOption?.useSvoScale) brackets = SVO_BRACKETS;
    if (typeOption?.usePropertySaleScale) brackets = PROPERTY_SALE_BRACKETS;

    if (typeOption?.useProgressive || typeOption?.useSvoScale || typeOption?.usePropertySaleScale) {
      if (direction === "fromGross") {
        tax = calculateProgressiveNdfl(income, brackets);
        effectiveRate = income > 0 ? Math.round((tax / income) * 10000) / 100 : 0;
        return { gross: income, tax, net: Math.round((income - tax) * 100) / 100, effectiveRate };
      } else {
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

  const fmt = (v: number) =>
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const fmtInt = (v: number) => new Intl.NumberFormat("ru-RU").format(v);

  // Tax share for visual bar
  const taxShare = result ? Math.round((result.tax / result.gross) * 100) : 0;

  // Which brackets apply?
  const activeBrackets =
    typeOption?.useSvoScale
      ? SVO_BRACKETS
      : typeOption?.usePropertySaleScale
      ? PROPERTY_SALE_BRACKETS
      : PROGRESSIVE_BRACKETS_2025;

  return (
    <CalculatorLayout calculatorId="ndfl" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор НДФЛ</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт НДФЛ с учётом прогрессивной шкалы 2025 года, все виды дохода
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Inputs panel ── */}
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" /> Параметры
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Direction toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(["fromGross", "fromNet"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-xs font-medium transition-all",
                      direction === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {d === "fromGross"
                      ? <ArrowDownToLine className="h-4 w-4" />
                      : <ArrowUpFromLine className="h-4 w-4" />}
                    {d === "fromGross" ? "Из «грязной»" : "Из «чистой»"}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {d === "fromGross" ? "до вычета налога" : "после вычета налога"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {direction === "fromGross" ? "Доход до НДФЛ (₽)" : "Доход на руки (₽)"}
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(income)}
                  onChange={(e) => setIncome(Math.max(0, parseNumberInput(e.target.value)))}
                  className="text-lg font-semibold tabular-nums"
                />
              </div>

              {/* Income type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Вид дохода</Label>
                <Select value={incomeType} onValueChange={(v) => { setIncomeType(v as IncomeType); setManualRate(null); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        <span className="mr-1.5">{INCOME_ICONS[opt.id]}</span>{opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Non-resident toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Нерезидент РФ</p>
                  <p className="text-xs text-muted-foreground">Ставка 30% / 15%</p>
                </div>
                <Switch
                  id="non-res"
                  checked={isNonResident}
                  onCheckedChange={setIsNonResident}
                />
              </div>

              {/* Manual rate */}
              {(incomeType === "manual" || isNonResident) && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ставка (%)</Label>
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

          {/* ── Results ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero result */}
            <Card>
              <CardContent className="pt-5">
                {result ? (
                  <div className="space-y-5">
                    {/* Flow: gross → tax → net */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">До налога</p>
                        <p className="text-xl font-bold tabular-nums">{fmt(result.gross)}</p>
                        <p className="text-xs text-muted-foreground">₽</p>
                      </div>
                      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          НДФЛ
                        </p>
                        <p className="text-xl font-bold tabular-nums text-destructive">−{fmt(result.tax)}</p>
                        <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                          {result.effectiveRate}%
                        </Badge>
                      </div>
                      <div className="rounded-xl bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.2)] p-4 space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">На руки</p>
                        <p className="text-xl font-bold tabular-nums text-[hsl(var(--success))]">{fmt(result.net)}</p>
                        <p className="text-xs text-muted-foreground">₽</p>
                      </div>
                    </div>

                    {/* Visual bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>На руки — {100 - taxShare}%</span>
                        <span>НДФЛ — {taxShare}%</span>
                      </div>
                      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="bg-[hsl(var(--success))] transition-all duration-500"
                          style={{ width: `${100 - taxShare}%` }}
                        />
                        <div
                          className="bg-destructive/80 transition-all duration-500"
                          style={{ width: `${taxShare}%` }}
                        />
                      </div>
                    </div>

                    {/* Monthly breakdown */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">В месяц (до налога)</p>
                        <p className="text-base font-semibold tabular-nums">{fmt(result.gross / 12)} ₽</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">В месяц (на руки)</p>
                        <p className="text-base font-semibold tabular-nums text-[hsl(var(--success))]">{fmt(result.net / 12)} ₽</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <TrendingDown className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Введите сумму дохода</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax brackets table */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {typeOption?.useSvoScale
                    ? "Шкала НДФЛ: СВО"
                    : typeOption?.usePropertySaleScale
                    ? "Шкала НДФЛ: продажа имущества"
                    : "Прогрессивная шкала НДФЛ 2025"}
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  <span>нарастающим итогом</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Диапазон дохода</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ставка</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Налог с суммы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBrackets.map((b, i) => {
                      const prev = i === 0 ? 0 : activeBrackets[i - 1].limit;
                      const to = b.limit === Infinity ? "∞" : fmtInt(b.limit);
                      const from = fmtInt(prev);
                      const chunk = b.limit === Infinity ? null : (b.limit - prev) * (b.ratePercent / 100);

                      // Highlight the bracket the current income falls in
                      const isActive =
                        result &&
                        result.gross > prev &&
                        (b.limit === Infinity || result.gross <= b.limit);

                      return (
                        <tr
                          key={i}
                          className={cn(
                            "border-b border-border last:border-0 transition-colors",
                            isActive ? "bg-primary/8" : i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                          )}
                        >
                          <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                            {from} — {to} ₽
                            {isActive && (
                              <Badge className="ml-2 text-[10px] h-4 px-1.5" variant="default">
                                ваш доход
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                isActive && "border-primary text-primary bg-primary/10"
                              )}
                            >
                              {b.ratePercent}%
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground text-xs">
                            {chunk !== null ? `до ${fmtInt(chunk)} ₽` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
