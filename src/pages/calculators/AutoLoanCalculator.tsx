import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calcAutoLoan, type AutoLoanInput } from "@/lib/calculators/auto-loan";

export default function AutoLoanCalculator() {
  const { t } = useTranslation();
  const [carPrice, setCarPrice] = useState(2_000_000);
  const [downPayment, setDownPayment] = useState(400_000);
  const [annualRate, setAnnualRate] = useState(12);
  const [termMonths, setTermMonths] = useState(60);

  const input: AutoLoanInput = { carPrice, downPayment, annualRate, termMonths };
  const result = useMemo(() => calcAutoLoan(input), [carPrice, downPayment, annualRate, termMonths]);
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="auto-loan" categoryName="Automotive" categoryPath="/#automotive">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calc.autoLoan.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("calc.autoLoan.description")}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{t("common.params")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">{t("calc.autoLoan.carPrice")}</Label>
                    <Input id="price" type="number" value={carPrice} onChange={(e) => setCarPrice(+e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dp">{t("calc.autoLoan.downPayment")}</Label>
                    <Input id="dp" type="number" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rate">{t("calc.autoLoan.annualRate")}</Label>
                    <Input id="rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(+e.target.value)} min={0} step={0.1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="term">{t("calc.autoLoan.termMonths")}</Label>
                    <Input id="term" type="number" value={termMonths} onChange={(e) => setTermMonths(+e.target.value)} min={1} max={360} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.schedule.length > 0 && (
              <Card>
                <CardHeader><CardTitle>{t("common.schedule")}</CardTitle></CardHeader>
                <CardContent className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.no")}</TableHead>
                        <TableHead className="text-right">{t("common.payment")}</TableHead>
                        <TableHead className="text-right">{t("common.principalDebt")}</TableHead>
                        <TableHead className="text-right">{t("common.interest")}</TableHead>
                        <TableHead className="text-right">{t("common.balance")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.schedule.map((r) => (
                        <TableRow key={r.month}>
                          <TableCell>{r.month}</TableCell>
                          <TableCell className="text-right">{fmt(r.payment)}</TableCell>
                          <TableCell className="text-right text-primary">{fmt(r.principal)}</TableCell>
                          <TableCell className="text-right text-destructive">{fmt(r.interest)}</TableCell>
                          <TableCell className="text-right">{fmt(r.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>{t("common.monthlyPayment")}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{fmt(result.monthlyPayment)} ₽</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t("common.total")}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>{t("common.loanAmount")}</span><Badge variant="outline">{fmt(result.loanAmount)} ₽</Badge></div>
                <div className="flex justify-between"><span>{t("common.totalPayment")}</span><Badge variant="outline">{fmt(result.totalPayment)} ₽</Badge></div>
                <div className="flex justify-between"><span>{t("common.overpayment")}</span><Badge variant="destructive">{fmt(result.totalInterest)} ₽</Badge></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
