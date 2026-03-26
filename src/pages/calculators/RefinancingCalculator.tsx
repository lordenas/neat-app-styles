import { useState, useMemo } from "react";
import { CpaBlock } from "@/components/cpa/CpaBlock";
import { REFINANCE_OFFERS } from "@/components/cpa/offers";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, ArrowRight, Minus } from "lucide-react";
import {
  calculateRefinancing,
  buildRefinancingSchedule,
  type RefinancingInput,
  type TermUnit,
} from "@/lib/calculators/refinancing";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { useBackendCalculation } from "../../hooks/useBackendCalculation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(v));

const fmtFull = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const TERM_OPTIONS = [5, 10, 15, 20, 25, 30];

function TermToggle({ value, onChange }: { value: TermUnit; onChange: (v: TermUnit) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1 rounded-lg border border-border p-0.5 bg-muted/30">
      {(["years", "months"] as TermUnit[]).map((u) => (
        <button key={u}
          onClick={() => onChange(u)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md font-medium transition-all",
            value === u ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          {u === "years" ? t("calculator.years") : t("calculator.months")}
        </button>
      ))}
    </div>
  );
}

export default function RefinancingCalculatorPage() {
  const { t } = useTranslation();
  const [remainingDebt, setRemainingDebt] = useState(5_000_000);
  const [remainingTerm, setRemainingTerm] = useState(15);
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [currentRate, setCurrentRate] = useState(18);
  const [newRate, setNewRate] = useState(14);
  const [newTerm, setNewTerm] = useState(15);
  const [newTermUnit, setNewTermUnit] = useState<TermUnit>("years");

  const req = useMemo(() => ({
    regionCode: "GLB",
    input: {
      remainingDebt, remainingTerm, remainingTermUnit: termUnit, currentRate,
      newRate, newTerm, newTermUnit,
    },
  }), [remainingDebt, remainingTerm, termUnit, currentRate, newRate, newTerm, newTermUnit]);
  const { data: backendData, error: backendError } = useBackendCalculation<{ currentMonthlyPayment: number; refinancedMonthlyPayment: number; currentTotalInterest: number; refinancedTotalInterest: number; currentTotalPayment: number; refinancedTotalPayment: number; totalInterestDelta: number; monthlyPaymentDelta: number; scheduleData?: unknown[] }>("refinancing", req);
  const result = backendData?.result ?? { currentMonthlyPayment: 0, refinancedMonthlyPayment: 0, currentTotalInterest: 0, refinancedTotalInterest: 0, currentTotalPayment: 0, refinancedTotalPayment: 0, totalInterestDelta: 0, monthlyPaymentDelta: 0, scheduleData: [] };
  /* Legacy: const result = useMemo(() => calculateRefinancing(input), [...]); */

  const chartData = useMemo(() => {
    const termMonths = termUnit === "years" ? remainingTerm * 12 : remainingTerm;
    const newTermMonths = newTermUnit === "years" ? newTerm * 12 : newTerm;
    const maxMonths = Math.max(termMonths, newTermMonths);
    const years = Math.ceil(maxMonths / 12);
    return Array.from({ length: Math.min(years, 30) }, (_, i) => ({
      year: i + 1,
      current: 0,
      refinanced: 0,
    }));
  }, [remainingTerm, termUnit, newTerm, newTermUnit]);

  const scheduleData = useMemo(() => {
    const termMonths = termUnit === "years" ? remainingTerm * 12 : remainingTerm;
    const newTermMonths = newTermUnit === "years" ? newTerm * 12 : newTerm;
    const { chartData: cur } = buildRefinancingSchedule(remainingDebt, currentRate, termMonths, "year");
    const { chartData: ref } = buildRefinancingSchedule(remainingDebt, newRate, newTermMonths, "year");
    const maxLen = Math.max(cur.length, ref.length);
    return Array.from({ length: Math.min(maxLen, 30) }, (_, i) => ({
      year: `${i + 1}`,
      currentInterest: cur[i]?.interest ?? 0,
      refinancedInterest: ref[i]?.interest ?? 0,
    }));
  }, [remainingDebt, currentRate, newRate, remainingTerm, termUnit, newTerm, newTermUnit]);

  const savings = result.totalInterestDelta;
  const monthlySavings = result.monthlyPaymentDelta;
  const hasSavings = savings < 0;

  return (
    <CalculatorLayout
      calculatorId="refinancing"
      categoryName="Финансы"
      categoryPath="/categories/finance"
      title={
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.refinancing")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.refinancing")}</p>
        </div>
      }
    >
      <div className="space-y-6">
        {backendError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {backendError}
          </div>
        )}

        {/* ── Parameters ── */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-5">
            {/* Debt */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("calculator.refinancing.remainingDebt")}, ₽</Label>
              <Input type="text" inputMode="numeric"
                value={formatNumberInput(remainingDebt)}
                onChange={(e) => setRemainingDebt(Math.max(0, parseNumberInput(e.target.value)))}
                className="text-base font-semibold tabular-nums h-10" />
            </div>

            {/* Current loan */}
            <div className="rounded-xl border border-border p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("calculator.refinancing.monthlyPayment")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("calculator.refinancing.currentRate")}, %</Label>
                  <Input type="number" step={0.1} min={0} value={currentRate}
                    onChange={(e) => setCurrentRate(Math.max(0, Number(e.target.value) || 0))}
                    className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("calculator.refinancing.remainingTerm")}</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} value={remainingTerm} className="h-10 flex-1"
                      onChange={(e) => setRemainingTerm(Math.max(1, Number(e.target.value) || 1))} />
                    <TermToggle value={termUnit} onChange={setTermUnit} />
                  </div>
                  {termUnit === "years" && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {TERM_OPTIONS.map((y) => (
                        <button key={y} onClick={() => setRemainingTerm(y)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all h-7",
                            remainingTerm === y ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                          )}>{y}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* New loan */}
            <div className="rounded-xl border border-primary/30 bg-primary/3 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("calculator.refinancing.refinancingParams")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("calculator.refinancing.newRate")}, %</Label>
                  <Input type="number" step={0.1} min={0} value={newRate}
                    onChange={(e) => setNewRate(Math.max(0, Number(e.target.value) || 0))}
                    className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("calculator.refinancing.newTerm")}</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} value={newTerm} className="h-10 flex-1"
                      onChange={(e) => setNewTerm(Math.max(1, Number(e.target.value) || 1))} />
                    <TermToggle value={newTermUnit} onChange={setNewTermUnit} />
                  </div>
                  {newTermUnit === "years" && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {TERM_OPTIONS.map((y) => (
                        <button key={y} onClick={() => setNewTerm(y)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all h-7",
                            newTerm === y ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                          )}>{y}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Hero result ── */}
        <div className={cn(
          "rounded-2xl border-2 p-6 flex flex-col sm:flex-row items-center gap-4 justify-between",
          hasSavings
            ? "border-[hsl(var(--success)/0.35)] dark:border-[hsl(var(--success)/0.2)] bg-[hsl(var(--success)/0.06)] dark:bg-[hsl(var(--success)/0.04)]"
            : "border-destructive/25 dark:border-destructive/15 bg-destructive/4 dark:bg-destructive/[0.03]"
        )}>
          <div className="flex items-center gap-3">
            {hasSavings
              ? <TrendingDown className="h-8 w-8 text-[hsl(var(--success))]" />
              : <TrendingUp className="h-8 w-8 text-destructive" />}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {hasSavings ? t("calculator.refinancing.interestSavings", { amount: "" }).replace(" ", "") : t("calculator.refinancing.interestIncrease", { amount: "" }).replace(" ", "")}
              </p>
              <p className={cn("text-3xl font-bold tabular-nums", hasSavings ? "text-[hsl(var(--success))]" : "text-destructive")}>
                {fmt(Math.abs(savings))} ₽
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasSavings
                  ? t("calculator.refinancing.monthlySavings", { amount: fmt(Math.abs(monthlySavings)) + " ₽" })
                  : t("calculator.refinancing.monthlyIncrease", { amount: fmt(Math.abs(monthlySavings)) + " ₽" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t("calculator.monthlyPayment")}</p>
              <p className="font-bold tabular-nums text-lg">{fmt(result.currentMonthlyPayment)} ₽</p>
              <p className="text-xs text-muted-foreground">{currentRate}%</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t("calculator.refinancing.afterRefinancing")}</p>
              <p className={cn("font-bold tabular-nums text-lg", hasSavings ? "text-[hsl(var(--success))]" : "text-destructive")}>
                {fmt(result.refinancedMonthlyPayment)} ₽
              </p>
              <p className="text-xs text-muted-foreground">{newRate}%</p>
            </div>
          </div>
        </div>

        {/* ── Side-by-side comparison ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: t("calculator.refinancing.monthlyPayment"),
              rate: `${currentRate}%`,
              term: `${remainingTerm} ${termUnit === "years" ? t("calculator.years").toLowerCase() : t("calculator.months").toLowerCase()}`,
              monthly: result.currentMonthlyPayment,
              interest: result.currentTotalInterest,
              total: result.currentTotalPayment,
              highlight: false,
            },
            {
              label: t("calculator.refinancing.afterRefinancing"),
              rate: `${newRate}%`,
              term: `${newTerm} ${newTermUnit === "years" ? t("calculator.years").toLowerCase() : t("calculator.months").toLowerCase()}`,
              monthly: result.refinancedMonthlyPayment,
              interest: result.refinancedTotalInterest,
              total: result.refinancedTotalPayment,
              highlight: true,
            },
          ].map((col, i) => (
            <div key={i} className={cn(
              "rounded-xl border p-5 space-y-3",
              col.highlight ? "border-primary/40 bg-primary/4" : "border-border bg-muted/20"
            )}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.label}</p>
                <span className="text-xs bg-muted rounded px-2 py-0.5 tabular-nums">{col.rate} · {col.term}</span>
              </div>
              <div className="space-y-2">
                {[
                  [t("calculator.monthlyPayment"), col.monthly],
                  [t("calculator.totalInterest"), col.interest],
                  [t("calculator.totalAmount"), col.total],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold tabular-nums">{fmtFull(value as number)} ₽</span>
                  </div>
                ))}
              </div>
              {i === 1 && (
                <div className="border-t border-border pt-2 mt-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("calculator.refinancing.savings")}</span>
                  <span className={cn("font-bold tabular-nums", hasSavings ? "text-[hsl(var(--success))]" : "text-destructive")}>
                    {hasSavings ? "−" : "+"}{fmt(Math.abs(savings))} ₽
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Breakdown table ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("calculator.refinancing.inputParameters")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"></th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">{t("calculator.refinancing.monthlyPayment")}</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">{t("calculator.refinancing.afterRefinancing")}</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Δ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [t("calculator.monthlyPayment"), result.currentMonthlyPayment, result.refinancedMonthlyPayment],
                  [t("calculator.totalInterest"), result.currentTotalInterest, result.refinancedTotalInterest],
                  [t("calculator.totalAmount"), result.currentTotalPayment, result.refinancedTotalPayment],
                ].map(([label, cur, ref], i) => {
                  const delta = (ref as number) - (cur as number);
                  return (
                    <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{label as string}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-xs">{fmtFull(cur as number)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-xs">{fmtFull(ref as number)}</td>
                      <td className={cn("px-4 py-2.5 text-right tabular-nums font-semibold text-xs",
                        delta < 0 ? "text-[hsl(var(--success))]" : delta > 0 ? "text-destructive" : "text-muted-foreground")}>
                        {delta === 0 ? <Minus className="h-3 w-3 inline" /> : `${delta < 0 ? "−" : "+"}${fmt(Math.abs(delta))}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* ── Annual interest chart ── */}
        {scheduleData.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("calculator.refinancing.repaymentChartTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scheduleData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} className="fill-muted-foreground" />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="currentInterest" name={t("calculator.refinancing.monthlyPayment")} fill="hsl(var(--muted-foreground) / 0.5)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="refinancedInterest" name={t("calculator.refinancing.afterRefinancing")} fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* CPA Block */}
      <div className="mt-8">
        <CpaBlock
          title="Выгодные предложения по рефинансированию"
          subtitle="Снизьте ставку — банки готовы предложить лучшие условия"
          offers={REFINANCE_OFFERS}
        />
      </div>
    </CalculatorLayout>
  );
}
