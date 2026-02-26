import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableFoot, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, PiggyBank } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { calcDeposit, type CapitalizationType } from "@/lib/calculators/deposit";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

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
    { value: "monthly",   label: t("calculator.deposit.capMonthly") },
    { value: "quarterly", label: t("calculator.deposit.capQuarterly") },
    { value: "endOfTerm", label: t("calculator.deposit.capEndOfTerm") },
    { value: "none",      label: t("calculator.deposit.capNone") },
  ];

  const result = useMemo(
    () => calcDeposit({ initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate }),
    [initialAmount, annualRate, termMonths, capitalization, monthlyTopUp, monthlyWithdrawal, maxKeyRate]
  );

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.deposit")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("calculatorDescriptions.deposit")}</p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="deposit" categoryName="Финансовые" categoryPath="/categories/finance" title={title}>
      <div className="space-y-6">

        {/* Params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("calculator.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">{t("calculator.deposit.initialAmount")}</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(initialAmount)}
                  onChange={(e) => setInitialAmount(Math.max(0, parseNumberInput(e.target.value)))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate">{t("calculator.deposit.annualRate")}</Label>
                <Input
                  id="rate"
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(+e.target.value)}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="term">{t("calculator.deposit.termMonths")}</Label>
                <Input
                  id="term"
                  type="number"
                  value={termMonths}
                  onChange={(e) => setTermMonths(+e.target.value)}
                  min={1}
                  max={360}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("calculator.deposit.capitalization")}</Label>
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

            {/* Extra options */}
            <div className="border-t border-border pt-4">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors [&[data-state=open]>svg]:rotate-180">
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  {t("calculator.deposit.topUpWithdraw")}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="topup">{t("calculator.deposit.monthlyTopUp")}</Label>
                      <Input
                        id="topup"
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(monthlyTopUp)}
                        onChange={(e) => setMonthlyTopUp(Math.max(0, parseNumberInput(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="withdraw">{t("calculator.deposit.monthlyWithdrawal")}</Label>
                      <Input
                        id="withdraw"
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(monthlyWithdrawal)}
                        onChange={(e) => setMonthlyWithdrawal(Math.max(0, parseNumberInput(e.target.value)))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="keyrate">{t("calculator.deposit.maxKeyRate")}</Label>
                      <Input
                        id="keyrate"
                        type="number"
                        value={maxKeyRate}
                        onChange={(e) => setMaxKeyRate(+e.target.value)}
                        min={0}
                        step={0.25}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("calculator.deposit.totalToReceive")}</CardTitle>
              <CopyButton
                value={`Итоговая сумма: ${fmt(result.finalAmount)} ₽\nПроценты: ${fmt(result.totalInterest)} ₽\nЧистый доход: ${fmt(result.netIncome)} ₽\nНДФЛ: ${fmt(result.tax)} ₽\nЭфф. ставка: ${result.effectiveRate}%`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("calculator.deposit.totalToReceive")}</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{fmt(result.finalAmount)} ₽</p>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] p-3.5">
                <p className="text-xs text-muted-foreground mb-1">{t("calculator.deposit.accruedInterest")}</p>
                <p className="text-base font-bold tabular-nums text-[hsl(var(--success))]">+{fmt(result.totalInterest)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">начисленные %</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">{t("calculator.deposit.effectiveRate")}</p>
                <p className="text-base font-bold tabular-nums">{result.effectiveRate}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">эффективная ставка</p>
              </div>
              <div className="rounded-lg bg-destructive/8 border border-destructive/15 p-3.5">
                <p className="text-xs text-muted-foreground mb-1">{t("calculator.deposit.ndfl13")}</p>
                <p className="text-base font-bold tabular-nums text-destructive">−{fmt(result.tax)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">налог с дохода</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3.5">
                <p className="text-xs text-muted-foreground mb-1">{t("calculator.deposit.netIncome")}</p>
                <p className="text-base font-bold tabular-nums text-primary">{fmt(result.netIncome)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">чистый доход</p>
              </div>
            </div>

            {/* Tax threshold */}
            <div className="rounded-lg bg-muted/30 border border-border p-3.5 space-y-2 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Налог на доход по вкладу</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("calculator.deposit.taxFreeThreshold")}</span>
                <span className="font-medium tabular-nums">{fmt(result.taxFreeThreshold)} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("calculator.deposit.taxableIncome")}</span>
                <span className={`font-medium tabular-nums ${result.taxableIncome > 0 ? "text-destructive" : ""}`}>
                  {fmt(result.taxableIncome)} ₽
                </span>
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-md bg-muted/30 border border-border px-4 py-3 text-xs text-muted-foreground font-mono leading-relaxed">
              {fmt(initialAmount)} ₽ × {annualRate}% × {termMonths} мес. → {fmt(result.totalInterest)} ₽ процентов
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("calculator.deposit.schedule")}</CardTitle>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {showSchedule ? t("calculator.deposit.hide") : t("calculator.deposit.show")}
              </button>
            </div>
          </CardHeader>
          {showSchedule && (
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("calculator.deposit.month")}</TableHead>
                      <TableHead className="text-right">{t("calculator.deposit.openBalance")}</TableHead>
                      <TableHead className="text-right">{t("calculator.table.interest")}</TableHead>
                      {monthlyTopUp > 0 && <TableHead className="text-right">{t("calculator.deposit.topUps")}</TableHead>}
                      {monthlyWithdrawal > 0 && <TableHead className="text-right">{t("calculator.deposit.withdrawals")}</TableHead>}
                      <TableHead className="text-right">{t("calculator.deposit.closeBalance")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.schedule.map((r) => (
                      <TableRow key={r.month}>
                        <TableCell>{r.month}</TableCell>
                        <TableCell className="text-right tabular-nums">{fmt(r.openBalance)}</TableCell>
                        <TableCell className="text-right tabular-nums text-[hsl(var(--success))]">+{fmt(r.interest)}</TableCell>
                        {monthlyTopUp > 0 && <TableCell className="text-right tabular-nums">{fmt(r.topUp)}</TableCell>}
                        {monthlyWithdrawal > 0 && <TableCell className="text-right tabular-nums text-destructive">−{fmt(r.withdrawal)}</TableCell>}
                        <TableCell className="text-right tabular-nums font-medium">{fmt(r.closeBalance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFoot>
                    <TableRow className="font-semibold bg-muted/30">
                      <TableCell colSpan={2}>Итого</TableCell>
                      <TableCell className="text-right tabular-nums text-[hsl(var(--success))]">+{fmt(result.totalInterest)}</TableCell>
                      {monthlyTopUp > 0 && <TableCell className="text-right tabular-nums">{fmt(result.totalTopUps)}</TableCell>}
                      {monthlyWithdrawal > 0 && <TableCell className="text-right tabular-nums text-destructive">−{fmt(result.totalWithdrawals)}</TableCell>}
                      <TableCell className="text-right tabular-nums">{fmt(result.finalAmount)}</TableCell>
                    </TableRow>
                  </TableFoot>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Необлагаемый порог</strong> — 1 000 000 ₽ × максимальная ключевая ставка ЦБ за год. Доход сверх этой суммы облагается НДФЛ 13%.
            </p>
            <p>
              При <strong className="text-foreground">капитализации</strong> проценты добавляются к основному телу вклада, что увеличивает базу для следующих начислений.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
