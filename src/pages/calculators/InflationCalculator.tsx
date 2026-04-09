import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, ShoppingCart, PiggyBank, Calendar, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  computeInflation, priceChange, savingsDepreciation,
  RUSSIA_INFLATION_DATA, getCumulativeIndexSeries,
} from "@/lib/calculators/inflation";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { cn } from "@/lib/utils";

/** legacy-local-calc: no backend endpoint yet (migration gap). See apps/numlix-main/docs/MIGRATION_CALC_STATUS.md */

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtInt = (v: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(v));

const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

const AMOUNT_PRESETS = [10_000, 50_000, 100_000, 500_000, 1_000_000];

export default function InflationCalculatorPage() {
  const { t } = useTranslation();
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(2020);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(MAX_YEAR);
  const [amount, setAmount] = useState(100_000);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`calculator.inflation.months.${i + 1}`),
  }));

  const result = useMemo(() =>
    computeInflation({ startMonth, startYear, endMonth, endYear, inflationData: RUSSIA_INFLATION_DATA }),
    [startMonth, startYear, endMonth, endYear]);

  const priceNow = result ? priceChange(amount, result.totalFactor) : amount;
  const realValue = result ? savingsDepreciation(amount, result.totalFactor) : amount;

  const cumulativeSeries = useMemo(() =>
    getCumulativeIndexSeries({ startMonth, startYear, endMonth, endYear, inflationData: RUSSIA_INFLATION_DATA }),
    [startMonth, startYear, endMonth, endYear]);

  const annualBarData = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.annualRates)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, rate]) => ({ year, rate }));
  }, [result]);

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.inflation")}</h1>
      <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.inflation")}</p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="inflation" categoryName="Финансы" categoryPath="/categories/finance" title={title}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input panel */}
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("calculator.inputTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Amount */}
              <div className="space-y-1.5">
                <Label>{t("calculator.inflation.amount")}</Label>
                <Input
                  type="text" inputMode="numeric"
                  value={formatNumberInput(amount)}
                  onChange={(e) => setAmount(Math.max(0, parseNumberInput(e.target.value)))}
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {AMOUNT_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAmount(p)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border transition-colors",
                        amount === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      )}
                    >
                      {fmtInt(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start period */}
              <div className="space-y-1.5">
                <Label>{t("calculator.inflation.startMonth")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={String(startMonth)} onValueChange={(v) => setStartMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {months.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={String(startYear)} onValueChange={(v) => setStartYear(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End period */}
              <div className="space-y-1.5">
                <Label>{t("calculator.inflation.endMonth")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={String(endMonth)} onValueChange={(v) => setEndMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {months.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={String(endYear)} onValueChange={(v) => setEndYear(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-5">
            {result ? (
              <>
                {/* Hero banner */}
                <div className="rounded-xl bg-destructive/10 dark:bg-destructive/[0.06] border border-destructive/20 dark:border-destructive/[0.12] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-medium text-destructive">{t("calculator.inflation.inflationForPeriod")}</span>
                  </div>
                  <p className="text-4xl font-bold text-destructive tracking-tight">
                    +{fmt(result.inflationPercent)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {months.find(m => m.value === startMonth)?.label} {startYear} — {months.find(m => m.value === endMonth)?.label} {endYear}
                  </p>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">{t("calculator.inflation.priceChangeResult")}</p>
                    </div>
                    <p className="text-xl font-bold">{fmt(priceNow)} ₽</p>
                    <p className="text-xs text-muted-foreground mt-0.5">было {fmt(amount)} ₽</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-destructive/10">
                        <PiggyBank className="h-4 w-4 text-destructive" />
                      </div>
                      <p className="text-xs text-muted-foreground">{t("calculator.inflation.savingsDepreciationResult")}</p>
                    </div>
                    <p className="text-xl font-bold">{fmt(realValue)} ₽</p>
                    <p className="text-xs text-muted-foreground mt-0.5">в ценах {startYear} г.</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-muted">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Обесценение</p>
                    </div>
                    <p className="text-xl font-bold text-destructive">−{fmt(amount - realValue)} ₽</p>
                    <p className="text-xs text-muted-foreground mt-0.5">потеря покупательной силы</p>
                  </Card>
                </div>

                {/* Cumulative index chart */}
                {cumulativeSeries.length > 1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        {t("calculator.inflation.chartCumulative")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={cumulativeSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit=" " />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                            formatter={(v: number) => [`${fmt(v)}`, t("calculator.inflation.indexLabel")]}
                          />
                          <Area type="monotone" dataKey="index" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#inflGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Annual rates bar chart */}
                {annualBarData.length > 1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t("calculator.inflation.annualRatesTable")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={annualBarData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                            formatter={(v: number) => [`${v}%`, t("calculator.inflation.annualRate")]}
                          />
                          <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Annual rates table (single-year or short period) */}
                {annualBarData.length === 1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t("calculator.inflation.annualRatesTable")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                        <span className="text-muted-foreground">{annualBarData[0].year}</span>
                        <span className="font-medium">{annualBarData[0].rate}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{t("calculator.inflation.noData")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
