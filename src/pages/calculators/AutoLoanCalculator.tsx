import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calcAutoLoan, type AutoLoanInput } from "@/lib/calculators/auto-loan";

export default function AutoLoanCalculator() {
  const [carPrice, setCarPrice] = useState(2_000_000);
  const [downPayment, setDownPayment] = useState(400_000);
  const [annualRate, setAnnualRate] = useState(12);
  const [termMonths, setTermMonths] = useState(60);

  const input: AutoLoanInput = { carPrice, downPayment, annualRate, termMonths };
  const result = useMemo(() => calcAutoLoan(input), [carPrice, downPayment, annualRate, termMonths]);
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="auto-loan" categoryName="Automotive" categoryPath="/#automotive">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Параметры кредита</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Стоимость авто</Label>
                  <Input id="price" type="number" value={carPrice} onChange={(e) => setCarPrice(+e.target.value)} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dp">Первоначальный взнос</Label>
                  <Input id="dp" type="number" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rate">Ставка (% годовых)</Label>
                  <Input id="rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(+e.target.value)} min={0} step={0.1} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="term">Срок (мес.)</Label>
                  <Input id="term" type="number" value={termMonths} onChange={(e) => setTermMonths(+e.target.value)} min={1} max={360} />
                </div>
              </div>
            </CardContent>
          </Card>

          {result.schedule.length > 0 && (
            <Card>
              <CardHeader><CardTitle>График платежей</CardTitle></CardHeader>
              <CardContent className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead className="text-right">Платёж</TableHead>
                      <TableHead className="text-right">Основной долг</TableHead>
                      <TableHead className="text-right">Проценты</TableHead>
                      <TableHead className="text-right">Остаток</TableHead>
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
            <CardHeader><CardTitle>Ежемесячный платёж</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.monthlyPayment)} ₽</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Итого</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Сумма кредита</span><Badge variant="outline">{fmt(result.loanAmount)} ₽</Badge></div>
              <div className="flex justify-between"><span>Общая выплата</span><Badge variant="outline">{fmt(result.totalPayment)} ₽</Badge></div>
              <div className="flex justify-between"><span>Переплата</span><Badge variant="destructive">{fmt(result.totalInterest)} ₽</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
