import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { calcDeposit, type CapitalizationType } from "@/lib/calculators/deposit";

export default function DepositCalculator() {
  const { t } = useTranslation();
  const [initialAmount, setInitialAmount] = useState(1_000_000);
  const [annualRate, setAnnualRate] = useState(18);
  const [termMonths, setTermMonths] = useState(12);
  const [capitalization, setCapitalization] = useState<CapitalizationType>("monthly");
  const [monthlyTopUp, setMonthlyTopUp] = useState(0);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(0);
  const [maxKeyRate, setMaxKeyRate] = useState(21);
  const [showSchedule, setShowSchedule] = useState(false);

  const CAP_OPTIONS: { value: CapitalizationType; label: string }[] = [
    { value: "monthly", label: t("calc.deposit.capMonthly") },
    { value: "quarterly", label: t("calc.deposit.capQuarterly") },
    { value: "endOfTerm", label: t("calc.deposit.capEndOfTerm") },
    { value: "none", label: t("calc.deposit.capNone") },
  ];

  const result = useMemo(
    () => calcDeposit({ initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate }),
    [initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate]
  );

  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="deposit" categoryName="Финансовые" categoryPath="/#finance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calc.deposit.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("calc.deposit.description")}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{t("common.params")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">{t("calc.deposit.initialAmount")}</Label>
                    <Input id="amount" type="number" value={initialAmount} onChange={(e) => setInitialAmount(+e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rate">{t("calc.deposit.annualRate")}</Label>
                    <Input id="rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(+e.target.value)} min={0} step={0.1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="term">{t("calc.deposit.termMonths")}</Label>
                    <Input id="term" type="number" value={termMonths} onChange={(e) => setTermMonths(+e.target.value)} min={1} max={360} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("calc.deposit.capitalization")}</Label>
                    <Select value={capitalization} onValueChange={(v) => setCapitalization(v as CapitalizationType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CAP_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-4 w-4" />
                    {t("calc.deposit.topUpWithdraw")}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="topup">{t("calc.deposit.monthlyTopUp")}</Label>
                        <Input id="topup" type="number" value={monthlyTopUp} onChange={(e) => setMonthlyTopUp(+e.target.value)} min={0} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="withdraw">{t("calc.deposit.monthlyWithdrawal")}</Label>
                        <Input id="withdraw" type="number" value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(+e.target.value)} min={0} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="keyrate">{t("calc.deposit.maxKeyRate")}</Label>
                        <Input id="keyrate" type="number" value={maxKeyRate} onChange={(e) => setMaxKeyRate(+e.target.value)} min={0} step={0.25} />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("common.schedule")}</CardTitle>
                  <button onClick={() => setShowSchedule(!showSchedule)} className="text-sm text-primary hover:text-primary/80 transition-colors">
                    {showSchedule ? t("common.hide") : t("common.show")}
                  </button>
                </div>
              </CardHeader>
              {showSchedule && (
                <CardContent className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.month")}</TableHead>
                        <TableHead className="text-right">{t("calc.deposit.openBalance")}</TableHead>
                        <TableHead className="text-right">{t("common.interest")}</TableHead>
                        {monthlyTopUp > 0 && <TableHead className="text-right">{t("calc.deposit.topUps")}</TableHead>}
                        {monthlyWithdrawal > 0 && <TableHead className="text-right">{t("calc.deposit.withdrawals")}</TableHead>}
                        <TableHead className="text-right">{t("calc.deposit.closeBalance")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.schedule.map((r) => (
                        <TableRow key={r.month}>
                          <TableCell>{r.month}</TableCell>
                          <TableCell className="text-right">{fmt(r.openBalance)}</TableCell>
                          <TableCell className="text-right text-primary">{fmt(r.interest)}</TableCell>
                          {monthlyTopUp > 0 && <TableCell className="text-right">{fmt(r.topUp)}</TableCell>}
                          {monthlyWithdrawal > 0 && <TableCell className="text-right text-destructive">{fmt(r.withdrawal)}</TableCell>}
                          <TableCell className="text-right font-medium">{fmt(r.closeBalance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>{t("calc.deposit.totalToReceive")}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{fmt(result.finalAmount)} ₽</p>
                <p className="text-xs text-muted-foreground mt-1">{t("calc.deposit.inclInterest")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t("calc.deposit.income")}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>{t("calc.deposit.accruedInterest")}</span><Badge variant="outline">{fmt(result.totalInterest)} ₽</Badge></div>
                <div className="flex justify-between"><span>{t("calc.deposit.effectiveRate")}</span><Badge variant="outline">{result.effectiveRate}%</Badge></div>
                {result.totalTopUps > 0 && <div className="flex justify-between"><span>{t("calc.deposit.topUps")}</span><Badge variant="outline">{fmt(result.totalTopUps)} ₽</Badge></div>}
                {result.totalWithdrawals > 0 && <div className="flex justify-between"><span>{t("calc.deposit.withdrawals")}</span><Badge variant="destructive">{fmt(result.totalWithdrawals)} ₽</Badge></div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t("calc.deposit.tax")}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>{t("calc.deposit.taxFreeThreshold")}</span><Badge variant="outline">{fmt(result.taxFreeThreshold)} ₽</Badge></div>
                <div className="flex justify-between"><span>{t("calc.deposit.taxableIncome")}</span><Badge variant={result.taxableIncome > 0 ? "destructive" : "outline"}>{fmt(result.taxableIncome)} ₽</Badge></div>
                <div className="flex justify-between"><span>{t("calc.deposit.ndfl13")}</span><Badge variant={result.tax > 0 ? "destructive" : "outline"}>{fmt(result.tax)} ₽</Badge></div>
                <div className="flex justify-between font-medium"><span>{t("calc.deposit.netIncome")}</span><Badge variant="default">{fmt(result.netIncome)} ₽</Badge></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
