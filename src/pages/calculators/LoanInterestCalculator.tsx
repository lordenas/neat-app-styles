import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, TrendingUp, CalendarDays, Percent, Banknote, ChevronDown, ChevronUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  type Payout,
  type DebtIncrease,
  type RateChange,
} from "@/lib/calculators/loan-interest";
import { useBackendCalculation } from "../../hooks/useBackendCalculation";
/* Legacy: import { calcLoanInterest, type LoanInterestInput } from "@/lib/calculators/loan-interest"; */
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { cn } from "@/lib/utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const PRINCIPAL_PRESETS = [100_000, 300_000, 500_000, 1_000_000, 3_000_000];
const RATE_PRESETS = [7.5, 10, 12, 15, 21];

interface LoanInterestPeriodRow {
  type: "period";
  dateFrom: string;
  dateTo: string;
  days: number;
  principal: number;
  ratePercent: number;
  periodInterest: number;
  cumulativeInterest: number;
}

interface LoanInterestMetaRow {
  type: string;
}

type LoanInterestRow = LoanInterestPeriodRow | LoanInterestMetaRow;

function isPeriodRow(row: LoanInterestRow): row is LoanInterestPeriodRow {
  return row.type === "period";
}

export default function LoanInterestCalculatorPage() {
  const [principal, setPrincipal] = useState(500_000);
  const [initialRate, setInitialRate] = useState(10);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [debtIncreases, setDebtIncreases] = useState<DebtIncrease[]>([]);
  const [rateChanges, setRateChanges] = useState<RateChange[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const advancedCount = rateChanges.length + payouts.length + debtIncreases.length;

  const req = useMemo(() => ({
    regionCode: "GLB",
    input: {
      principal, startDate, endDate, initialRatePercent: initialRate,
      rateChanges, payouts, debtIncreases,
      payoutAppliesToInterestFirst: true,
    },
  }), [principal, startDate, endDate, initialRate, rateChanges, payouts, debtIncreases]);
  const { data: backendData, error: backendError } = useBackendCalculation<{ totalInterest: number; totalDebtAndInterest: number; totalDays: number; rows: LoanInterestRow[] }>("loan-interest", req);
  const result = backendData?.result ?? { totalInterest: 0, totalDebtAndInterest: 0, totalDays: 0, rows: [] as LoanInterestRow[] };
  /* Legacy: const result = useMemo(() => calcLoanInterest(input), [...]); */

  // Build chart data from period rows
  const chartData = useMemo(() => {
    const periods = result.rows.filter(isPeriodRow);
    return periods.map((r) => ({
      label: r.dateTo.slice(0, 7),
      interest: r.cumulativeInterest,
      principal: r.principal,
    }));
  }, [result]);

  const overpaymentPct = principal > 0 ? (result.totalInterest / principal) * 100 : 0;

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Проценты по займу (ст. 809 ГК)</h1>
      <p className="text-muted-foreground mt-1">Расчёт процентов по договору займа: смена ставки, досрочные выплаты, увеличение долга</p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="loan-interest" categoryName="Финансы" categoryPath="/categories/finance" title={title}>
      <div className="space-y-6">
        {backendError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {backendError}
          </div>
        )}
        {/* Input panel — full width */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Параметры займа</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Principal */}
              <div className="space-y-1.5">
                <Label>Сумма займа (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(principal)}
                  onChange={(e) => setPrincipal(Math.max(0, parseNumberInput(e.target.value)))} />
                <div className="flex flex-wrap gap-1.5">
                  {PRINCIPAL_PRESETS.map((p) => (
                    <button key={p} onClick={() => setPrincipal(p)}
                      className={cn("text-xs px-2 py-0.5 rounded-full border transition-colors",
                        principal === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary")}>
                      {new Intl.NumberFormat("ru-RU").format(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-1.5">
                <Label>Ставка (% годовых)</Label>
                <Input type="number" step={0.1} min={0} value={initialRate}
                  onChange={(e) => setInitialRate(Math.max(0, Number(e.target.value) || 0))} />
                <div className="flex flex-wrap gap-1.5">
                  {RATE_PRESETS.map((r) => (
                    <button key={r} onClick={() => setInitialRate(r)}
                      className={cn("text-xs px-2 py-0.5 rounded-full border transition-colors",
                        initialRate === r
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary")}>
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Start date */}
              <div className="space-y-1.5">
                <Label>Дата выдачи</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              {/* End date */}
              <div className="space-y-1.5">
                <Label>Дата возврата</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional params — full width, stacked */}
        <div className="flex flex-col gap-4">

              {/* Rate changes */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Изменение ставки</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                      onClick={() => setRateChanges([...rateChanges, { date: endDate, ratePercent: initialRate }])}>
                      <Plus className="h-3 w-3" /> Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {rateChanges.length === 0 && (
                    <p className="text-xs text-muted-foreground">Изменений не добавлено</p>
                  )}
                  {rateChanges.map((rc, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-muted-foreground">Дата</Label>
                        <Input type="date" value={rc.date} className="h-8 text-sm"
                          onChange={(e) => { const arr = [...rateChanges]; arr[i] = { ...arr[i], date: e.target.value }; setRateChanges(arr); }} />
                      </div>
                      <div className="space-y-1 w-24 shrink-0">
                        <Label className="text-xs text-muted-foreground">Ставка, %</Label>
                        <Input type="number" step={0.1} min={0} value={rc.ratePercent} className="h-8 text-sm"
                          onChange={(e) => { const arr = [...rateChanges]; arr[i] = { ...arr[i], ratePercent: Number(e.target.value) || 0 }; setRateChanges(arr); }} />
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setRateChanges(rateChanges.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Partial payouts */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Частичные выплаты</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                      onClick={() => setPayouts([...payouts, { date: new Date().toISOString().slice(0, 10), amount: 0 }])}>
                      <Plus className="h-3 w-3" /> Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {payouts.length === 0 && (
                    <p className="text-xs text-muted-foreground">Выплат не добавлено</p>
                  )}
                  {payouts.map((p, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <div className="space-y-1 w-36 shrink-0">
                        <Label className="text-xs text-muted-foreground">Дата</Label>
                        <Input type="date" value={p.date} className="h-8 text-sm"
                          onChange={(e) => { const arr = [...payouts]; arr[i] = { ...arr[i], date: e.target.value }; setPayouts(arr); }} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-muted-foreground">Сумма, ₽</Label>
                        <Input type="text" inputMode="numeric" value={formatNumberInput(p.amount)} className="h-8 text-sm tabular-nums"
                          onChange={(e) => { const arr = [...payouts]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setPayouts(arr); }} />
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setPayouts(payouts.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Debt increases */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Увеличение долга</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                      onClick={() => setDebtIncreases([...debtIncreases, { date: new Date().toISOString().slice(0, 10), amount: 0 }])}>
                      <Plus className="h-3 w-3" /> Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {debtIncreases.length === 0 && (
                    <p className="text-xs text-muted-foreground">Увеличений не добавлено</p>
                  )}
                  {debtIncreases.map((d, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <div className="space-y-1 w-36 shrink-0">
                        <Label className="text-xs text-muted-foreground">Дата</Label>
                        <Input type="date" value={d.date} className="h-8 text-sm"
                          onChange={(e) => { const arr = [...debtIncreases]; arr[i] = { ...arr[i], date: e.target.value }; setDebtIncreases(arr); }} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-muted-foreground">Сумма, ₽</Label>
                        <Input type="text" inputMode="numeric" value={formatNumberInput(d.amount)} className="h-8 text-sm tabular-nums"
                          onChange={(e) => { const arr = [...debtIncreases]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setDebtIncreases(arr); }} />
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setDebtIncreases(debtIncreases.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

        </div>

        {/* Results — full width */}
        <div className="space-y-5">
            {/* Hero */}
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">Итого процентов за {result.totalDays} дн.</span>
              </div>
              <p className="text-4xl font-bold text-destructive tracking-tight">{fmt(result.totalInterest)} ₽</p>
              <p className="text-sm text-muted-foreground mt-1">
                Итого к возврату: <span className="font-semibold text-foreground">{fmt(result.totalDebtAndInterest)} ₽</span>
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-primary/10"><Banknote className="h-4 w-4 text-primary" /></div>
                </div>
                <p className="text-xs text-muted-foreground">Сумма займа</p>
                <p className="text-base font-bold mt-0.5">{fmt(principal)} ₽</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-destructive/10"><Percent className="h-4 w-4 text-destructive" /></div>
                </div>
                <p className="text-xs text-muted-foreground">Начислено %</p>
                <p className="text-base font-bold mt-0.5 text-destructive">{fmt(result.totalInterest)} ₽</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-muted"><CalendarDays className="h-4 w-4 text-muted-foreground" /></div>
                </div>
                <p className="text-xs text-muted-foreground">Дней</p>
                <p className="text-base font-bold mt-0.5">{result.totalDays}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-muted"><TrendingUp className="h-4 w-4 text-muted-foreground" /></div>
                </div>
                <p className="text-xs text-muted-foreground">Переплата</p>
                <p className="text-base font-bold mt-0.5">{overpaymentPct.toFixed(2)}%</p>
              </Card>
            </div>

            {/* Chart */}
            {chartData.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Накопленные проценты</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`${fmt(v)} ₽`, "Накопленные %"]}
                      />
                      <Area type="monotone" dataKey="interest" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#interestGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Breakdown table */}
            {result.rows.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <CardTitle className="text-sm">Расчёт по периодам</CardTitle>
                    <span className="text-muted-foreground">
                      {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                </CardHeader>
                {showBreakdown && (
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Период</th>
                            <th className="text-right py-2 pr-3 font-medium text-muted-foreground">Долг</th>
                            <th className="text-right py-2 pr-3 font-medium text-muted-foreground">Дней</th>
                            <th className="text-right py-2 pr-3 font-medium text-muted-foreground">Ставка</th>
                            <th className="text-right py-2 font-medium text-muted-foreground">Проценты</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows
                            .filter(isPeriodRow)
                            .map((r, i) => (
                              <tr key={i} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                                  {r.dateFrom} – {r.dateTo}
                                </td>
                                <td className="py-2 pr-3 text-right font-mono">{fmt(r.principal)} ₽</td>
                                <td className="py-2 pr-3 text-right">{r.days}</td>
                                <td className="py-2 pr-3 text-right">{r.ratePercent}%</td>
                                <td className="py-2 text-right font-medium text-destructive">{fmt(r.periodInterest)} ₽</td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border font-medium">
                            <td className="py-2 pr-3 text-sm" colSpan={4}>Итого</td>
                            <td className="py-2 text-right text-sm text-destructive">{fmt(result.totalInterest)} ₽</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Legal note */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">О расчёте</CardTitle></CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
                <p><strong>Ст. 809 ГК РФ:</strong> проценты начисляются со дня, следующего за днём выдачи займа, по дату возврата включительно.</p>
                <p className="font-mono bg-muted/50 rounded px-2 py-1">P = S × D / 365 × R%</p>
                <p>S — остаток долга, D — количество дней периода, R — ставка (% годовых).</p>
              </CardContent>
            </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
