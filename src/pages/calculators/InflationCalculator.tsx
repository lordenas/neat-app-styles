import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeInflation,
  priceChange,
  savingsDepreciation,
  RUSSIA_INFLATION_DATA,
} from "@/lib/calculators/inflation";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const MONTHS_RU = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

export default function InflationCalculatorPage() {
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(2020);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(MAX_YEAR);
  const [amount, setAmount] = useState(100_000);

  const result = useMemo(() => {
    return computeInflation({
      startMonth, startYear, endMonth, endYear,
      inflationData: RUSSIA_INFLATION_DATA,
    });
  }, [startMonth, startYear, endMonth, endYear]);

  const priceNow = result ? priceChange(amount, result.totalFactor) : amount;
  const realValue = result ? savingsDepreciation(amount, result.totalFactor) : amount;

  return (
    <CalculatorLayout calculatorId="inflation" categoryName="Финансы" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор инфляции</h1>
          <p className="text-muted-foreground mt-1">Расчёт обесценения денег и изменения покупательной способности</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">Параметры</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма (₽)</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(amount)}
                  onChange={(e) => setAmount(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

              <div className="space-y-1.5">
                <Label>Начало периода</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={String(startMonth)} onValueChange={(v) => setStartMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS_RU.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
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

              <div className="space-y-1.5">
                <Label>Конец периода</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={String(endMonth)} onValueChange={(v) => setEndMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS_RU.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
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

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Результат</CardTitle></CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Инфляция за период</p>
                        <p className="text-xl font-bold text-destructive">{fmt(result.inflationPercent)}%</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Было бы нужно сейчас</p>
                        <p className="text-xl font-bold">{fmt(priceNow)} ₽</p>
                        <p className="text-xs text-muted-foreground">чтобы купить то же</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Реальная стоимость</p>
                        <p className="text-xl font-bold text-primary">{fmt(realValue)} ₽</p>
                        <p className="text-xs text-muted-foreground">покупательная способность</p>
                      </div>
                    </div>

                    {Object.keys(result.annualRates).length > 1 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">Инфляция по годам:</p>
                        {Object.entries(result.annualRates)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([year, rate]) => (
                            <div key={year} className="flex justify-between py-0.5 border-b border-border/50">
                              <span className="text-muted-foreground">{year}</span>
                              <span className="font-medium">{rate}%</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Выберите корректный период</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">О расчёте</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>Расчёт инфляции по данным Росстата. За неполные годы применяется пропорциональное начисление по формуле сложных процентов.</p>
                <p>«Было бы нужно сейчас» — сколько денег нужно сегодня, чтобы купить то, что раньше стоило указанную сумму. «Реальная стоимость» — сколько в нынешних ценах стоят деньги из прошлого.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
