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
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, PiggyBank, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { calcDeposit, type CapitalizationType, type OneTimeTransaction } from "@/lib/calculators/deposit";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

// Current key rate from data
const CURRENT_KEY_RATE = 21;

export default function DepositCalculator() {
  const { t } = useTranslation();

  // Base params
  const [initialAmount, setInitialAmount] = useState(1_000_000);
  const [annualRate, setAnnualRate] = useState(18);
  const [termMonths, setTermMonths] = useState(12);
  const [capitalization, setCapitalization] = useState<CapitalizationType>("monthly");

  // Top-ups
  const [monthlyTopUp, setMonthlyTopUp] = useState(0);
  const [oneTimeTopUps, setOneTimeTopUps] = useState<OneTimeTransaction[]>([]);

  // Withdrawals
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(0);
  const [oneTimeWithdrawals, setOneTimeWithdrawals] = useState<OneTimeTransaction[]>([]);

  // Tax
  const [maxKeyRate, setMaxKeyRate] = useState(CURRENT_KEY_RATE);
  const [ndflRate, setNdflRate] = useState(13);

  const [showSchedule, setShowSchedule] = useState(false);

  const CAP_OPTIONS: { value: CapitalizationType; label: string }[] = [
    { value: "monthly",   label: t("calculator.deposit.capMonthly") },
    { value: "quarterly", label: t("calculator.deposit.capQuarterly") },
    { value: "endOfTerm", label: t("calculator.deposit.capEndOfTerm") },
    { value: "none",      label: t("calculator.deposit.capNone") },
  ];

  const result = useMemo(
    () => calcDeposit({
      initialAmount, annualRate, termMonths, capitalization,
      monthlyTopUp, monthlyWithdrawal, maxKeyRate, ndflRate,
      oneTimeTopUps, oneTimeWithdrawals,
    }),
    [initialAmount, annualRate, termMonths, capitalization,
     monthlyTopUp, monthlyWithdrawal, maxKeyRate, ndflRate,
     oneTimeTopUps, oneTimeWithdrawals]
  );

  // Helpers for one-time lists
  const addOTTopUp = () => setOneTimeTopUps([...oneTimeTopUps, { month: 1, amount: 0 }]);
  const removeOTTopUp = (i: number) => setOneTimeTopUps(oneTimeTopUps.filter((_, idx) => idx !== i));
  const updateOTTopUp = (i: number, field: keyof OneTimeTransaction, val: number) => {
    const copy = [...oneTimeTopUps]; copy[i] = { ...copy[i], [field]: val }; setOneTimeTopUps(copy);
  };

  const addOTWithdrawal = () => setOneTimeWithdrawals([...oneTimeWithdrawals, { month: 1, amount: 0 }]);
  const removeOTWithdrawal = (i: number) => setOneTimeWithdrawals(oneTimeWithdrawals.filter((_, idx) => idx !== i));
  const updateOTWithdrawal = (i: number, field: keyof OneTimeTransaction, val: number) => {
    const copy = [...oneTimeWithdrawals]; copy[i] = { ...copy[i], [field]: val }; setOneTimeWithdrawals(copy);
  };

  const hasExtraTopUps = monthlyTopUp > 0 || oneTimeTopUps.length > 0;
  const hasExtraWithdrawals = monthlyWithdrawal > 0 || oneTimeWithdrawals.length > 0;

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.deposit")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("calculatorDescriptions.deposit")}</p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="deposit" categoryName="Финансовые" categoryPath="/categories/finance" title={title}>
      <div className="space-y-6">

        {/* Base params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("calculator.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
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
                  onChange={(e) => setTermMonths(Math.max(1, Math.min(360, +e.target.value)))}
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
          </CardContent>
        </Card>

        {/* Top-ups */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Пополнения</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Регулярные и разовые взносы</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Регулярное */}
            <div className="space-y-1.5">
              <Label htmlFor="topup">Регулярное пополнение (ежемесячно, ₽)</Label>
              <Input
                id="topup"
                type="text"
                inputMode="numeric"
                value={formatNumberInput(monthlyTopUp)}
                onChange={(e) => setMonthlyTopUp(Math.max(0, parseNumberInput(e.target.value)))}
              />
            </div>

            {/* Разовые */}
            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Разовые пополнения</p>
                <Button variant="outline" size="sm" onClick={addOTTopUp}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Добавить
                </Button>
              </div>
              {oneTimeTopUps.length === 0 ? (
                <p className="text-xs text-muted-foreground">Нет разовых пополнений</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-0.5">
                    <span className="text-xs text-muted-foreground">Месяц (1–{termMonths})</span>
                    <span className="text-xs text-muted-foreground">Сумма, ₽</span>
                    <span className="w-8" />
                  </div>
                  {oneTimeTopUps.map((ot, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        type="number"
                        value={ot.month}
                        min={1}
                        max={termMonths}
                        onChange={(e) => updateOTTopUp(i, "month", Math.min(termMonths, Math.max(1, +e.target.value)))}
                      />
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(ot.amount)}
                        onChange={(e) => updateOTTopUp(i, "amount", Math.max(0, parseNumberInput(e.target.value)))}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOTTopUp(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals */}
        <Card>
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base">Частичные снятия</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Регулярные и разовые снятия</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Регулярное */}
            <div className="space-y-1.5">
              <Label htmlFor="withdraw">Регулярное снятие (ежемесячно, ₽)</Label>
              <Input
                id="withdraw"
                type="text"
                inputMode="numeric"
                value={formatNumberInput(monthlyWithdrawal)}
                onChange={(e) => setMonthlyWithdrawal(Math.max(0, parseNumberInput(e.target.value)))}
              />
            </div>

            {/* Разовые */}
            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Разовые снятия</p>
                <Button variant="outline" size="sm" onClick={addOTWithdrawal}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Добавить
                </Button>
              </div>
              {oneTimeWithdrawals.length === 0 ? (
                <p className="text-xs text-muted-foreground">Нет разовых снятий</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-0.5">
                    <span className="text-xs text-muted-foreground">Месяц (1–{termMonths})</span>
                    <span className="text-xs text-muted-foreground">Сумма, ₽</span>
                    <span className="w-8" />
                  </div>
                  {oneTimeWithdrawals.map((ot, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        type="number"
                        value={ot.month}
                        min={1}
                        max={termMonths}
                        onChange={(e) => updateOTWithdrawal(i, "month", Math.min(termMonths, Math.max(1, +e.target.value)))}
                      />
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(ot.amount)}
                        onChange={(e) => updateOTWithdrawal(i, "amount", Math.max(0, parseNumberInput(e.target.value)))}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOTWithdrawal(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax */}
        <Card>
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base">Налог</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">НДФЛ с дохода по вкладам в РФ</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="keyrate">Ключевая ставка ЦБ, %</Label>
                <Input
                  id="keyrate"
                  type="number"
                  value={maxKeyRate}
                  onChange={(e) => setMaxKeyRate(Math.max(0, +e.target.value))}
                  min={0}
                  step={0.25}
                />
                <p className="text-[11px] text-muted-foreground">Максимальная за год. Текущая: {CURRENT_KEY_RATE}%</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ndfl">Ставка НДФЛ, %</Label>
                <Input
                  id="ndfl"
                  type="number"
                  value={ndflRate}
                  onChange={(e) => setNdflRate(Math.max(0, +e.target.value))}
                  min={0}
                  max={100}
                  step={1}
                />
                <p className="text-[11px] text-muted-foreground">13% — резиденты, 30% — нерезиденты</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-muted/30 border border-border px-3.5 py-3 text-xs text-muted-foreground">
              Необлагаемый порог: 1 000 000 ₽ × {maxKeyRate}% = <span className="font-semibold text-foreground">{fmt(result.taxFreeThreshold)} ₽</span>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("calculator.deposit.totalToReceive")}</CardTitle>
              <CopyButton
                value={`Итоговая сумма: ${fmt(result.finalAmount)} ₽\nПроценты: ${fmt(result.totalInterest)} ₽\nЧистый доход: ${fmt(result.netIncome)} ₽\nНДФЛ ${ndflRate}%: ${fmt(result.tax)} ₽\nЭфф. ставка: ${result.effectiveRate}%`}
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
                <p className="text-xs text-muted-foreground mb-1">НДФЛ {ndflRate}%</p>
                <p className="text-base font-bold tabular-nums text-destructive">−{fmt(result.tax)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">налог с дохода</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3.5">
                <p className="text-xs text-muted-foreground mb-1">{t("calculator.deposit.netIncome")}</p>
                <p className="text-base font-bold tabular-nums text-primary">{fmt(result.netIncome)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">чистый доход</p>
              </div>
            </div>

            {/* Tax detail */}
            <div className="rounded-lg bg-muted/30 border border-border p-3.5 space-y-2 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Детали налога</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Необлагаемый порог</span>
                <span className="font-medium tabular-nums">{fmt(result.taxFreeThreshold)} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Налогооблагаемый доход</span>
                <span className={`font-medium tabular-nums ${result.taxableIncome > 0 ? "text-destructive" : ""}`}>
                  {fmt(result.taxableIncome)} ₽
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Налог ({ndflRate}%)</span>
                <span className={`font-medium tabular-nums ${result.tax > 0 ? "text-destructive" : ""}`}>
                  {fmt(result.tax)} ₽
                </span>
              </div>
            </div>

            {/* Extra totals if applicable */}
            {(hasExtraTopUps || hasExtraWithdrawals) && (
              <div className="rounded-lg bg-muted/30 border border-border p-3.5 space-y-2 text-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Движение средств</p>
                {hasExtraTopUps && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Всего пополнений</span>
                    <span className="font-medium tabular-nums text-[hsl(var(--success))]">+{fmt(result.totalTopUps)} ₽</span>
                  </div>
                )}
                {hasExtraWithdrawals && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Всего снятий</span>
                    <span className="font-medium tabular-nums text-destructive">−{fmt(result.totalWithdrawals)} ₽</span>
                  </div>
                )}
              </div>
            )}

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
                      <TableHead>Мес.</TableHead>
                      <TableHead className="text-right">Начало</TableHead>
                      <TableHead className="text-right">%</TableHead>
                      {(monthlyTopUp > 0 || oneTimeTopUps.length > 0) && <TableHead className="text-right">Пополн.</TableHead>}
                      {(monthlyWithdrawal > 0 || oneTimeWithdrawals.length > 0) && <TableHead className="text-right">Снятие</TableHead>}
                      <TableHead className="text-right">Конец</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.schedule.map((r) => {
                      const totalTopUp = r.topUp + r.oneTimeTopUp;
                      const totalWithdrawal = r.withdrawal + r.oneTimeWithdrawal;
                      return (
                        <TableRow key={r.month}>
                          <TableCell>{r.month}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmt(r.openBalance)}</TableCell>
                          <TableCell className="text-right tabular-nums text-[hsl(var(--success))]">+{fmt(r.interest)}</TableCell>
                          {(monthlyTopUp > 0 || oneTimeTopUps.length > 0) && (
                            <TableCell className="text-right tabular-nums text-[hsl(var(--success))]">
                              {totalTopUp > 0 ? `+${fmt(totalTopUp)}` : "—"}
                            </TableCell>
                          )}
                          {(monthlyWithdrawal > 0 || oneTimeWithdrawals.length > 0) && (
                            <TableCell className="text-right tabular-nums text-destructive">
                              {totalWithdrawal > 0 ? `−${fmt(totalWithdrawal)}` : "—"}
                            </TableCell>
                          )}
                          <TableCell className="text-right tabular-nums font-medium">{fmt(r.closeBalance)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2} className="font-semibold">Итого</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-[hsl(var(--success))]">+{fmt(result.totalInterest)}</TableCell>
                      {(monthlyTopUp > 0 || oneTimeTopUps.length > 0) && (
                        <TableCell className="text-right tabular-nums font-semibold">+{fmt(result.totalTopUps)}</TableCell>
                      )}
                      {(monthlyWithdrawal > 0 || oneTimeWithdrawals.length > 0) && (
                        <TableCell className="text-right tabular-nums font-semibold text-destructive">−{fmt(result.totalWithdrawals)}</TableCell>
                      )}
                      <TableCell className="text-right tabular-nums font-semibold">{fmt(result.finalAmount)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Необлагаемый порог</strong> — 1 000 000 ₽ × максимальная ключевая ставка ЦБ за год. Доход сверх этой суммы облагается НДФЛ.
            </p>
            <p>
              При <strong className="text-foreground">капитализации</strong> проценты добавляются к основному телу вклада, увеличивая базу для следующих начислений.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
