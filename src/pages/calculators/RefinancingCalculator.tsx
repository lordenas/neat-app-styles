import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  calculateRefinancing,
  type RefinancingInput,
  type TermUnit,
} from "@/lib/calculators/refinancing";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

export default function RefinancingCalculatorPage() {
  const { t } = useTranslation();
  const [remainingDebt, setRemainingDebt] = useState(5_000_000);
  const [remainingTerm, setRemainingTerm] = useState(15);
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [currentRate, setCurrentRate] = useState(18);
  const [newRate, setNewRate] = useState(14);
  const [newTerm, setNewTerm] = useState(15);
  const [newTermUnit, setNewTermUnit] = useState<TermUnit>("years");

  const result = useMemo(() => {
    const input: RefinancingInput = {
      remainingDebt, remainingTerm, termUnit, currentRate,
      newRate, newTerm, newTermUnit,
      amountChanged: false, termChanged: true, rateChanged: true,
    };
    return calculateRefinancing(input);
  }, [remainingDebt, remainingTerm, termUnit, currentRate, newRate, newTerm, newTermUnit]);

  return (
    <CalculatorLayout calculatorId="refinancing" categoryName="Финансы" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.refinancing")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.refinancing")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3"><CardTitle className="text-base">{t("calculator.refinancing.remainingDebt")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("calculator.refinancing.remainingDebt")}</Label>
                <Input type="text" inputMode="numeric" value={formatNumberInput(remainingDebt)}
                  onChange={(e) => setRemainingDebt(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.refinancing.remainingTerm")}</Label>
                <div className="flex gap-2 items-end">
                  <Input type="number" min={1} value={remainingTerm} className="flex-1"
                    onChange={(e) => setRemainingTerm(Math.max(1, Number(e.target.value) || 1))} />
                  <div className="flex gap-1">
                    <Badge variant={termUnit === "years" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setTermUnit("years")}>{t("calculator.years")}</Badge>
                    <Badge variant={termUnit === "months" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setTermUnit("months")}>{t("calculator.months")}</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.refinancing.currentRate")}</Label>
                <Input type="number" step={0.1} min={0} value={currentRate}
                  onChange={(e) => setCurrentRate(Math.max(0, Number(e.target.value) || 0))} />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-3">{t("calculator.refinancing.refinancingParams")}</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>{t("calculator.refinancing.newRate")}</Label>
                    <Input type="number" step={0.1} min={0} value={newRate}
                      onChange={(e) => setNewRate(Math.max(0, Number(e.target.value) || 0))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("calculator.refinancing.newTerm")}</Label>
                    <div className="flex gap-2 items-end">
                      <Input type="number" min={1} value={newTerm} className="flex-1"
                        onChange={(e) => setNewTerm(Math.max(1, Number(e.target.value) || 1))} />
                      <div className="flex gap-1">
                        <Badge variant={newTermUnit === "years" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setNewTermUnit("years")}>{t("calculator.years")}</Badge>
                        <Badge variant={newTermUnit === "months" ? "default" : "outline"} className="cursor-pointer px-2 py-1" onClick={() => setNewTermUnit("months")}>{t("calculator.months")}</Badge>
                      </div>
                    </div>
                  </div>
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
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t("calculator.refinancing.monthlyPayment")}</p>
                      <p className="text-sm">{t("calculator.monthlyPayment")}: <strong>{fmt(result.currentMonthlyPayment)} ₽</strong></p>
                      <p className="text-sm">{t("calculator.totalInterest")}: <strong className="text-destructive">{fmt(result.currentTotalInterest)} ₽</strong></p>
                      <p className="text-sm">{t("calculator.totalAmount")}: <strong>{fmt(result.currentTotalPayment)} ₽</strong></p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t("calculator.refinancing.afterRefinancing")}</p>
                      <p className="text-sm">{t("calculator.monthlyPayment")}: <strong>{fmt(result.refinancedMonthlyPayment)} ₽</strong></p>
                      <p className="text-sm">{t("calculator.totalInterest")}: <strong className="text-primary">{fmt(result.refinancedTotalInterest)} ₽</strong></p>
                      <p className="text-sm">{t("calculator.totalAmount")}: <strong>{fmt(result.refinancedTotalPayment)} ₽</strong></p>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${result.totalInterestDelta < 0 ? "bg-green-500/10" : "bg-destructive/10"}`}>
                    <p className="text-sm font-medium">
                      {result.totalInterestDelta < 0
                        ? t("calculator.refinancing.interestSavings", { amount: fmt(Math.abs(result.totalInterestDelta)) })
                        : t("calculator.refinancing.interestIncrease", { amount: fmt(result.totalInterestDelta) })}
                    </p>
                    <p className="text-sm mt-1">
                      {result.monthlyPaymentDelta < 0
                        ? t("calculator.refinancing.monthlySavings", { amount: fmt(Math.abs(result.monthlyPaymentDelta)) })
                        : t("calculator.refinancing.monthlyIncrease", { amount: fmt(result.monthlyPaymentDelta) })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
