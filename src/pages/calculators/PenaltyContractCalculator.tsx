import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  type PenaltyContractInput,
  type RateType,
  type ExcludedPeriod,
  type PartialPayment,
  type AdditionalDebt,
  calcPenaltyContract,
} from "@/lib/calculators/penalty-contract";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { AlertTriangle, Calendar, Percent, Coins, ChevronDown, Plus, Trash2 } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtInt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

const RATE_TYPES: { id: RateType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "percent_per_day", label: "% в день", icon: <Percent className="h-4 w-4" />, desc: "Процент от суммы за каждый день" },
  { id: "percent_per_year", label: "% годовых", icon: <Calendar className="h-4 w-4" />, desc: "Годовая процентная ставка" },
  { id: "fixed_per_day", label: "₽ в день", icon: <Coins className="h-4 w-4" />, desc: "Фиксированная сумма в день" },
];

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };

export default function PenaltyContractCalculatorPage() {
  const [sum, setSum] = useState(500000);
  const [rateType, setRateType] = useState<RateType>("percent_per_day");
  const [rateValue, setRateValue] = useState(0.1);
  const [startDate, setStartDate] = useState(monthAgo);
  const [endDate, setEndDate] = useState(today);
  const [workdaysOnly, setWorkdaysOnly] = useState(false);

  // Advanced
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [excludedPeriods, setExcludedPeriods] = useState<ExcludedPeriod[]>([]);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [additionalDebts, setAdditionalDebts] = useState<AdditionalDebt[]>([]);

  const advancedCount = excludedPeriods.length + partialPayments.length + additionalDebts.length;

  const result = useMemo(() => {
    const input: PenaltyContractInput = {
      sum, startDate, endDate, workdaysOnly,
      excludedPeriods, rateType, rateValue,
      partialPayments, additionalDebts, showPerDebt: false,
    };
    return calcPenaltyContract(input);
  }, [sum, startDate, endDate, workdaysOnly, rateType, rateValue, excludedPeriods, partialPayments, additionalDebts]);

  const totalWithDebt = sum + (result?.totalPenaltyCapped ?? 0);
  const penaltyShare = totalWithDebt > 0
    ? Math.round((result?.totalPenaltyCapped ?? 0) / totalWithDebt * 100)
    : 0;

  const rateLabel = rateType === "percent_per_year" ? "% годовых"
    : rateType === "percent_per_day" ? "% в день"
    : "₽ в день";

  // Helpers for list mutations
  const addExcluded = () => setExcludedPeriods(p => [...p, { from: monthAgo(), to: today() }]);
  const removeExcluded = (i: number) => setExcludedPeriods(p => p.filter((_, idx) => idx !== i));
  const updateExcluded = (i: number, patch: Partial<ExcludedPeriod>) =>
    setExcludedPeriods(p => p.map((item, idx) => idx === i ? { ...item, ...patch } : item));

  const addPayment = () => setPartialPayments(p => [...p, { date: today(), amount: 0 }]);
  const removePayment = (i: number) => setPartialPayments(p => p.filter((_, idx) => idx !== i));
  const updatePayment = (i: number, patch: Partial<PartialPayment>) =>
    setPartialPayments(p => p.map((item, idx) => idx === i ? { ...item, ...patch } : item));

  const addDebt = () => setAdditionalDebts(p => [...p, { date: today(), amount: 0 }]);
  const removeDebt = (i: number) => setAdditionalDebts(p => p.filter((_, idx) => idx !== i));
  const updateDebt = (i: number, patch: Partial<AdditionalDebt>) =>
    setAdditionalDebts(p => p.map((item, idx) => idx === i ? { ...item, ...patch } : item));

  return (
    <CalculatorLayout calculatorId="penalty-contract" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Неустойка по договору</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт пени и штрафа за нарушение обязательств по договору
          </p>
        </div>

        {/* ── Parameters bar ── */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <Label className="text-xs text-muted-foreground">Сумма задолженности, ₽</Label>
                <Input
                  type="text" inputMode="numeric"
                  value={formatNumberInput(sum)}
                  onChange={(e) => setSum(Math.max(0, parseNumberInput(e.target.value)))}
                  className="text-base font-semibold tabular-nums h-10"
                />
              </div>
              <div className="space-y-1.5 w-36 shrink-0">
                <Label className="text-xs text-muted-foreground">Размер ставки ({rateLabel})</Label>
                <Input type="number" step={0.01} min={0} value={rateValue}
                  onChange={(e) => setRateValue(Math.max(0, Number(e.target.value) || 0))}
                  className="h-10" />
              </div>
              <div className="space-y-1.5 w-36 shrink-0">
                <Label className="text-xs text-muted-foreground">С даты</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5 w-36 shrink-0">
                <Label className="text-xs text-muted-foreground">По дату</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Rate type cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RATE_TYPES.map((t) => (
            <button key={t.id} onClick={() => setRateType(t.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                rateType === t.id ? "border-primary bg-primary/8 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}>
              <div className={cn("mt-0.5 rounded-md p-1.5", rateType === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                {t.icon}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", rateType === t.id && "text-primary")}>{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Day counting toggle ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Учёт дней:</span>
          {([
            [false, "Календарные"],
            [true, "Рабочие"],
          ] as const).map(([val, label]) => (
            <button key={String(val)} onClick={() => setWorkdaysOnly(val)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                workdaysOnly === val
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Advanced params ── */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
              <span className="flex items-center gap-2">
                Дополнительные параметры
                {advancedCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">{advancedCount}</Badge>
                )}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-4">

            {/* Excluded periods */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Исключаемые периоды</CardTitle>
                  <Button size="sm" variant="outline" onClick={addExcluded} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {excludedPeriods.length === 0 && (
                  <p className="text-xs text-muted-foreground">Периоды не добавлены</p>
                )}
                {excludedPeriods.map((ep, i) => (
                  <div key={i} className="flex items-end gap-2 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-[120px]">
                      <Label className="text-xs text-muted-foreground">С</Label>
                      <Input type="date" value={ep.from} onChange={(e) => updateExcluded(i, { from: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[120px]">
                      <Label className="text-xs text-muted-foreground">По</Label>
                      <Input type="date" value={ep.to} onChange={(e) => updateExcluded(i, { to: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[140px]">
                      <Label className="text-xs text-muted-foreground">Комментарий</Label>
                      <Input value={ep.comment ?? ""} placeholder="Необязательно"
                        onChange={(e) => updateExcluded(i, { comment: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeExcluded(i)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Partial payments */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Частичные оплаты</CardTitle>
                  <Button size="sm" variant="outline" onClick={addPayment} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {partialPayments.length === 0 && (
                  <p className="text-xs text-muted-foreground">Оплаты не добавлены</p>
                )}
                {partialPayments.map((pp, i) => (
                  <div key={i} className="flex items-end gap-2 flex-wrap">
                    <div className="space-y-1 w-36 shrink-0">
                      <Label className="text-xs text-muted-foreground">Дата</Label>
                      <Input type="date" value={pp.date} onChange={(e) => updatePayment(i, { date: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[120px]">
                      <Label className="text-xs text-muted-foreground">Сумма, ₽</Label>
                      <Input type="text" inputMode="numeric"
                        value={formatNumberInput(pp.amount)}
                        onChange={(e) => updatePayment(i, { amount: Math.max(0, parseNumberInput(e.target.value)) })}
                        className="h-8 text-sm tabular-nums" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[140px]">
                      <Label className="text-xs text-muted-foreground">Комментарий</Label>
                      <Input value={pp.comment ?? ""} placeholder="Необязательно"
                        onChange={(e) => updatePayment(i, { comment: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removePayment(i)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional debts */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Дополнительные задолженности</CardTitle>
                  <Button size="sm" variant="outline" onClick={addDebt} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {additionalDebts.length === 0 && (
                  <p className="text-xs text-muted-foreground">Задолженности не добавлены</p>
                )}
                {additionalDebts.map((ad, i) => (
                  <div key={i} className="flex items-end gap-2 flex-wrap">
                    <div className="space-y-1 w-36 shrink-0">
                      <Label className="text-xs text-muted-foreground">Дата</Label>
                      <Input type="date" value={ad.date} onChange={(e) => updateDebt(i, { date: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[120px]">
                      <Label className="text-xs text-muted-foreground">Сумма, ₽</Label>
                      <Input type="text" inputMode="numeric"
                        value={formatNumberInput(ad.amount)}
                        onChange={(e) => updateDebt(i, { amount: Math.max(0, parseNumberInput(e.target.value)) })}
                        className="h-8 text-sm tabular-nums" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[140px]">
                      <Label className="text-xs text-muted-foreground">Комментарий</Label>
                      <Input value={ad.comment ?? ""} placeholder="Необязательно"
                        onChange={(e) => updateDebt(i, { comment: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeDebt(i)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* ── Results ── */}
        {result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Задолженность</p>
                <p className="text-2xl font-bold tabular-nums">{fmtInt(sum)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Неустойка</p>
                <p className="text-2xl font-bold tabular-nums text-destructive">+{fmt(result.totalPenaltyCapped)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Итого к оплате</p>
                <p className="text-2xl font-bold tabular-nums">{fmt(result.totalDebtAndPenalty)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Долг — {100 - penaltyShare}%</span>
                <span>Неустойка — {penaltyShare}%</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="bg-primary/50 transition-all duration-500" style={{ width: `${100 - penaltyShare}%` }} />
                <div className="bg-destructive/80 transition-all duration-500" style={{ width: `${penaltyShare}%` }} />
              </div>
            </div>

            {result.breakdown.filter(b => !b.isPayment && !b.isAdditionalDebt).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Расчёт по периодам</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Период</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Дней</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Долг</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Формула</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Неустойка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.breakdown
                          .filter(b => !b.isPayment && !b.isAdditionalDebt)
                          .map((b, i) => (
                            <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10", b.isExcluded && "opacity-40")}>
                              <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap tabular-nums">{b.periodLabel}</td>
                              <td className="px-4 py-2.5 tabular-nums">{b.days}</td>
                              <td className="px-4 py-2.5 tabular-nums text-xs whitespace-nowrap">{b.amountLabel}</td>
                              <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                                {b.isExcluded ? <Badge variant="outline" className="text-xs">исключён</Badge> : b.formula || "—"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                                {b.isExcluded ? "—" : `${fmt(b.penalty)} ₽`}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/20">
                          <td colSpan={4} className="px-4 py-2.5 text-sm font-medium">Итого неустойка</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-bold text-destructive">
                            {fmt(result.totalPenaltyCapped)} ₽
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Введите параметры для расчёта</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">О расчёте</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>Неустойка по договору начисляется за каждый день просрочки исполнения обязательств. Размер определяется условиями договора.</p>
            <p>Поддерживаются три типа ставок: процент годовых, процент в день, фиксированная сумма в день. Можно учитывать только рабочие дни по производственному календарю РФ.</p>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
