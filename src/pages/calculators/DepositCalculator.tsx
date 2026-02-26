import { useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import {
  calculateDeposit,
  type TermUnit,
  type CompoundFrequency,
  type PayoutFrequency,
  type OneTimeTopUp,
  type RegularTopUp,
  type OneTimeWithdrawal,
  type RegularWithdrawal,
} from "@/lib/calculators/deposit";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (s: string) => {
  if (!s) return s;
  const d = new Date(s + "T00:00:00");
  if (Number.isNaN(d.getTime())) return s;
  return `${`${d.getDate()}`.padStart(2,"0")}.${`${d.getMonth()+1}`.padStart(2,"0")}.${d.getFullYear()}`;
};

const COMPOUND_OPTIONS: { value: CompoundFrequency; label: string }[] = [
  { value: "1D", label: "Ежедневно" },
  { value: "1W", label: "Еженедельно" },
  { value: "1M", label: "Ежемесячно" },
  { value: "3M", label: "Раз в квартал" },
  { value: "6M", label: "Раз в полгода" },
  { value: "1Y", label: "Раз в год" },
];

const PAYOUT_OPTIONS: { value: PayoutFrequency; label: string }[] = [
  { value: "end",  label: "В конце срока" },
  { value: "1M",  label: "Ежемесячно" },
  { value: "3M",  label: "Раз в квартал" },
  { value: "6M",  label: "Раз в полгода" },
  { value: "1Y",  label: "Раз в год" },
];

const PERIOD_OPTIONS = [
  { value: "1M", label: "Раз в месяц" },
  { value: "2M", label: "Раз в 2 месяца" },
  { value: "3M", label: "Раз в квартал" },
  { value: "6M", label: "Раз в полгода" },
  { value: "1Y", label: "Раз в год" },
] as const;

function getToday() { return format(new Date(), "yyyy-MM-dd"); }

const EVENT_LABELS: Record<string, string> = {
  deposit: "Начальная сумма",
  interest: "Капитализация",
  payout: "Выплата %",
  topup: "Пополнение",
  withdrawal: "Снятие",
  end: "Итого",
};

export default function DepositCalculator() {
  const { t } = useTranslation();

  const [principal, setPrincipal] = useState(1_000_000);
  const [startDate, setStartDate] = useState(getToday());
  const [term, setTerm] = useState(12);
  const [termUnit, setTermUnit] = useState<TermUnit>("months");
  const [annualRate, setAnnualRate] = useState(18);
  const [capitalization, setCapitalization] = useState(true);
  const [compoundFreq, setCompoundFreq] = useState<CompoundFrequency>("1M");
  const [payoutFreq, setPayoutFreq] = useState<PayoutFrequency>("end");

  const [oneTimeTopUps, setOneTimeTopUps] = useState<OneTimeTopUp[]>([]);
  const [regularTopUps, setRegularTopUps] = useState<RegularTopUp[]>([]);
  const [oneTimeWithdrawals, setOneTimeWithdrawals] = useState<OneTimeWithdrawal[]>([]);
  const [regularWithdrawals, setRegularWithdrawals] = useState<RegularWithdrawal[]>([]);
  const [minimumBalance, setMinimumBalance] = useState(0);

  const [keyRate, setKeyRate] = useState(16);
  const [taxRate, setTaxRate] = useState(13);

  const [showSchedule, setShowSchedule] = useState(false);
  const [taxInfoOpen, setTaxInfoOpen] = useState(false);

  const result = useMemo(() => {
    if (principal <= 0 || !startDate || term <= 0) return null;
    return calculateDeposit({
      principal, startDate, term, termUnit,
      annualRatePercent: annualRate,
      capitalization, compoundFrequency: compoundFreq, payoutFrequency: payoutFreq,
      oneTimeTopUps: oneTimeTopUps.filter(t => t.date && t.amount > 0),
      regularTopUps: regularTopUps.filter(r => r.startDate && r.amount > 0),
      oneTimeWithdrawals: oneTimeWithdrawals.filter(w => w.date && w.amount > 0),
      regularWithdrawals: regularWithdrawals.filter(r => r.startDate && r.amount > 0),
      minimumBalance, keyRatePercent: keyRate, taxRatePercent: taxRate,
    });
  }, [principal, startDate, term, termUnit, annualRate, capitalization, compoundFreq, payoutFreq,
      oneTimeTopUps, regularTopUps, oneTimeWithdrawals, regularWithdrawals, minimumBalance, keyRate, taxRate]);

  // Top-up handlers
  const addOTTopUp = useCallback(() => setOneTimeTopUps(p => [...p, { date: startDate, amount: 0 }]), [startDate]);
  const removeOTTopUp = useCallback((i: number) => setOneTimeTopUps(p => p.filter((_, j) => j !== i)), []);
  const updateOTTopUp = useCallback((i: number, patch: Partial<OneTimeTopUp>) =>
    setOneTimeTopUps(p => { const n = [...p]; n[i] = { ...n[i], ...patch }; return n; }), []);

  const addRegTopUp = useCallback(() => setRegularTopUps(p => [...p, { startDate, period: "1M", amount: 0 }]), [startDate]);
  const removeRegTopUp = useCallback((i: number) => setRegularTopUps(p => p.filter((_, j) => j !== i)), []);
  const updateRegTopUp = useCallback((i: number, patch: Partial<RegularTopUp>) =>
    setRegularTopUps(p => { const n = [...p]; n[i] = { ...n[i], ...patch }; return n; }), []);

  // Withdrawal handlers
  const addOTWithdrawal = useCallback(() => setOneTimeWithdrawals(p => [...p, { date: startDate, amount: 0 }]), [startDate]);
  const removeOTWithdrawal = useCallback((i: number) => setOneTimeWithdrawals(p => p.filter((_, j) => j !== i)), []);
  const updateOTWithdrawal = useCallback((i: number, patch: Partial<OneTimeWithdrawal>) =>
    setOneTimeWithdrawals(p => { const n = [...p]; n[i] = { ...n[i], ...patch }; return n; }), []);

  const addRegWithdrawal = useCallback(() => setRegularWithdrawals(p => [...p, { startDate, period: "1M", amount: 0 }]), [startDate]);
  const removeRegWithdrawal = useCallback((i: number) => setRegularWithdrawals(p => p.filter((_, j) => j !== i)), []);
  const updateRegWithdrawal = useCallback((i: number, patch: Partial<RegularWithdrawal>) =>
    setRegularWithdrawals(p => { const n = [...p]; n[i] = { ...n[i], ...patch }; return n; }), []);

  const hasTopUps = oneTimeTopUps.length > 0 || regularTopUps.length > 0;
  const hasWithdrawals = oneTimeWithdrawals.length > 0 || regularWithdrawals.length > 0;

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор вкладов</h1>
      <p className="text-muted-foreground mt-1 text-sm">Расчёт дохода по вкладу с капитализацией, пополнениями, снятиями и налогом</p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="deposit" categoryName="Финансовые" categoryPath="/categories/finance" title={title}>
      <div className="space-y-6">

        {/* Base params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Основные параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="principal">Сумма вклада, ₽</Label>
                <Input id="principal" type="text" inputMode="numeric"
                  value={formatNumberInput(principal)}
                  onChange={(e) => setPrincipal(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start">Дата начала</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="term">Срок</Label>
                <div className="flex gap-2">
                  <Input id="term" type="number" value={term}
                    onChange={(e) => setTerm(Math.max(1, +e.target.value))}
                    min={1} className="flex-1" />
                  <Select value={termUnit} onValueChange={(v) => setTermUnit(v as TermUnit)}>
                    <SelectTrigger className="w-28 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">дней</SelectItem>
                      <SelectItem value="months">месяцев</SelectItem>
                      <SelectItem value="years">лет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate">Ставка, % годовых</Label>
                <Input id="rate" type="number" value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, +e.target.value))} min={0} step={0.1} />
              </div>
            </div>

            {/* Капитализация */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-medium">Капитализация и выплаты</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" className="accent-primary" checked={capitalization} onChange={() => setCapitalization(true)} />
                  С капитализацией
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" className="accent-primary" checked={!capitalization} onChange={() => setCapitalization(false)} />
                  Без капитализации
                </label>
              </div>
              {capitalization ? (
                <div className="space-y-1.5 max-w-xs">
                  <Label>Периодичность капитализации</Label>
                  <Select value={compoundFreq} onValueChange={(v) => setCompoundFreq(v as CompoundFrequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COMPOUND_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5 max-w-xs">
                  <Label>Выплата процентов</Label>
                  <Select value={payoutFreq} onValueChange={(v) => setPayoutFreq(v as PayoutFrequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYOUT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Пополнения */}
        <Card className="border-[hsl(var(--success)/0.25)] dark:border-[hsl(var(--success)/0.15)]">
          <CardHeader className="pb-3 border-b border-[hsl(var(--success)/0.15)] dark:border-[hsl(var(--success)/0.1)]">
            <CardTitle className="text-base">Пополнения</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {/* Разовые */}
            {oneTimeTopUps.map((t, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground shrink-0 w-28">Разовое</span>
                <Input type="date" value={t.date} onChange={(e) => updateOTTopUp(i, { date: e.target.value })}
                  className="min-w-[9rem] max-w-[11rem]" />
                <Input type="text" inputMode="numeric" placeholder="Сумма ₽"
                  value={formatNumberInput(t.amount)}
                  onChange={(e) => updateOTTopUp(i, { amount: Math.max(0, parseNumberInput(e.target.value)) })}
                  className="min-w-[7rem] max-w-[9rem]" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOTTopUp(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {/* Регулярные */}
            {regularTopUps.map((r, i) => (
              <div key={`r${i}`} className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground shrink-0 w-28">Регулярное</span>
                <Input type="date" value={r.startDate} onChange={(e) => updateRegTopUp(i, { startDate: e.target.value })}
                  className="min-w-[9rem] max-w-[11rem]" />
                <Select value={r.period} onValueChange={(v) => updateRegTopUp(i, { period: v as any })}>
                  <SelectTrigger className="min-w-[9rem] max-w-[11rem]"><SelectValue /></SelectTrigger>
                  <SelectContent>{PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="text" inputMode="numeric" placeholder="Сумма ₽"
                  value={formatNumberInput(r.amount)}
                  onChange={(e) => updateRegTopUp(i, { amount: Math.max(0, parseNumberInput(e.target.value)) })}
                  className="min-w-[7rem] max-w-[9rem]" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRegTopUp(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={addOTTopUp}><Plus className="h-3.5 w-3.5 mr-1" />Разовое пополнение</Button>
              <Button variant="outline" size="sm" onClick={addRegTopUp}><Plus className="h-3.5 w-3.5 mr-1" />Регулярное пополнение</Button>
            </div>
          </CardContent>
        </Card>

        {/* Снятия */}
        <Card className="border-destructive/40">
          <CardHeader className="pb-3 border-b border-destructive/20">
            <CardTitle className="text-base">Частичные снятия</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {oneTimeWithdrawals.map((w, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground shrink-0 w-28">Разовое</span>
                <Input type="date" value={w.date} onChange={(e) => updateOTWithdrawal(i, { date: e.target.value })}
                  className="min-w-[9rem] max-w-[11rem]" />
                <Input type="text" inputMode="numeric" placeholder="Сумма ₽"
                  value={formatNumberInput(w.amount)}
                  onChange={(e) => updateOTWithdrawal(i, { amount: Math.max(0, parseNumberInput(e.target.value)) })}
                  className="min-w-[7rem] max-w-[9rem]" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOTWithdrawal(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {regularWithdrawals.map((r, i) => (
              <div key={`rw${i}`} className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-xs text-muted-foreground shrink-0 w-28">Регулярное</span>
                <Input type="date" value={r.startDate} onChange={(e) => updateRegWithdrawal(i, { startDate: e.target.value })}
                  className="min-w-[9rem] max-w-[11rem]" />
                <Select value={r.period} onValueChange={(v) => updateRegWithdrawal(i, { period: v as any })}>
                  <SelectTrigger className="min-w-[9rem] max-w-[11rem]"><SelectValue /></SelectTrigger>
                  <SelectContent>{PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="text" inputMode="numeric" placeholder="Сумма ₽"
                  value={formatNumberInput(r.amount)}
                  onChange={(e) => updateRegWithdrawal(i, { amount: Math.max(0, parseNumberInput(e.target.value)) })}
                  className="min-w-[7rem] max-w-[9rem]" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRegWithdrawal(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={addOTWithdrawal}><Plus className="h-3.5 w-3.5 mr-1" />Разовое снятие</Button>
              <Button variant="outline" size="sm" onClick={addRegWithdrawal}><Plus className="h-3.5 w-3.5 mr-1" />Регулярное снятие</Button>
            </div>
            {/* Минимальный остаток */}
            <div className="border-t border-border pt-3 space-y-1.5 max-w-xs">
              <Label htmlFor="minbal">Минимальный остаток, ₽</Label>
              <Input id="minbal" type="text" inputMode="numeric"
                value={formatNumberInput(minimumBalance)}
                onChange={(e) => setMinimumBalance(Math.max(0, parseNumberInput(e.target.value)))} />
              <p className="text-[11px] text-muted-foreground">Снятия ниже этой суммы блокируются</p>
            </div>
          </CardContent>
        </Card>

        {/* Налог */}
        <Card>
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-base">Налог</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">НДФЛ с дохода по вкладам (ст. 214.2 НК РФ, 259-ФЗ)</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="keyrate">Ключевая ставка ЦБ, %</Label>
                <Input id="keyrate" type="number" value={keyRate}
                  onChange={(e) => setKeyRate(Math.max(0, +e.target.value))} min={0} step={0.25} />
                <p className="text-[11px] text-muted-foreground">Используется для необл. порога: 1 000 000 ₽ × КС%</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ndfl">Ставка НДФЛ, %</Label>
                <Input id="ndfl" type="number" value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, +e.target.value))} min={0} max={100} step={1} />
                <p className="text-[11px] text-muted-foreground">13% — резиденты, 30% — нерезиденты</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Результат</CardTitle>
                <CopyButton
                  value={`Итого к получению: ${fmt(result.totalReturn)} ₽\nПроценты: ${fmt(result.totalInterest)} ₽\nЧистый доход: ${fmt(result.netIncome)} ₽\nНДФЛ: ${fmt(result.totalTax)} ₽\nЭфф. ставка: ${result.effectiveRatePercent}%`}
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
                  <p className="text-xs text-muted-foreground mb-0.5">Итого к получению (с процентами)</p>
                  <p className="text-3xl font-bold tracking-tight tabular-nums">{fmt(result.totalReturn)} ₽</p>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-[hsl(var(--success)/0.08)] border border-[hsl(var(--success)/0.2)] p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Проценты</p>
                  <p className="text-base font-bold tabular-nums text-[hsl(var(--success))]">+{fmt(result.totalInterest)} ₽</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">начисленные</p>
                </div>
                <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Эфф. ставка</p>
                  <p className="text-base font-bold tabular-nums">{result.effectiveRatePercent}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">годовых</p>
                </div>
                <div className="rounded-lg bg-destructive/8 border border-destructive/15 p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">НДФЛ {taxRate}%</p>
                  <p className="text-base font-bold tabular-nums text-destructive">−{fmt(result.totalTax)} ₽</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">налог</p>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">Чистый доход</p>
                  <p className="text-base font-bold tabular-nums text-primary">{fmt(result.netIncome)} ₽</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">после налога</p>
                </div>
              </div>

              {/* Extra flows */}
              {(hasTopUps || hasWithdrawals) && (
                <div className="rounded-lg bg-muted/30 border border-border p-3.5 space-y-2 text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Движение средств</p>
                  {hasTopUps && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Всего пополнений</span>
                      <span className="font-medium tabular-nums text-[hsl(var(--success))]">+{fmt(result.totalTopUps - principal)} ₽</span>
                    </div>
                  )}
                  {hasWithdrawals && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Всего снятий</span>
                      <span className="font-medium tabular-nums text-destructive">−{fmt(result.totalWithdrawals)} ₽</span>
                    </div>
                  )}
                  {result.blockedWithdrawals.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Заблокировано снятий</span>
                      <span className="font-medium tabular-nums text-destructive">{result.blockedWithdrawals.length} шт.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tax by year */}
              {result.taxRows.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Налог по годам</p>
                    <button
                      type="button"
                      onClick={() => setTaxInfoOpen(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Как рассчитывается налог?"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </button>
                  </div>

                  <Dialog open={taxInfoOpen} onOpenChange={setTaxInfoOpen}>
                    <DialogContent className="max-w-lg flex flex-col max-h-[85vh] p-0 gap-0">
                      <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                        <DialogTitle>Как считается налог на доход по вкладам</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4 text-sm">
                        <p className="text-muted-foreground">С 2023 года налог на процентный доход по вкладам физлиц считается по новым правилам (ст. 214.2 НК РФ в редакции 259-ФЗ). Ранее действовавшие правила (налог при превышении ставкой вклада ключевой + 5%) отменены.</p>

                        <div>
                          <p className="font-medium mb-2">Как считается сейчас</p>
                          <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                            <li>Ставка НДФЛ: <strong className="text-foreground">13%</strong> с дохода до 2 400 000 ₽ в год и <strong className="text-foreground">15%</strong> сверх этой суммы (п. 1 ст. 224 НК РФ).</li>
                            <li>Доходы по всем вкладам и счетам суммируются. Необлагаемый лимит применяется к совокупному доходу за год.</li>
                            <li>Необлагаемая сумма: <strong className="text-foreground">1 000 000 ₽ × КС</strong>, где КС — максимальная ключевая ставка ЦБ РФ на 1-е число каждого месяца года.</li>
                            <li>Налог считает ФНС; уплата — до 1 декабря года, следующего за расчётным.</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium mb-1">Пример расчёта</p>
                          <p className="text-muted-foreground">Марина в 2025 г.: вклад 800 000 ₽ под 14% и 500 000 ₽ под 11%. КС = 18%. Необлагаемый доход: 180 000 ₽. Совокупный доход: 167 000 ₽ → <strong className="text-foreground">НДФЛ = 0 ₽</strong>.</p>
                        </div>

                        <div>
                          <p className="font-medium mb-1">Перенос вычета (259-ФЗ)</p>
                          <p className="text-muted-foreground">Для вкладов от 15 мес. с выплатой в конце срока неиспользованный вычет переносится на год выплаты. При периодической капитализации — вычет каждый год отдельно.</p>
                        </div>

                        <div>
                          <p className="font-medium mb-2">Вопросы и ответы</p>
                          <dl className="space-y-3 text-muted-foreground">
                            <div><dt className="font-medium text-foreground">Нужно ли подавать декларацию?</dt><dd className="mt-0.5">Нет. Банки сами передают данные в ФНС.</dd></div>
                            <div><dt className="font-medium text-foreground">Валютные вклады?</dt><dd className="mt-0.5">Да, доход пересчитывается в рубли по курсу ЦБ на дату получения.</dd></div>
                            <div><dt className="font-medium text-foreground">Доход меньше лимита?</dt><dd className="mt-0.5">Налог не возникает. При выплате в конце срока вычет можно перенести.</dd></div>
                            <div><dt className="font-medium text-foreground">Откуда берётся ставка ЦБ?</dt><dd className="mt-0.5">Используются типовые значения по годам. Для точного расчёта сверяйтесь с данными ЦБ РФ.</dd></div>
                          </dl>
                        </div>
                      </div>
                      <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
                        <Button variant="outline" onClick={() => setTaxInfoOpen(false)}>Закрыть</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Год</TableHead>
                          <TableHead className="text-right">Доход</TableHead>
                          <TableHead className="text-right">Вычет</TableHead>
                          <TableHead className="text-right">Облаг.</TableHead>
                          <TableHead className="text-right">НДФЛ</TableHead>
                          <TableHead className="text-right">Уплатить до</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.taxRows.map((row) => (
                          <TableRow key={row.year}>
                            <TableCell className="font-medium">{row.year}</TableCell>
                            <TableCell className="text-right tabular-nums">{fmt(row.income)}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(row.deduction)}</TableCell>
                            <TableCell className="text-right tabular-nums">{fmt(row.taxableIncome)}</TableCell>
                            <TableCell className={`text-right tabular-nums font-medium ${row.taxAmount > 0 ? "text-destructive" : ""}`}>
                              {fmt(row.taxAmount)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground text-xs">{fmtDate(row.payByDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={4} className="font-semibold">Итого НДФЛ</TableCell>
                          <TableCell className={`text-right tabular-nums font-bold ${result.totalTax > 0 ? "text-destructive" : ""}`}>
                            {fmt(result.totalTax)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule */}
        {result && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">График событий</CardTitle>
                <button onClick={() => setShowSchedule(!showSchedule)} className="text-sm text-primary hover:text-primary/80 transition-colors">
                  {showSchedule ? "Скрыть" : "Показать"}
                </button>
              </div>
            </CardHeader>
            {showSchedule && (
              <CardContent className="px-0 pb-2 pt-0">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Дата</TableHead>
                        <TableHead>Событие</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead className="text-right pr-4">Баланс</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.schedule.filter(r => r.eventType !== "end").map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs tabular-nums pl-4 py-2">{fmtDate(r.date)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground py-2">{EVENT_LABELS[r.eventType] ?? r.label}</TableCell>
                          <TableCell className={`text-right tabular-nums text-xs py-2 ${r.amountDelta > 0 ? "text-[hsl(var(--success))]" : r.amountDelta < 0 ? "text-destructive" : ""}`}>
                            {r.amountDelta !== 0 ? `${r.amountDelta > 0 ? "+" : ""}${fmt(r.amountDelta)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-xs py-2 text-[hsl(var(--success))]">
                            {r.interestAccrued > 0 ? `+${fmt(r.interestAccrued)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-xs font-medium py-2 pr-4">{fmt(r.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold pl-4">Итого</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-[hsl(var(--success))]">+{fmt(result.totalInterest)}</TableCell>
                        <TableCell />
                        <TableCell className="text-right tabular-nums font-semibold pr-4">{fmt(result.finalBalance)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Необлагаемый порог</strong> — 1 000 000 ₽ × максимальная ключевая ставка ЦБ на 1-е число каждого месяца расчётного года (ст. 214.2 НК РФ, 259-ФЗ).
            </p>
            <p>
              Неиспользованный вычет переносится на год выплаты для вкладов <strong className="text-foreground">от 15 месяцев</strong> с выплатой процентов в конце срока.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
