import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

const MIN_YEAR = 2000;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

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

  const result = useMemo(() => {
    return computeInflation({
      startMonth, startYear, endMonth, endYear,
      inflationData: RUSSIA_INFLATION_DATA,
    });
  }, [startMonth, startYear, endMonth, endYear]);

  const priceNow = result ? priceChange(amount, result.totalFactor) : amount;
  const realValue = result ? savingsDepreciation(amount, result.totalFactor) : amount;

  return (
    <CalculatorLayout calculatorId="inflation" categoryName="Финансы" categoryPath="/categories/finance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.inflation")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.inflation")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.inputTitle")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("calculator.inflation.amount")}</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(amount)}
                  onChange={(e) => setAmount(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

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

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.results")}</CardTitle></CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t("calculator.inflation.inflationForPeriod")}</p>
                        <p className="text-xl font-bold text-destructive">{fmt(result.inflationPercent)}%</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t("calculator.inflation.priceChangeResult")}</p>
                        <p className="text-xl font-bold">{fmt(priceNow)} ₽</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t("calculator.inflation.savingsDepreciationResult")}</p>
                        <p className="text-xl font-bold text-primary">{fmt(realValue)} ₽</p>
                      </div>
                    </div>

                    {Object.keys(result.annualRates).length > 1 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">{t("calculator.inflation.annualRatesTable")}:</p>
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
                  <p className="text-sm text-muted-foreground">{t("calculator.inflation.noData")}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.about.title")}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>{t("calculator.about.description")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
