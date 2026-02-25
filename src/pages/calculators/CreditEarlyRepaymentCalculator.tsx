import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculateMortgage } from "@/lib/calculators/refinancing";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

type RepaymentMode = "reduce_term" | "reduce_payment";

export default function CreditEarlyRepaymentCalculatorPage() {
  const { t } = useTranslation();
  const [loanAmount, setLoanAmount] = useState(5_000_000);
  const [annualRate, setAnnualRate] = useState(18);
  const [termYears, setTermYears] = useState(15);
  const [earlyAmount, setEarlyAmount] = useState(500_000);
  const [mode, setMode] = useState<RepaymentMode>("reduce_term");

  const baseResult = useMemo(() => calculateMortgage(loanAmount, 0, annualRate, termYears), [loanAmount, annualRate, termYears]);

  const withEarlyResult = useMemo(() => {
    const newPrincipal = Math.max(0, loanAmount - earlyAmount);
    if (mode === "reduce_payment") {
      return calculateMortgage(newPrincipal + earlyAmount, earlyAmount, annualRate, termYears);
    } else {
      const targetPayment = baseResult.monthlyPayment;
      const r = annualRate / 100 / 12;
      if (r <= 0 || newPrincipal <= 0) return calculateMortgage(newPrincipal + earlyAmount, earlyAmount, annualRate, termYears);
      const val = 1 - (newPrincipal * r) / targetPayment;
      if (val <= 0) return calculateMortgage(newPrincipal + earlyAmount, earlyAmount, annualRate, termYears);
      const newTermMonths = Math.ceil(-Math.log(val) / Math.log(1 + r));
      const newTermYears = Math.ceil(newTermMonths / 12);
      return {
        ...calculateMortgage(newPrincipal + earlyAmount, earlyAmount, annualRate, newTermYears),
        reducedTermMonths: newTermMonths,
      };
    }
  }, [loanAmount, earlyAmount, annualRate, termYears, mode, baseResult.monthlyPayment]);

  const savings = baseResult.totalInterest - withEarlyResult.totalInterest;

  return (
    <CalculatorLayout calculatorId="credit-early-repayment" categoryName="Финансы" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.credit-early-repayment")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.credit-early-repayment")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.inputTitle")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("calculator.creditEarly.fields.loanAmount")}</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(loanAmount)}
                  onChange={(e) => setLoanAmount(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.creditEarly.fields.rate")}</Label>
                <Input type="number" step={0.1} min={0} value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.creditEarly.fields.term")}</Label>
                <Input type="number" min={1} max={50} value={termYears}
                  onChange={(e) => setTermYears(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.creditEarly.fields.amount")}</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(earlyAmount)}
                  onChange={(e) => setEarlyAmount(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.creditEarly.fields.recalc")}</Label>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={mode === "reduce_term" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setMode("reduce_term")}>
                    {t("calculator.creditEarly.recalc.term")}
                  </Badge>
                  <Badge variant={mode === "reduce_payment" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setMode("reduce_payment")}>
                    {t("calculator.creditEarly.recalc.payment")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.results")}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t("calculator.creditEarly.resultWithoutEarly")}</p>
                      <p className="text-sm">{t("calculator.monthlyPayment")}: <strong>{fmt(baseResult.monthlyPayment)} ₽</strong></p>
                      <p className="text-sm">{t("calculator.totalInterest")}: <strong className="text-destructive">{fmt(baseResult.totalInterest)} ₽</strong></p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t("calculator.creditEarly.resultWithEarly")}</p>
                      <p className="text-sm">{t("calculator.monthlyPayment")}: <strong>{fmt(withEarlyResult.monthlyPayment)} ₽</strong></p>
                      <p className="text-sm">{t("calculator.totalInterest")}: <strong className="text-primary">{fmt(withEarlyResult.totalInterest)} ₽</strong></p>
                    </div>
                  </div>

                  {savings > 0 && (
                    <div className="bg-green-500/10 rounded-lg p-4">
                      <p className="text-lg font-bold text-green-600">{t("calculator.creditEarly.youSave")}: {fmt(savings)} ₽</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
