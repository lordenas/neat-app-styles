import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <CalculatorLayout calculatorId="vat" categoryName="Налоги" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("calculatorNames.vat", { defaultValue: "Калькулятор НДС" })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("calculatorDescriptions.vat", { defaultValue: "Начислить или выделить НДС по ставке любой страны" })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input panel */}
          <Card className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
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
                <Label>Операция</Label>
                <div className="flex gap-2">
                  <Badge
                    variant={mode === "add" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => setMode("add")}
                  >
                    Начислить НДС
                  </Badge>
                  <Badge
                    variant={mode === "exclude" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => setMode("exclude")}
                  >
                    Выделить НДС
                  </Badge>
                </div>
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
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Сумма без НДС</p>
                      <p className="text-xl font-bold">{formatCurrency(result.amountExcl)}</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        НДС ({result.rateUsed}%)
                      </p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(result.vatAmount)}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Сумма с НДС</p>
                      <p className="text-xl font-bold">{formatCurrency(result.amountWithVat)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Введите сумму для расчёта</p>
                )}
              </CardContent>
            </Card>

            {/* Info sections */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">О калькуляторе НДС</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  НДС (налог на добавленную стоимость) — косвенный налог, который включается в стоимость товаров и услуг. Этот калькулятор позволяет начислить или выделить НДС по стандартной ставке выбранной страны.
                </p>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Формулы</h3>
                  <p>Начислить: Сумма с НДС = Сумма без НДС × (1 + Ставка / 100)</p>
                  <p>Выделить: Сумма без НДС = Сумма с НДС ÷ (1 + Ставка / 100)</p>
                </div>
              </CardContent>
            </Card>

            {/* VAT rates table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ставки НДС по странам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Страна</TableHead>
                        <TableHead>Стандартная (%)</TableHead>
                        <TableHead>Пониженные (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {VAT_COUNTRIES.filter((c) => c.code !== "global").map((c) => (
                        <TableRow key={c.code}>
                          <TableCell>{t(c.nameKey, { defaultValue: c.code.toUpperCase() })}</TableCell>
                          <TableCell>{c.isSalesTax ? "Sales Tax" : `${c.standardRate}%`}</TableCell>
                          <TableCell>{c.reducedRates?.join(", ") ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
