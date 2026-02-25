import { useState, useMemo } from "react";
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

const CAP_OPTIONS: { value: CapitalizationType; label: string }[] = [
  { value: "monthly", label: "Ежемесячная" },
  { value: "quarterly", label: "Ежеквартальная" },
  { value: "endOfTerm", label: "В конце срока" },
  { value: "none", label: "Без капитализации (простые %)" },
];

export default function DepositCalculator() {
  const [initialAmount, setInitialAmount] = useState(1_000_000);
  const [annualRate, setAnnualRate] = useState(18);
  const [termMonths, setTermMonths] = useState(12);
  const [capitalization, setCapitalization] = useState<CapitalizationType>("monthly");
  const [monthlyTopUp, setMonthlyTopUp] = useState(0);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(0);
  const [maxKeyRate, setMaxKeyRate] = useState(21);
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(
    () => calcDeposit({ initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate }),
    [initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate]
  );

  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="deposit" categoryName="Финансовые" categoryPath="/#finance">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Параметры вклада</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Сумма вклада (₽)</Label>
                  <Input id="amount" type="number" value={initialAmount} onChange={(e) => setInitialAmount(+e.target.value)} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rate">Ставка (% годовых)</Label>
                  <Input id="rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(+e.target.value)} min={0} step={0.1} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="term">Срок (мес.)</Label>
                  <Input id="term" type="number" value={termMonths} onChange={(e) => setTermMonths(+e.target.value)} min={1} max={360} />
                </div>
                <div className="space-y-1.5">
                  <Label>Капитализация</Label>
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
                  Пополнения, снятия и налог
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="topup">Ежемесячное пополнение (₽)</Label>
                      <Input id="topup" type="number" value={monthlyTopUp} onChange={(e) => setMonthlyTopUp(+e.target.value)} min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="withdraw">Ежемесячное снятие (₽)</Label>
                      <Input id="withdraw" type="number" value={monthlyWithdrawal} onChange={(e) => setMonthlyWithdrawal(+e.target.value)} min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="keyrate">Макс. ключевая ставка (%)</Label>
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
                <CardTitle>Помесячный график</CardTitle>
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {showSchedule ? "Скрыть" : "Показать"}
                </button>
              </div>
            </CardHeader>
            {showSchedule && (
              <CardContent className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Мес.</TableHead>
                      <TableHead className="text-right">Баланс (нач.)</TableHead>
                      <TableHead className="text-right">Проценты</TableHead>
                      {monthlyTopUp > 0 && <TableHead className="text-right">Попол.</TableHead>}
                      {monthlyWithdrawal > 0 && <TableHead className="text-right">Снятие</TableHead>}
                      <TableHead className="text-right">Баланс (кон.)</TableHead>
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
            <CardHeader><CardTitle>Итого к получению</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.finalAmount)} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">включая начисленные проценты</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Доход</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Начислено %</span><Badge variant="outline">{fmt(result.totalInterest)} ₽</Badge></div>
              <div className="flex justify-between"><span>Эфф. ставка</span><Badge variant="outline">{result.effectiveRate}%</Badge></div>
              {result.totalTopUps > 0 && (
                <div className="flex justify-between"><span>Пополнения</span><Badge variant="outline">{fmt(result.totalTopUps)} ₽</Badge></div>
              )}
              {result.totalWithdrawals > 0 && (
                <div className="flex justify-between"><span>Снятия</span><Badge variant="destructive">{fmt(result.totalWithdrawals)} ₽</Badge></div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Налог</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Необлагаемый порог</span><Badge variant="outline">{fmt(result.taxFreeThreshold)} ₽</Badge></div>
              <div className="flex justify-between"><span>Облагаемый доход</span><Badge variant={result.taxableIncome > 0 ? "destructive" : "outline"}>{fmt(result.taxableIncome)} ₽</Badge></div>
              <div className="flex justify-between"><span>НДФЛ 13%</span><Badge variant={result.tax > 0 ? "destructive" : "outline"}>{fmt(result.tax)} ₽</Badge></div>
              <div className="flex justify-between font-medium"><span>Чистый доход</span><Badge variant="default">{fmt(result.netIncome)} ₽</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
