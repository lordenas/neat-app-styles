import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, ReceiptText, CircleDollarSign } from "lucide-react";
import {
  type RateUnit,
  type OverduePeriodUnit,
} from "@/lib/calculators/microloan";
import { useBackendCalculation } from "../../hooks/useBackendCalculation";
/* Legacy: import { calculateMicroloan, type MicroloanInput } from "@/lib/calculators/microloan"; */
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtInt = (v: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(v));

const TERM_PRESETS = [7, 14, 21, 30, 45, 60];
const AMOUNT_PRESETS = [10_000, 20_000, 30_000, 50_000, 100_000];

type UnitToggleProps<T extends string> = {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
};
function UnitToggle<T extends string>({ value, options, onChange }: UnitToggleProps<T>) {
  return (
    <div className="flex gap-0.5 rounded-lg border border-border p-0.5 bg-muted/30 shrink-0">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap",
            value === o.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function MicroloanCalculatorPage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(30_000);
  const [termDays, setTermDays] = useState(30);
  const [rate, setRate] = useState(0.8);
  const [rateUnit, setRateUnit] = useState<RateUnit>("day");
  const [hasOverdue, setHasOverdue] = useState(false);
  const [overduePeriod, setOverduePeriod] = useState(10);
  const [overdueUnit, setOverdueUnit] = useState<OverduePeriodUnit>("days");
  const [overdueRate, setOverdueRate] = useState(2);
  const [overdueRateUnit, setOverdueRateUnit] = useState<RateUnit>("day");
  const [penaltyAmount, setPenaltyAmount] = useState(0);

  const req = useMemo(() => ({
    regionCode: "GLB",
    input: { amount, termDays, rate, rateUnit, hasOverdue, overduePeriod, overdueUnit, overdueRate, overdueRateUnit, penaltyAmount },
  }), [amount, termDays, rate, rateUnit, hasOverdue, overduePeriod, overdueUnit, overdueRate, overdueRateUnit, penaltyAmount]);
  const { data: backendData, error: backendError } = useBackendCalculation<{ interestAccrued: number; totalToRepay: number; overdueInterest: number; overdueTotal: number; grandTotal: number; dailyAccrual: Array<{ day: number; interest: number; total: number }> }>("microloan", req);
  const result = backendData?.result ?? { interestAccrued: 0, totalToRepay: 0, overdueInterest: 0, overdueTotal: 0, grandTotal: 0, dailyAccrual: [] as Array<{ day: number; interest: number; total: number }> };
  /* Legacy: const result = useMemo(() => calculateMicroloan(input), [...]); */

  const rateOpts = [
    { id: "day" as RateUnit, label: t("calculator.microloan.ratePerDay") },
    { id: "month" as RateUnit, label: t("calculator.microloan.ratePerMonth") },
  ];
  const periodOpts = [
    { id: "days" as OverduePeriodUnit, label: t("calculator.microloan.overdueDays") },
    { id: "months" as OverduePeriodUnit, label: t("calculator.microloan.overdueMonths") },
  ];

  // Chart: sample every N days to keep it readable
  const chartData = useMemo(() => {
    const step = Math.max(1, Math.ceil(result.dailyAccrual.length / 60));
    return result.dailyAccrual
      .filter((_, i) => i % step === 0 || i === result.dailyAccrual.length - 1)
      .map((r) => ({ day: r.day, total: r.total, interest: r.interest }));
  }, [result.dailyAccrual]);

  const overpaymentPct = amount > 0 ? (result.interestAccrued / amount) * 100 : 0;

  return (
    <CalculatorLayout
      calculatorId="microloan"
      categoryName="Финансы"
      categoryPath="/categories/finance"
      title={
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.microloan")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.microloan")}</p>
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
            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t("calculator.microloan.amount")}, ₽</Label>
              <Input
                type="text" inputMode="numeric"
                value={formatNumberInput(amount)}
                onChange={(e) => setAmount(Math.max(0, parseNumberInput(e.target.value)))}
                className="text-base font-semibold tabular-nums h-10"
              />
              <div className="flex flex-wrap gap-1.5">
                {AMOUNT_PRESETS.map((a) => (
                  <button key={a} onClick={() => setAmount(a)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all h-7",
                      amount === a ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}>
                    {fmtInt(a)}
                  </button>
                ))}
              </div>
            </div>

            {/* Term */}
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-xs text-muted-foreground">{t("calculator.microloan.loanTermDays")}</Label>
              <Input
                type="number" min={1} max={365} value={termDays}
                onChange={(e) => setTermDays(Math.max(1, Number(e.target.value) || 1))}
                className="h-10 w-32"
              />
              <div className="flex flex-wrap gap-1.5">
                {TERM_PRESETS.map((d) => (
                  <button key={d} onClick={() => setTermDays(d)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all h-7",
                      termDays === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}>
                    {d}д
                  </button>
                ))}
              </div>
            </div>

            {/* Rate */}
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-xs text-muted-foreground">{t("calculator.microloan.rate")}</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number" step={0.01} min={0} value={rate}
                  onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))}
                  className="h-10 flex-1 max-w-[120px]"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <UnitToggle value={rateUnit} options={rateOpts} onChange={(v) => setRateUnit(v as RateUnit)} />
              </div>
            </div>

            {/* Overdue toggle */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="overdue" checked={hasOverdue} onCheckedChange={(v) => setHasOverdue(!!v)} />
                <Label htmlFor="overdue" className="text-sm cursor-pointer font-medium">
                  {t("calculator.microloan.hasOverdue")}
                </Label>
              </div>

              {hasOverdue && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/4 p-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                    {t("calculator.microloan.overdueTotal")}
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t("calculator.microloan.overduePeriod")}</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="number" min={0} value={overduePeriod}
                        onChange={(e) => setOverduePeriod(Math.max(0, Number(e.target.value) || 0))}
                        className="h-9 flex-1 max-w-[100px]"
                      />
                      <UnitToggle value={overdueUnit} options={periodOpts} onChange={(v) => setOverdueUnit(v as OverduePeriodUnit)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t("calculator.microloan.overdueRate")}</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="number" step={0.01} min={0} value={overdueRate}
                        onChange={(e) => setOverdueRate(Math.max(0, Number(e.target.value) || 0))}
                        className="h-9 flex-1 max-w-[100px]"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                      <UnitToggle value={overdueRateUnit} options={rateOpts} onChange={(v) => setOverdueRateUnit(v as RateUnit)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t("calculator.microloan.penaltyAmount")}, ₽</Label>
                    <Input type="text" inputMode="numeric"
                      value={formatNumberInput(penaltyAmount)}
                      onChange={(e) => setPenaltyAmount(Math.max(0, parseNumberInput(e.target.value)))}
                      className="h-9 max-w-[180px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Hero stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: <CircleDollarSign className="h-4 w-4" />,
              label: t("calculator.microloan.amount"),
              value: fmt(amount) + " ₽",
              color: "text-foreground",
              bg: "bg-muted/40",
            },
            {
              icon: <TrendingUp className="h-4 w-4" />,
              label: t("calculator.microloan.interestAccrued"),
              value: fmt(result.interestAccrued) + " ₽",
              color: "text-destructive",
              bg: "bg-destructive/6",
            },
            {
              icon: <ReceiptText className="h-4 w-4" />,
              label: t("calculator.microloan.totalToRepay"),
              value: fmt(result.totalToRepay) + " ₽",
              color: "text-foreground font-bold",
              bg: "bg-primary/6",
            },
            {
              icon: <AlertTriangle className="h-4 w-4" />,
              label: "Переплата",
              value: overpaymentPct.toFixed(1) + "%",
              color: overpaymentPct > 100 ? "text-destructive" : "text-[hsl(var(--warning))]",
              bg: overpaymentPct > 100 ? "bg-destructive/6" : "bg-[hsl(var(--warning)/0.08)]",
            },
          ].map((s, i) => (
            <div key={i} className={cn("rounded-xl border border-border p-4 space-y-1.5", s.bg)}>
              <div className="flex items-center gap-1.5 text-muted-foreground">{s.icon}
                <p className="text-xs font-medium uppercase tracking-wide">{s.label}</p>
              </div>
              <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Overdue block ── */}
        {hasOverdue && result.overdueTotal > 0 && (
          <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-semibold text-destructive">{t("calculator.microloan.overdueTotal")}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{t("calculator.microloan.overdueInterest")}</p>
                <p className="font-semibold tabular-nums">{fmt(result.overdueInterest)} ₽</p>
              </div>
              {penaltyAmount > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("calculator.microloan.penaltyAmount")}</p>
                  <p className="font-semibold tabular-nums">{fmt(penaltyAmount)} ₽</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">{t("calculator.microloan.grandTotal")}</p>
                <p className="text-xl font-bold text-destructive tabular-nums">{fmt(result.grandTotal)} ₽</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Breakdown table ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("calculator.paymentBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Сумма займа", fmt(amount) + " ₽", false],
                  [t("calculator.microloan.interestAccrued"), fmt(result.interestAccrued) + " ₽", true],
                  ...(hasOverdue && result.overdueInterest > 0
                    ? [[t("calculator.microloan.overdueInterest"), fmt(result.overdueInterest) + " ₽", true]]
                    : []),
                  ...(penaltyAmount > 0 && hasOverdue
                    ? [[t("calculator.microloan.penaltyAmount"), fmt(penaltyAmount) + " ₽", true]]
                    : []),
                  [
                    hasOverdue && result.overdueTotal > 0
                      ? t("calculator.microloan.grandTotal")
                      : t("calculator.microloan.totalToRepay"),
                    fmt(hasOverdue && result.overdueTotal > 0 ? result.grandTotal : result.totalToRepay) + " ₽",
                    false,
                  ],
                ].map(([label, value, isRed], i, arr) => (
                  <tr key={i} className={cn(
                    "border-b border-border last:border-0",
                    i === arr.length - 1 ? "border-t-2" : i % 2 === 1 ? "bg-muted/10" : ""
                  )}>
                    <td className={cn(
                      "px-4 py-2.5 text-xs",
                      i === arr.length - 1 ? "font-semibold text-sm" : "text-muted-foreground"
                    )}>
                      {label as string}
                    </td>
                    <td className={cn(
                      "px-4 py-2.5 text-right tabular-nums",
                      i === arr.length - 1 ? "font-bold text-base" : "font-medium",
                      isRed ? "text-destructive" : ""
                    )}>
                      {value as string}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* ── Accrual chart ── */}
        {chartData.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("calculator.microloan.chartTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: "день", position: "insideBottomRight", offset: -4, fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${fmtInt(v)}`} width={70} />
                    <Tooltip
                      formatter={(v: number, name: string) => [fmt(v) + " ₽", name === "total" ? t("calculator.microloan.totalToRepay") : t("calculator.microloan.interestAccrued")]}
                      labelFormatter={(l) => `День ${l}`}
                    />
                    <ReferenceLine y={amount} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "тело займа", position: "insideTopRight", fontSize: 10 }} />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#totalGrad)" name="total" />
                    <Area type="monotone" dataKey="interest" stroke="hsl(var(--destructive))" strokeWidth={1.5} fill="url(#interestGrad)" name="interest" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </CalculatorLayout>
  );
}
