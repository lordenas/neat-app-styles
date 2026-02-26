import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Car, TrendingUp, Banknote, Calendar } from "lucide-react";
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("calculatorNames.auto-loan")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("calculatorDescriptions.auto-loan")}
          </p>
        </div>

        {/* Hero result */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-foreground/15 p-3">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Ежемесячный платёж</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {fmt(result.monthlyPayment)} ₽
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 sm:text-right">
                <div>
                  <p className="text-xs opacity-70">Сумма кредита</p>
                  <p className="text-lg font-semibold">{fmt(result.loanAmount)} ₽</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Всего выплат</p>
                  <p className="text-lg font-semibold">{fmt(result.totalPayment)} ₽</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Переплата</p>
                  <p className="text-lg font-semibold">{fmt(result.totalInterest)} ₽</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parameters — full width */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Параметры кредита</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {/* Car price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price">Стоимость автомобиля</Label>
                  <div className="flex items-center">
                    <Input
                      id="price"
                      type="number"
                      value={carPrice}
                      onChange={(e) => setCarPrice(Math.max(0, +e.target.value))}
                      className="w-36 text-right h-8 text-sm"
                      min={0}
                    />
                    <span className="ml-1.5 text-sm text-muted-foreground">₽</span>
                  </div>
                </div>
                <Slider
                  value={[carPrice]}
                  onValueChange={([v]) => setCarPrice(v)}
                  min={200_000}
                  max={10_000_000}
                  step={50_000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>200 000 ₽</span>
                  <span>10 000 000 ₽</span>
                </div>
              </div>

              {/* Down payment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dp">
                    Первоначальный взнос
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{downPct}%</span>
                  </Label>
                  <div className="flex items-center">
                    <Input
                      id="dp"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Math.max(0, +e.target.value))}
                      className="w-36 text-right h-8 text-sm"
                      min={0}
                    />
                    <span className="ml-1.5 text-sm text-muted-foreground">₽</span>
                  </div>
                </div>
                <Slider
                  value={[downPayment]}
                  onValueChange={([v]) => setDownPayment(v)}
                  min={0}
                  max={carPrice}
                  step={50_000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 ₽</span>
                  <span>{fmt(carPrice)} ₽</span>
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rate">Процентная ставка</Label>
                  <div className="flex items-center">
                    <Input
                      id="rate"
                      type="number"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(Math.max(0, +e.target.value))}
                      className="w-24 text-right h-8 text-sm"
                      min={0}
                      step={0.1}
                    />
                    <span className="ml-1.5 text-sm text-muted-foreground">% год.</span>
                  </div>
                </div>
                <Slider
                  value={[annualRate]}
                  onValueChange={([v]) => setAnnualRate(v)}
                  min={1}
                  max={40}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>40%</span>
                </div>
              </div>

              {/* Term */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Срок кредита</Label>
                  <span className="text-sm font-medium">{termMonths} мес.</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {TERM_PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setTermMonths(m)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
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
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 мес.</span>
                  <span>120 мес.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results row — stats + pie */}
        {result.loanAmount > 0 && (
          <div className="grid sm:grid-cols-[1fr_280px] gap-5">
            {/* Stats + ratio bar */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Сумма кредита</span>
                    </div>
                    <p className="text-xl font-bold">{fmt(result.loanAmount)} ₽</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Всего выплат</span>
                    </div>
                    <p className="text-xl font-bold">{fmt(result.totalPayment)} ₽</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-muted-foreground">Переплата</span>
                    </div>
                    <p className="text-xl font-bold text-destructive">{fmt(result.totalInterest)} ₽</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Взнос</span>
                    </div>
                    <p className="text-xl font-bold">{downPct}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Ratio bar */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <p className="text-sm font-medium">Структура выплат</p>
                  <div className="flex rounded-full overflow-hidden h-4">
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
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                      Тело долга — {fmt(result.loanAmount)} ₽ ({100 - overpayPct}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                      Переплата — {fmt(result.totalInterest)} ₽ ({overpayPct}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pie chart */}
            {pieData.length > 0 && (
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Структура долга</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
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
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          color: "hsl(var(--foreground))",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                          {d.name}
                        </span>
                        <span className="font-medium">{fmt(d.value)} ₽</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Schedule — full width */}
        {result.schedule.length > 0 && (
          <Collapsible open={showSchedule} onOpenChange={setShowSchedule}>
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">График платежей</CardTitle>
                  <span className="flex items-center gap-1 text-sm text-primary font-normal">
                    {showSchedule ? "Скрыть" : "Показать"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSchedule ? "rotate-180" : ""}`} />
                  </span>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0 max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead className="text-right">Платёж</TableHead>
                        <TableHead className="text-right">Основной долг</TableHead>
                        <TableHead className="text-right">Проценты</TableHead>
                        <TableHead className="text-right">Остаток</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.schedule.map((r) => (
                        <TableRow key={r.month}>
                          <TableCell className="text-muted-foreground text-xs">{r.month}</TableCell>
                          <TableCell className="text-right font-medium">{fmt(r.payment)} ₽</TableCell>
                          <TableCell className="text-right text-[hsl(var(--primary))]">{fmt(r.principal)} ₽</TableCell>
                          <TableCell className="text-right text-destructive">{fmt(r.interest)} ₽</TableCell>
                          <TableCell className="text-right text-muted-foreground">{fmt(r.balance)} ₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="font-semibold">
                        <TableCell colSpan={2} className="text-right">Итого</TableCell>
                        <TableCell className="text-right text-[hsl(var(--primary))]">{fmt(result.loanAmount)} ₽</TableCell>
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
