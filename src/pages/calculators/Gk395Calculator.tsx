import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown, ChevronRight, Calculator } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/ui/copy-button";
import {
  type Gk395Input,
  type ExcludedPeriod,
  type PartialPayment,
  type DebtIncrease,
  calcGk395,
} from "@/lib/calculators/gk395";
import type { KeyRateEntry } from "@/lib/calculators/peni";
import keyRateData from "@/data/key-rate-ru.json";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const today = () => new Date().toISOString().slice(0, 10);

function CollapsibleSection({
  label,
  count,
  children,
  defaultOpen = false,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-primary transition-colors">
        <span className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {label}
          {count > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{count}</Badge>
          )}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Gk395CalculatorPage() {
  const [sum, setSum] = useState(500000);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(today);
  const [excludedPeriods, setExcludedPeriods] = useState<ExcludedPeriod[]>([]);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [debtIncreases, setDebtIncreases] = useState<DebtIncrease[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);

  const rates = keyRateData.rates as KeyRateEntry[];

  const result = useMemo(() => {
    const input: Gk395Input = { sum, startDate, endDate, excludedPeriods, partialPayments, debtIncreases };
    return calcGk395(input, rates);
  }, [sum, startDate, endDate, excludedPeriods, partialPayments, debtIncreases, rates]);

  const totalDays = useMemo(() => {
    if (!result) return 0;
    return result.breakdown.filter(b => !b.isPayment && !b.isDebtIncrease && !b.isExcluded)
      .reduce((acc, b) => acc + b.days, 0);
  }, [result]);

  const finalBalance = sum
    + debtIncreases.reduce((a, d) => a + d.amount, 0)
    - partialPayments.reduce((a, p) => a + p.amount, 0);

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Проценты по ст. 395 ГК РФ</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Расчёт процентов за пользование чужими денежными средствами по ключевой ставке ЦБ РФ
      </p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="gk395" categoryName="Налоги" categoryPath="/categories/taxes" title={title}>
      <div className="space-y-6">
        {/* Form */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Main fields */}
            <div className="space-y-1.5">
              <Label>Сумма долга (₽)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(sum)}
                onChange={(e) => setSum(Math.max(0, parseNumberInput(e.target.value)))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Период</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">С</span>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">По</span>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-1 divide-y divide-border">
              {/* Partial payments */}
              <CollapsibleSection label="Частичные оплаты" count={partialPayments.length}>
                {partialPayments.length > 0 && (
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-1 mb-1">
                    <span className="text-xs text-muted-foreground pl-0.5">Дата</span>
                    <span className="text-xs text-muted-foreground pl-0.5">Сумма (₽)</span>
                    <span />
                  </div>
                )}
                {partialPayments.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1 items-center">
                    <Input type="date" value={p.date}
                      onChange={(e) => { const arr = [...partialPayments]; arr[i] = { ...arr[i], date: e.target.value }; setPartialPayments(arr); }} />
                    <Input type="text" inputMode="numeric" value={formatNumberInput(p.amount)}
                      onChange={(e) => { const arr = [...partialPayments]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setPartialPayments(arr); }} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setPartialPayments(partialPayments.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => setPartialPayments([...partialPayments, { date: today(), amount: 0 }])}>
                  + Добавить оплату
                </Button>
              </CollapsibleSection>

              {/* Debt increases */}
              <CollapsibleSection label="Увеличение долга" count={debtIncreases.length}>
                {debtIncreases.length > 0 && (
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-1 mb-1">
                    <span className="text-xs text-muted-foreground pl-0.5">Дата</span>
                    <span className="text-xs text-muted-foreground pl-0.5">Сумма (₽)</span>
                    <span />
                  </div>
                )}
                {debtIncreases.map((d, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1 items-center">
                    <Input type="date" value={d.date}
                      onChange={(e) => { const arr = [...debtIncreases]; arr[i] = { ...arr[i], date: e.target.value }; setDebtIncreases(arr); }} />
                    <Input type="text" inputMode="numeric" value={formatNumberInput(d.amount)}
                      onChange={(e) => { const arr = [...debtIncreases]; arr[i] = { ...arr[i], amount: parseNumberInput(e.target.value) }; setDebtIncreases(arr); }} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDebtIncreases(debtIncreases.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => setDebtIncreases([...debtIncreases, { date: today(), amount: 0 }])}>
                  + Добавить увеличение
                </Button>
              </CollapsibleSection>

              {/* Excluded periods */}
              <CollapsibleSection label="Исключённые периоды" count={excludedPeriods.length}>
                {excludedPeriods.length > 0 && (
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-1 mb-1">
                    <span className="text-xs text-muted-foreground pl-0.5">С</span>
                    <span className="text-xs text-muted-foreground pl-0.5">По</span>
                    <span />
                  </div>
                )}
                {excludedPeriods.map((ep, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1 items-center">
                    <Input type="date" value={ep.from}
                      onChange={(e) => { const arr = [...excludedPeriods]; arr[i] = { ...arr[i], from: e.target.value }; setExcludedPeriods(arr); }} />
                    <Input type="date" value={ep.to}
                      onChange={(e) => { const arr = [...excludedPeriods]; arr[i] = { ...arr[i], to: e.target.value }; setExcludedPeriods(arr); }} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setExcludedPeriods(excludedPeriods.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => setExcludedPeriods([...excludedPeriods, { from: startDate, to: endDate }])}>
                  + Добавить период
                </Button>
              </CollapsibleSection>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Результат</CardTitle>
              {result && (
                <CopyButton
                  value={`Сумма долга: ${fmt(finalBalance)} ₽\nПроценты (ст. 395): ${fmt(result.totalInterest)} ₽\nИтого: ${fmt(result.totalDebtWithInterest)} ₽\nДней: ${totalDays}`}
                  label="Скопировать"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-5">
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-primary/5 dark:bg-primary/[0.04] border border-primary/10 dark:border-primary/[0.08] p-3.5">
                    <p className="text-xs text-muted-foreground mb-1">Сумма долга</p>
                    <p className="text-lg font-bold tabular-nums leading-tight">{fmt(finalBalance)} ₽</p>
                  </div>
                  <div className="rounded-lg bg-destructive/8 dark:bg-destructive/[0.05] border border-destructive/15 dark:border-destructive/10 p-3.5">
                    <p className="text-xs text-muted-foreground mb-1">Проценты (ст. 395)</p>
                    <p className="text-lg font-bold tabular-nums leading-tight text-destructive">{fmt(result.totalInterest)} ₽</p>
                  </div>
                  <div className="rounded-lg bg-[hsl(var(--success)/0.08)] dark:bg-[hsl(var(--success)/0.05)] border border-[hsl(var(--success)/0.2)] dark:border-[hsl(var(--success)/0.12)] p-3.5">
                    <p className="text-xs text-muted-foreground mb-1">Итого с процентами</p>
                    <p className="text-lg font-bold tabular-nums leading-tight text-[hsl(var(--success))]">{fmt(result.totalDebtWithInterest)} ₽</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 border border-border p-3.5">
                    <p className="text-xs text-muted-foreground mb-1">Дней начисления</p>
                    <p className="text-lg font-bold tabular-nums leading-tight">{totalDays}</p>
                  </div>
                </div>

                {/* Breakdown table */}
                {result.breakdown.length > 0 && (
                  <div className="rounded-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table size="sm">
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="whitespace-nowrap">Период</TableHead>
                            <TableHead className="whitespace-nowrap">Сумма долга</TableHead>
                            <TableHead className="text-center whitespace-nowrap">Дней</TableHead>
                            <TableHead className="text-center whitespace-nowrap">Ставка</TableHead>
                            <TableHead className="whitespace-nowrap hidden md:table-cell">Формула</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Проценты</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.breakdown.map((b, i) => {
                            if (b.isPayment) {
                              return (
                                <TableRow key={i} className="bg-muted/20">
                                  <TableCell colSpan={3} className="text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                      <Badge variant="secondary" className="text-xs">оплата</Badge>
                                      {b.periodLabel}
                                    </span>
                                  </TableCell>
                                  <TableCell colSpan={3} className="text-right font-medium text-primary">
                                    {b.amountLabel}
                                  </TableCell>
                                </TableRow>
                              );
                            }
                            if (b.isDebtIncrease) {
                              return (
                                <TableRow key={i} className="bg-muted/20">
                                  <TableCell colSpan={3} className="text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                      <Badge variant="outline" className="text-xs">увеличение</Badge>
                                      {b.periodLabel}
                                    </span>
                                  </TableCell>
                                  <TableCell colSpan={3} className="text-right font-medium text-foreground">
                                    {b.amountLabel}
                                  </TableCell>
                                </TableRow>
                              );
                            }
                            return (
                              <TableRow key={i} className={b.isExcluded ? "opacity-40" : undefined}>
                                <TableCell className="whitespace-nowrap">
                                  <span className={b.isExcluded ? "line-through" : undefined}>
                                    {b.periodLabel}
                                  </span>
                                  {b.isExcluded && (
                                    <Badge variant="secondary" className="ml-1.5 text-xs">исключён</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">{b.amountLabel}</TableCell>
                                <TableCell className="text-center tabular-nums">{b.days}</TableCell>
                                <TableCell className="text-center tabular-nums">{b.ratePercent}%</TableCell>
                                <TableCell className="text-muted-foreground text-xs hidden md:table-cell font-mono">{b.formula}</TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{fmt(b.interest)} ₽</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="rounded-full bg-muted p-3">
                  <Calculator className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Введите параметры для расчёта</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Укажите сумму долга и период</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* О расчёте — collapsible */}
        <Card>
          <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium hover:bg-muted/30 transition-colors rounded-lg">
              <span>О расчёте</span>
              {infoOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-0">
                <p>
                  <strong>Ст. 395 ГК РФ</strong> — проценты за пользование чужими денежными средствами начисляются по ключевой ставке ЦБ РФ, действующей в соответствующие периоды.
                </p>
                <p>
                  Формула: Сумма долга × Кол-во дней / Дней в году × Ключевая ставка %. Дни в году: 365 (в високосном — 366).
                </p>
                <p>
                  <strong>Частичные оплаты</strong> уменьшают остаток долга начиная с даты оплаты. <strong>Увеличение долга</strong> прибавляет к остатку. <strong>Исключённые периоды</strong> не учитываются при расчёте процентов.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
