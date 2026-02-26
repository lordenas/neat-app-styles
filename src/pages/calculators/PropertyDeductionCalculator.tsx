import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  calcPropertyDeduction,
  MAX_PROPERTY_DEDUCTION,
  MAX_TAX_RETURN,
  type PreviousUsePeriod,
} from "@/lib/calculators/property-deduction";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { Home, ChevronDown, CheckCircle2, Clock } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtInt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

const PURCHASE_YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i).reverse();
const CURRENT_YEAR = new Date().getFullYear();

function getIncomeYears(purchaseYear: number): number[] {
  const diff = CURRENT_YEAR - purchaseYear;
  if (diff <= 0) return [];
  if (diff === 1) return [CURRENT_YEAR - 1];
  if (diff === 2) return [CURRENT_YEAR - 2, CURRENT_YEAR - 1];
  // diff >= 3: always show last 3 completed years
  return [CURRENT_YEAR - 3, CURRENT_YEAR - 2, CURRENT_YEAR - 1];
}

export default function PropertyDeductionCalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState(10_000_000);
  const [purchaseYear, setPurchaseYear] = useState(CURRENT_YEAR);
  const [incomeByYear, setIncomeByYear] = useState<Record<number, number>>({
    [CURRENT_YEAR]: 1_200_000,
    [CURRENT_YEAR - 1]: 1_200_000,
    [CURRENT_YEAR - 2]: 1_200_000,
  });
  const [usedPreviously, setUsedPreviously] = useState(false);
  const [previousUsePeriod, setPreviousUsePeriod] = useState<PreviousUsePeriod>("after_2014");
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const result = useMemo(() => {
    const relevantIncome: Record<number, number> = {};
    for (const y of getIncomeYears(purchaseYear)) {
      relevantIncome[y] = incomeByYear[y] ?? 0;
    }
    return calcPropertyDeduction({
      propertyPrice, purchaseYear, usedPreviously,
      previousUsePeriod: usedPreviously ? previousUsePeriod : null,
      returnedAmount: usedPreviously && previousUsePeriod === "after_2014" ? returnedAmount : 0,
      incomeByYear: relevantIncome,
    });
  }, [propertyPrice, purchaseYear, usedPreviously, previousUsePeriod, returnedAmount, incomeByYear]);

  const deductionUsed = Math.min(propertyPrice, MAX_PROPERTY_DEDUCTION);
  const deductionShare = MAX_PROPERTY_DEDUCTION > 0
    ? Math.min(100, Math.round(deductionUsed / MAX_PROPERTY_DEDUCTION * 100))
    : 0;
  const returnShare = MAX_TAX_RETURN > 0
    ? Math.min(100, Math.round(result.availableFromEnteredYears / MAX_TAX_RETURN * 100))
    : 0;

  const isFullyBlocked = usedPreviously && previousUsePeriod === "before_2014";

  return (
    <CalculatorLayout calculatorId="property-deduction" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Имущественный вычет</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт налогового вычета при покупке квартиры — возврат НДФЛ до 260 000 ₽
          </p>
        </div>

        {/* ── Parameters bar ── */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-4">
            {/* Row 1: price + year */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <Label className="text-xs text-muted-foreground">Стоимость квартиры, ₽</Label>
                <Input
                  type="text" inputMode="numeric"
                  value={formatNumberInput(propertyPrice)}
                  onChange={(e) => setPropertyPrice(Math.max(0, parseNumberInput(e.target.value)))}
                  className="text-base font-semibold tabular-nums h-10"
                />
              </div>
              <div className="space-y-1.5 shrink-0">
                <Label className="text-xs text-muted-foreground">Год покупки</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3].map((y) => (
                    <button
                      key={y}
                      onClick={() => setPurchaseYear(y)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all h-10",
                        purchaseYear === y
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >{y}</button>
                  ))}
                  <select
                    value={PURCHASE_YEARS.includes(purchaseYear) && purchaseYear < CURRENT_YEAR - 3 ? String(purchaseYear) : ""}
                    onChange={(e) => e.target.value && setPurchaseYear(Number(e.target.value))}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-sm font-medium h-10 bg-background transition-all",
                      purchaseYear < CURRENT_YEAR - 3
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    <option value="">Раньше…</option>
                    {PURCHASE_YEARS.filter(y => y < CURRENT_YEAR - 3).map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: income years based on purchase year */}
            {getIncomeYears(purchaseYear).length > 0 && (
              <div className="space-y-1.5 border-t border-border pt-4">
                <Label className="text-xs text-muted-foreground">Официальный доход по годам, ₽</Label>
                <div className="flex gap-3 flex-wrap">
                  {getIncomeYears(purchaseYear).map((y) => (
                    <div key={y} className="space-y-1 w-36">
                      <span className="text-xs text-muted-foreground">{y}</span>
                      <Input
                        type="text" inputMode="numeric"
                        value={formatNumberInput(incomeByYear[y] ?? 0)}
                        onChange={(e) => setIncomeByYear(prev => ({ ...prev, [y]: Math.max(0, parseNumberInput(e.target.value)) }))}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Advanced: previous use ── */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
              <span>Ранее использовал вычет</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Card>
              <CardContent className="pt-4 pb-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="used-prev" checked={usedPreviously}
                    onCheckedChange={(v) => setUsedPreviously(!!v)} />
                  <Label htmlFor="used-prev" className="text-sm cursor-pointer">
                    Я уже использовал имущественный вычет ранее
                  </Label>
                </div>

                {usedPreviously && (
                  <div className="space-y-4 pl-6 border-l border-border">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Когда использовали вычет</Label>
                      <div className="flex gap-2">
                        {([
                          ["before_2014", "До 2014 года", "Вычет исчерпан полностью"],
                          ["after_2014", "После 2014 года", "Остаток можно перенести"],
                        ] as const).map(([val, label, hint]) => (
                          <button
                            key={val}
                            onClick={() => setPreviousUsePeriod(val)}
                            className={cn(
                              "flex-1 rounded-lg border p-3 text-left transition-all",
                              previousUsePeriod === val
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/40"
                            )}
                          >
                            <p className={cn("text-sm font-medium", previousUsePeriod === val && "text-primary")}>{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {previousUsePeriod === "after_2014" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Уже возвращено НДФЛ, ₽</Label>
                        <Input type="text" inputMode="numeric"
                          value={formatNumberInput(returnedAmount)}
                          onChange={(e) => setReturnedAmount(Math.max(0, parseNumberInput(e.target.value)))}
                          className="h-9" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ── Results ── */}
        {isFullyBlocked ? (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
              <Home className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium">Вычет недоступен</p>
              <p className="text-xs text-muted-foreground">Вычет до 2014 года предоставлялся один раз — перенос остатка не предусмотрен</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Hero stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Налоговый вычет</p>
                <p className="text-2xl font-bold tabular-nums">{fmtInt(result.unusedDeduction)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/8 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Возврат НДФЛ (13%)</p>
                <p className="text-2xl font-bold tabular-nums text-primary">+{fmt(result.taxToReturn)}</p>
                <p className="text-xs text-muted-foreground">₽ максимум</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Доступно сейчас</p>
                <p className="text-2xl font-bold tabular-nums">{fmt(result.availableFromEnteredYears)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Использовано вычета</span>
                  <span>{fmtInt(deductionUsed)} / {fmtInt(MAX_PROPERTY_DEDUCTION)} ₽</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary/60 transition-all duration-500" style={{ width: `${deductionShare}%` }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Возврат НДФЛ доступно сейчас</span>
                  <span>{fmt(result.availableFromEnteredYears)} / {fmt(MAX_TAX_RETURN)} ₽</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${returnShare}%` }} />
                </div>
              </div>
            </div>

            {/* Breakdown card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Детализация</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Стоимость квартиры", fmtInt(propertyPrice) + " ₽"],
                      ["Лимит вычета (макс.)", fmt(MAX_PROPERTY_DEDUCTION) + " ₽"],
                      ["Применяемый вычет", fmt(result.unusedDeduction) + " ₽"],
                      ["Максимальный возврат НДФЛ", fmt(result.taxToReturn) + " ₽"],
                      ["НДФЛ уплачен (за 3 года)", fmt(result.totalNdflEntered) + " ₽"],
                      ["Доступно к возврату сейчас", fmt(result.availableFromEnteredYears) + " ₽"],
                    ].map(([label, value], i) => (
                      <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{label}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Remaining */}
            {result.remainingForFutureYears > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Остаток <strong className="text-foreground">{fmt(result.remainingForFutureYears)} ₽</strong> переносится на следующие налоговые периоды
                </p>
              </div>
            )}
            {result.remainingForFutureYears === 0 && result.taxToReturn > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Вся сумма <strong className="text-foreground">{fmt(result.taxToReturn)} ₽</strong> доступна к возврату уже сейчас
                </p>
              </div>
            )}
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">О вычете</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>Максимальный вычет при покупке жилья — <strong className="text-foreground">{fmt(MAX_PROPERTY_DEDUCTION)} ₽</strong>. Возврат НДФЛ — до <strong className="text-foreground">{fmt(MAX_TAX_RETURN)} ₽</strong> (13% от вычета).</p>
            <p>С 2014 года неиспользованный остаток можно перенести на другой объект. До 2014 года — вычет предоставлялся один раз.</p>
            <p>Возврат ограничен суммой уплаченного НДФЛ за соответствующие годы. Остаток переносится на следующие годы.</p>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
