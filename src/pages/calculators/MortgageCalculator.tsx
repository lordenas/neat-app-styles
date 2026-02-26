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

  const result = useMemo(() => calculateMortgage(propertyPrice, downPayment, annualRate, termYears), [propertyPrice, downPayment, annualRate, termYears]);
  const schedule = useMemo(() => {
    if (result.principal <= 0) return null;
    return buildRefinancingSchedule(result.principal, annualRate, result.termMonths, "year");
  }, [result.principal, annualRate, result.termMonths]);

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
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Основной долг</span>
                      <span className="font-medium">{fmtShort(result.principal)} ₽ ({100 - overpayPercent}%)</span>
                    </div>
                    <Progress value={100 - overpayPercent} className="h-2" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Переплата (проценты)</span>
                      <span className="font-medium text-destructive">{fmtShort(result.totalInterest)} ₽ ({overpayPercent}%)</span>
                    </div>
                    <Progress value={overpayPercent} className="h-2 [&>div]:bg-destructive" />
                  </div>
                  <div className="pt-2 border-t border-border text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ставка</span>
                      <span className="font-medium">{annualRate}% годовых</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Срок</span>
                      <span className="font-medium">{termYears} лет ({result.termMonths} мес.)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Взнос</span>
                      <span className="font-medium">{downPercent}% ({fmtShort(downPayment)} ₽)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule table */}
            {schedule && schedule.rows.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t("calculator.paymentBreakdown")}</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-3 font-medium text-muted-foreground">{t("calculator.table.year")}</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">{t("calculator.table.payment")}</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">{t("calculator.charts.labels.principal")}</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">{t("calculator.table.interest")}</th>
                          <th className="text-right py-2 pl-3 font-medium text-muted-foreground">{t("calculator.table.balance")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.rows.map((r, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-1.5 pr-3 font-medium">{r.year}</td>
                            <td className="py-1.5 px-3 text-right">{fmt(r.payment)}</td>
                            <td className="py-1.5 px-3 text-right text-primary">{fmt(r.principal)}</td>
                            <td className="py-1.5 px-3 text-right text-destructive">{fmt(r.interest)}</td>
                            <td className="py-1.5 pl-3 text-right">{fmt(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
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
