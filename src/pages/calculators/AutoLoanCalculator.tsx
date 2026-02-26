import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Car, TrendingUp, Banknote, Calendar, Percent } from "lucide-react";
import { calcAutoLoan, type AutoLoanInput } from "@/lib/calculators/auto-loan";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const TERM_PRESETS = [12, 24, 36, 48, 60, 84];

export default function AutoLoanCalculator() {
  const { t } = useTranslation();
  const [carPrice, setCarPrice] = useState(2_000_000);
  const [downPayment, setDownPayment] = useState(400_000);
  const [annualRate, setAnnualRate] = useState(12);
  const [termMonths, setTermMonths] = useState(60);
  const [showSchedule, setShowSchedule] = useState(false);

  const input: AutoLoanInput = { carPrice, downPayment, annualRate, termMonths };
  const result = useMemo(() => calcAutoLoan(input), [carPrice, downPayment, annualRate, termMonths]);

  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

  const downPct = carPrice > 0 ? Math.round((downPayment / carPrice) * 100) : 0;

  const pieData = result.loanAmount > 0
    ? [
        { name: "Тело долга", value: result.loanAmount, color: "hsl(var(--primary))" },
        { name: "Переплата", value: result.totalInterest, color: "hsl(var(--destructive))" },
      ]
    : [];

  const overpayPct = result.totalPayment > 0
    ? Math.round((result.totalInterest / result.totalPayment) * 100)
    : 0;

  return (
    <CalculatorLayout calculatorId="auto-loan" categoryName="Automotive" categoryPath="/categories/automotive">
      <div className="space-y-8">
        {/* Parameters */}
        <Card>
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-lg">Параметры кредита</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-8 space-y-10">
            {/* Car price */}
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <Label htmlFor="price" className="text-base font-medium">Стоимость автомобиля</Label>
                <Input
                  id="price"
                  formatNumber
                  inputMode="numeric"
                  inputEnd={<span className="text-sm font-medium text-muted-foreground">₽</span>}
                  value={carPrice}
                  onChange={(e) => setCarPrice(Math.max(0, Number(e.target.value.replace(/\s/g, ""))))}
                  className="w-52 text-right text-base font-semibold tabular-nums h-11"
                />
              </div>
              <Slider
                value={[carPrice]}
                onValueChange={([v]) => setCarPrice(v)}
                min={200_000}
                max={10_000_000}
                step={50_000}
                className="py-1"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>200 000 ₽</span>
                <span>10 000 000 ₽</span>
              </div>
            </div>

            {/* Down payment */}
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Label htmlFor="dp" className="text-base font-medium">Первоначальный взнос</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">{downPct}% от стоимости</p>
                </div>
                <Input
                  id="dp"
                  formatNumber
                  inputMode="numeric"
                  inputEnd={<span className="text-sm font-medium text-muted-foreground">₽</span>}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value.replace(/\s/g, ""))))}
                  className="w-52 text-right text-base font-semibold tabular-nums h-11"
                />
              </div>
              <Slider
                value={[downPayment]}
                onValueChange={([v]) => setDownPayment(v)}
                min={0}
                max={carPrice}
                step={50_000}
                className="py-1"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 ₽</span>
                <span>{fmt(carPrice)} ₽</span>
              </div>
            </div>

            {/* Rate */}
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <Label htmlFor="rate" className="text-base font-medium">Процентная ставка</Label>
                <Input
                  id="rate"
                  inputMode="decimal"
                  inputEnd={<span className="text-sm font-medium text-muted-foreground">% год.</span>}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-44 text-right text-base font-semibold tabular-nums h-11"
                />
              </div>
              <Slider
                value={[annualRate]}
                onValueChange={([v]) => setAnnualRate(v)}
                min={1}
                max={40}
                step={0.5}
                className="py-1"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1%</span>
                <span>40%</span>
              </div>
            </div>

            {/* Term */}
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <Label className="text-base font-medium">Срок кредита</Label>
                <span className="text-base font-semibold">{termMonths} мес.</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TERM_PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setTermMonths(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      termMonths === m
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {m < 12 ? `${m} мес.` : `${m / 12} ${m === 12 ? "год" : m <= 48 ? "года" : "лет"}`}
                  </button>
                ))}
              </div>
              <Slider
                value={[termMonths]}
                onValueChange={([v]) => setTermMonths(v)}
                min={6}
                max={120}
                step={1}
                className="py-1"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>6 мес.</span>
                <span>120 мес.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero result */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-primary-foreground/15 p-4">
                  <Car className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-75 mb-1">Ежемесячный платёж</p>
                  <p className="text-5xl font-bold tracking-tight">
                    {fmt(result.monthlyPayment)} ₽
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 sm:text-right">
                <div>
                  <p className="text-xs opacity-60 mb-1">Сумма кредита</p>
                  <p className="text-xl font-semibold">{fmt(result.loanAmount)} ₽</p>
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">Всего выплат</p>
                  <p className="text-xl font-semibold">{fmt(result.totalPayment)} ₽</p>
                </div>
                <div>
                  <p className="text-xs opacity-60 mb-1">Переплата</p>
                  <p className="text-xl font-semibold">{fmt(result.totalInterest)} ₽</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result.loanAmount > 0 && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Banknote className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Сумма кредита</span>
                  </div>
                  <p className="text-2xl font-bold">{fmt(result.loanAmount)} ₽</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Всего выплат</span>
                  </div>
                  <p className="text-2xl font-bold">{fmt(result.totalPayment)} ₽</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    </div>
                    <span className="text-sm text-muted-foreground">Переплата</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{fmt(result.totalInterest)} ₽</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Percent className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Взнос</span>
                  </div>
                  <p className="text-2xl font-bold">{downPct}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Ratio + Pie */}
            <div className="grid sm:grid-cols-[1fr_300px] gap-6">
              {/* Ratio bar */}
              <Card>
                <CardContent className="px-6 py-6 space-y-5">
                  <p className="text-base font-semibold">Структура выплат</p>
                  <div className="flex rounded-full overflow-hidden h-5">
                    <div
                      className="bg-primary transition-all"
                      style={{ width: `${100 - overpayPct}%` }}
                      title="Тело долга"
                    />
                    <div
                      className="bg-destructive transition-all"
                      style={{ width: `${overpayPct}%` }}
                      title="Переплата"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-primary shrink-0" />
                      <span>Тело долга — <span className="font-semibold text-foreground">{fmt(result.loanAmount)} ₽</span> ({100 - overpayPct}%)</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-destructive shrink-0" />
                      <span>Переплата — <span className="font-semibold text-foreground">{fmt(result.totalInterest)} ₽</span> ({overpayPct}%)</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Pie chart */}
              {pieData.length > 0 && (
                <Card>
                  <CardHeader className="px-6 pt-6 pb-0">
                    <CardTitle className="text-base font-semibold">Структура долга</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${fmt(value)} ₽`, ""]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                            color: "hsl(var(--foreground))",
                            fontSize: "13px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2.5 mt-2">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2.5">
                            <span className="inline-block h-3 w-3 rounded-full shrink-0" style={{ background: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </span>
                          <span className="font-semibold">{fmt(d.value)} ₽</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Schedule — full width */}
        {result.schedule.length > 0 && (
          <Collapsible open={showSchedule} onOpenChange={setShowSchedule}>
            <Card>
              <CardHeader className="px-6 py-5">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base font-semibold">График платежей</CardTitle>
                  <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
                    {showSchedule ? "Скрыть" : "Показать"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSchedule ? "rotate-180" : ""}`} />
                  </span>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="px-6 pt-0 pb-6 max-h-[520px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-sm">№</TableHead>
                        <TableHead className="text-right text-sm">Платёж</TableHead>
                        <TableHead className="text-right text-sm">Основной долг</TableHead>
                        <TableHead className="text-right text-sm">Проценты</TableHead>
                        <TableHead className="text-right text-sm">Остаток</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.schedule.map((r) => (
                        <TableRow key={r.month}>
                          <TableCell className="text-muted-foreground">{r.month}</TableCell>
                          <TableCell className="text-right font-medium">{fmt(r.payment)} ₽</TableCell>
                          <TableCell className="text-right text-primary">{fmt(r.principal)} ₽</TableCell>
                          <TableCell className="text-right text-destructive">{fmt(r.interest)} ₽</TableCell>
                          <TableCell className="text-right text-muted-foreground">{fmt(r.balance)} ₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="font-semibold">
                        <TableCell colSpan={2} className="text-right">Итого</TableCell>
                        <TableCell className="text-right text-primary">{fmt(result.loanAmount)} ₽</TableCell>
                        <TableCell className="text-right text-destructive">{fmt(result.totalInterest)} ₽</TableCell>
                        <TableCell className="text-right">—</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </div>
    </CalculatorLayout>
  );
}
