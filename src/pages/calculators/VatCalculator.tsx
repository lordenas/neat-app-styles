import { useCallback, useMemo, useState } from "react";
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
  VAT_COUNTRIES,
  getVatCountryCodes,
  getEffectiveStandardRate,
  getVatCountry,
  addVat,
  excludeVat,
} from "@/lib/calculators/vat";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { ArrowDown, ArrowUp, Percent, Receipt, Package } from "lucide-react";

/** legacy-local-calc: no backend endpoint yet (migration gap). See apps/numlix-main/docs/MIGRATION_CALC_STATUS.md */

export default function VatCalculatorPage() {
  const { t } = useTranslation();

  const vatCountryCodes = getVatCountryCodes();
  const [amount, setAmount] = useState(1000);
  const [mode, setMode] = useState<"add" | "exclude">("add");
  const [vatCountry, setVatCountry] = useState("ru");
  const [manualRate, setManualRate] = useState<number | null>(null);

  const effectiveRate = manualRate !== null ? manualRate : getEffectiveStandardRate(vatCountry);

  const result = useMemo(() => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num < 0) return null;
    return mode === "add" ? addVat(num, effectiveRate) : excludeVat(num, effectiveRate);
  }, [amount, mode, effectiveRate]);

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat("ru-RU", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value),
    [],
  );

  const countryInfo = getVatCountry(vatCountry);

  return (
    <CalculatorLayout calculatorId="vat" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("calculatorNames.vat", { defaultValue: "Калькулятор НДС" })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("calculatorDescriptions.vat", { defaultValue: "Начислить или выделить НДС по ставке любой страны" })}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("add")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              mode === "add"
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-border hover:bg-muted/30"
            }`}
          >
            <div className={`rounded-lg p-2 ${mode === "add" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <ArrowUp className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${mode === "add" ? "text-primary" : "text-foreground"}`}>Начислить НДС</p>
              <p className="text-xs text-muted-foreground">Сумма без НДС → с НДС</p>
            </div>
          </button>
          <button
            onClick={() => setMode("exclude")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              mode === "exclude"
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-border hover:bg-muted/30"
            }`}
          >
            <div className={`rounded-lg p-2 ${mode === "exclude" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <ArrowDown className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${mode === "exclude" ? "text-primary" : "text-foreground"}`}>Выделить НДС</p>
              <p className="text-xs text-muted-foreground">Сумма с НДС → без НДС</p>
            </div>
          </button>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="vat-amount">Сумма</Label>
            <Input
              id="vat-amount"
              type="text"
              inputMode="numeric"
              value={formatNumberInput(amount)}
              onChange={(e) => setAmount(Math.max(0, parseNumberInput(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vat-country">Страна</Label>
            <Select value={vatCountry} onValueChange={(v) => { setVatCountry(v); setManualRate(null); }}>
              <SelectTrigger id="vat-country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vatCountryCodes.map((code) => {
                  const info = getVatCountry(code);
                  const nameKey = info?.nameKey ?? `country.${code}`;
                  return (
                    <SelectItem key={code} value={code}>
                      {t(nameKey, { defaultValue: code.toUpperCase() })}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vat-rate">Ставка (%)</Label>
            <Input
              id="vat-rate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={manualRate ?? effectiveRate}
              onChange={(e) => {
                const v = Number(e.target.value);
                setManualRate(Number.isFinite(v) && v >= 0 && v <= 100 ? v : null);
              }}
            />
          </div>
        </div>

        {/* Reduced rates chips */}
        {countryInfo?.reducedRates && countryInfo.reducedRates.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Пониженные ставки:</span>
            {countryInfo.reducedRates.map((r) => (
              <button
                key={r}
                onClick={() => setManualRate(r)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  effectiveRate === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {r}%
              </button>
            ))}
            <button
              onClick={() => setManualRate(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                manualRate === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {countryInfo.standardRate}% (стандарт)
            </button>
          </div>
        )}

        {/* Results */}
        {result ? (
          <>
            {/* Visual flow */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className={`flex-1 rounded-xl border-2 p-5 ${mode === "add" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Сумма без НДС</p>
                </div>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(result.amountExcl)} ₽</p>
              </div>

              <div className="flex sm:flex-col items-center justify-center gap-1 shrink-0 py-2 sm:py-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                  <Percent className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-primary">{result.rateUsed}%</span>
              </div>

              <div className="flex-1 rounded-xl border-2 border-primary/40 bg-primary/8 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">НДС</p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(result.vatAmount)} ₽</p>
              </div>

              <div className="flex sm:flex-col items-center justify-center shrink-0 py-2 sm:py-0">
                <span className="text-xl text-muted-foreground font-light">=</span>
              </div>

              <div className={`flex-1 rounded-xl border-2 p-5 ${mode === "exclude" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Сумма с НДС</p>
                </div>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(result.amountWithVat)} ₽</p>
              </div>
            </div>

            {/* Formula hint */}
            <Card className="bg-muted/40 border-dashed">
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Формула: </span>
                  {mode === "add"
                    ? `${formatCurrency(result.amountExcl)} × (1 + ${result.rateUsed}/100) = ${formatCurrency(result.amountWithVat)} ₽`
                    : `${formatCurrency(result.amountWithVat)} ÷ (1 + ${result.rateUsed}/100) = ${formatCurrency(result.amountExcl)} ₽`
                  }
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">Введите сумму для расчёта</CardContent>
          </Card>
        )}

        {/* VAT rates table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ставки НДС по странам</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-y border-border">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Страна</th>
                    <th className="text-center py-2.5 px-3 font-medium text-muted-foreground">Стандартная</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Пониженные</th>
                  </tr>
                </thead>
                <tbody>
                  {VAT_COUNTRIES.filter((c) => c.code !== "global").map((c, i) => {
                    const isActive = c.code === vatCountry;
                    return (
                      <tr
                        key={c.code}
                        onClick={() => { setVatCountry(c.code); setManualRate(null); }}
                        className={`border-b border-border/40 cursor-pointer transition-colors ${
                          isActive ? "bg-primary/8 font-medium" : i % 2 === 1 ? "bg-muted/20 hover:bg-muted/40" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-2 px-4 flex items-center gap-2">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                          {t(c.nameKey, { defaultValue: c.code.toUpperCase() })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}>
                            {c.isSalesTax ? "Sales Tax" : `${c.standardRate}%`}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {c.reducedRates?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {c.reducedRates.map((r) => (
                                <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{r}%</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
