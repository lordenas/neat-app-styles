import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { calculateMortgage, buildRefinancingSchedule } from "@/lib/calculators/refinancing";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Home, TrendingUp, Calendar, Banknote } from "lucide-react";

export default function MortgageCalculatorPage() {
  const { t } = useTranslation();
  const [propertyPrice, setPropertyPrice] = useState(10_000_000);
  const [downPayment, setDownPayment] = useState(2_000_000);
  const [annualRate, setAnnualRate] = useState(18);
  const [termYears, setTermYears] = useState(20);

  const fmt = (v: number) =>
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const fmtShort = (v: number) =>
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(v);

  const [schedulePeriod, setSchedulePeriod] = useState<"year" | "month">("year");

  const result = useMemo(() => calculateMortgage(propertyPrice, downPayment, annualRate, termYears), [propertyPrice, downPayment, annualRate, termYears]);
  const schedule = useMemo(() => {
    if (result.principal <= 0) return null;
    return buildRefinancingSchedule(result.principal, annualRate, result.termMonths, schedulePeriod);
  }, [result.principal, annualRate, result.termMonths, schedulePeriod]);

  const downPercent = propertyPrice > 0 ? Math.round((downPayment / propertyPrice) * 100) : 0;
  const overpayPercent = result.totalPayment > 0
    ? Math.round((result.totalInterest / result.totalPayment) * 100)
    : 0;

  const chartData = result.principal > 0 ? [
    { name: "Основной долг", value: result.principal },
    { name: "Переплата", value: result.totalInterest },
  ] : [];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))"];

  return (
    <CalculatorLayout calculatorId="mortgage" categoryName="Финансы" categoryPath="/categories/finance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.mortgage")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.mortgage")}</p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.inputTitle")}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Property price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("calculator.fields.propertyPrice")}</Label>
                <span className="text-sm font-semibold">{fmtShort(propertyPrice)} ₽</span>
              </div>
              <Input
                type="text" inputMode="numeric"
                value={formatNumberInput(propertyPrice)}
                onChange={(e) => setPropertyPrice(Math.max(0, parseNumberInput(e.target.value)))}
              />
              <Slider
                min={500_000} max={50_000_000} step={100_000}
                value={[propertyPrice]}
                onValueChange={([v]) => setPropertyPrice(v)}
                className="mt-1"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>500 тыс.</span><span>50 млн.</span>
              </div>
            </div>

            {/* Down payment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("calculator.fields.downPayment")}</Label>
                <span className="text-sm font-semibold">{fmtShort(downPayment)} ₽ <span className="text-muted-foreground font-normal text-xs">({downPercent}%)</span></span>
              </div>
              <Input
                type="text" inputMode="numeric"
                value={formatNumberInput(downPayment)}
                onChange={(e) => setDownPayment(Math.max(0, parseNumberInput(e.target.value)))}
              />
              <Slider
                min={0} max={propertyPrice} step={100_000}
                value={[downPayment]}
                onValueChange={([v]) => setDownPayment(v)}
                className="mt-1"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0% (без взноса)</span><span>100%</span>
              </div>
            </div>

            {/* Rate + Term in 2 cols */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("calculator.fields.interestRate")}</Label>
                  <span className="text-sm font-semibold">{annualRate}%</span>
                </div>
                <Input
                  type="number" step={0.1} min={0.1} max={100}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0.1, Number(e.target.value) || 0.1))}
                />
                <Slider
                  min={1} max={30} step={0.1}
                  value={[annualRate]}
                  onValueChange={([v]) => setAnnualRate(Math.round(v * 10) / 10)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1%</span><span>30%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("calculator.fields.loanTerm")}</Label>
                  <span className="text-sm font-semibold">{termYears} лет</span>
                </div>
                <Input
                  type="number" min={1} max={30}
                  value={termYears}
                  onChange={(e) => setTermYears(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                />
                <Slider
                  min={1} max={30} step={1}
                  value={[termYears]}
                  onValueChange={([v]) => setTermYears(v)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 год</span><span>30 лет</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {result.principal > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground leading-tight">{t("calculator.fields.principalAmount")}</p>
                  <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <p className="text-lg font-bold">{fmtShort(result.principal)} ₽</p>
              </Card>
              <Card className="p-4 border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground leading-tight">{t("calculator.monthlyPayment")}</p>
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                </div>
                <p className="text-lg font-bold text-primary">{fmtShort(result.monthlyPayment)} ₽</p>
              </Card>
              <Card className="p-4 border-destructive/30 bg-destructive/5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground leading-tight">{t("calculator.stats.overpayment")}</p>
                  <TrendingUp className="h-4 w-4 text-destructive shrink-0" />
                </div>
                <p className="text-lg font-bold text-destructive">{fmtShort(result.totalInterest)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{overpayPercent}% от выплат</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-muted-foreground leading-tight">{t("calculator.totalAmount")}</p>
                  <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <p className="text-lg font-bold">{fmtShort(result.totalPayment)} ₽</p>
              </Card>
            </div>

            {/* Chart + breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Структура платежа</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${fmtShort(v)} ₽`} />
                      <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Соотношение долг / переплата</CardTitle></CardHeader>
                <CardContent className="space-y-5 pt-1">
                  {/* Stacked bar */}
                  <div className="space-y-1.5">
                    <div className="flex h-5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary transition-all duration-300 flex items-center justify-center"
                        style={{ width: `${100 - overpayPercent}%` }}
                      />
                      <div
                        className="bg-destructive/80 transition-all duration-300"
                        style={{ width: `${overpayPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-primary" />Долг {100 - overpayPercent}%</span>
                      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-destructive/80" />Переплата {overpayPercent}%</span>
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-2.5">
                    {[
                      { label: "Основной долг", value: `${fmtShort(result.principal)} ₽`, color: "text-primary", pct: 100 - overpayPercent },
                      { label: "Переплата", value: `${fmtShort(result.totalInterest)} ₽`, color: "text-destructive", pct: overpayPercent },
                      { label: "Итого выплат", value: `${fmtShort(result.totalPayment)} ₽`, color: "", pct: null },
                    ].map(({ label, value, color, pct }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-semibold tabular-nums ${color}`}>
                          {value}{pct !== null ? <span className="text-xs font-normal text-muted-foreground ml-1">({pct}%)</span> : null}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Ставка</p>
                      <p className="text-sm font-bold">{annualRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Срок</p>
                      <p className="text-sm font-bold">{termYears} лет</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Взнос</p>
                      <p className="text-sm font-bold">{downPercent}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule table */}
            {schedule && schedule.rows.length > 0 && (() => {
              const totalPaid = schedule.rows.reduce((s, r) => s + r.payment, 0);
              const totalPrincipal = schedule.rows.reduce((s, r) => s + r.principal, 0);
              const totalInterest = schedule.rows.reduce((s, r) => s + r.interest, 0);
              return (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{t("calculator.paymentBreakdown")}</CardTitle>
                      <div className="flex rounded-md border border-border overflow-hidden text-xs">
                        <button
                          onClick={() => setSchedulePeriod("year")}
                          className={`px-3 py-1.5 transition-colors ${schedulePeriod === "year" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}
                        >
                          По годам
                        </button>
                        <button
                          onClick={() => setSchedulePeriod("month")}
                          className={`px-3 py-1.5 border-l border-border transition-colors ${schedulePeriod === "month" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}
                        >
                          По месяцам
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-y border-border">
                            <th className="text-left py-2.5 px-4 font-medium text-muted-foreground w-16">{schedulePeriod === "year" ? "Год" : "Год / Мес."}</th>
                            <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Платёж</th>
                            <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Осн. долг</th>
                            <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Проценты</th>
                            <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Остаток</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedule.rows.map((r, i) => {
                            const principalShare = r.payment > 0 ? (r.principal / r.payment) * 100 : 0;
                            return (
                              <tr key={i} className={`border-b border-border/40 hover:bg-muted/40 transition-colors ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                                <td className="py-2 px-4">
                                  {schedulePeriod === "year" ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[10px] font-semibold">{r.year}</span>
                                  ) : (
                                    <span className="tabular-nums text-[10px]">{r.year}/{String(r.month).padStart(2, "0")}</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right tabular-nums">{fmt(r.payment)}</td>
                                <td className="py-2 px-3 text-right">
                                  <div className="flex flex-col items-end gap-0.5">
                                    <span className="tabular-nums text-primary font-medium">{fmt(r.principal)}</span>
                                    <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${principalShare}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right tabular-nums text-destructive">{fmt(r.interest)}</td>
                                <td className="py-2 px-4 text-right tabular-nums text-muted-foreground">{fmt(r.balance)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted/50 border-t-2 border-border font-semibold">
                            <td className="py-2.5 px-4 text-xs">Итого</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-xs">{fmt(totalPaid)}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-xs text-primary">{fmt(totalPrincipal)}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-xs text-destructive">{fmt(totalInterest)}</td>
                            <td className="py-2.5 px-4 text-right tabular-nums text-xs">—</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </>
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground text-center">{t("calculator.mortgage.downPaymentExceeds", "Первоначальный взнос превышает стоимость")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </CalculatorLayout>
  );
}
