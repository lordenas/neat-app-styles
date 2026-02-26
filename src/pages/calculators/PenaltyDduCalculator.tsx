import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  type DduPenaltyInput,
  type DduPayerType,
  type ApplyRateType,
  calcDduPenalty,
  DDU_MORATORIUM_PERIODS,
} from "@/lib/calculators/ddu-penalty";
import type { KeyRateEntry } from "@/lib/calculators/peni";
import keyRateData from "@/data/key-rate-ru.json";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { AlertTriangle, User, Building2, TrendingDown, CalendarX } from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
const fmtInt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

const APPLY_RATE_OPTIONS: { id: ApplyRateType; label: string; desc: string }[] = [
  { id: "by_period", label: "По периодам", desc: "Ставка меняется вместе с ключевой ставкой ЦБ" },
  { id: "on_transfer_day", label: "На дату передачи", desc: "Ставка фиксируется на день фактической передачи" },
  { id: "on_obligation_day", label: "На дату ДДУ", desc: "Ставка фиксируется на дату обязательства по договору" },
];

export default function PenaltyDduCalculatorPage() {
  const [price, setPrice] = useState(5000000);
  const [contractTransferDate, setContractTransferDate] = useState("2023-06-30");
  const [actualTransferDate, setActualTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doNotShiftDeadline, setDoNotShiftDeadline] = useState(false);
  const [applyRate, setApplyRate] = useState<ApplyRateType>("by_period");
  const [payerType, setPayerType] = useState<DduPayerType>("individual");

  const rates = keyRateData.rates as KeyRateEntry[];

  const result = useMemo(() => {
    const input: DduPenaltyInput = { price, contractTransferDate, actualTransferDate, doNotShiftDeadline, applyRate, payerType };
    return calcDduPenalty(input, rates);
  }, [price, contractTransferDate, actualTransferDate, doNotShiftDeadline, applyRate, payerType, rates]);

  const totalWithDebt = price + (result?.totalPenalty ?? 0);
  const penaltyShare = totalWithDebt > 0 ? Math.round((result?.totalPenalty ?? 0) / totalWithDebt * 100) : 0;

  const totalDays = result?.breakdown.reduce((acc, b) => acc + b.days, 0) ?? 0;

  return (
    <CalculatorLayout calculatorId="penalty-ddu" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Неустойка по ДДУ (214-ФЗ)</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт неустойки за просрочку передачи квартиры по договору долевого участия
          </p>
        </div>

        {/* ── Parameters bar ── */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <Label className="text-xs text-muted-foreground">Цена по договору, ₽</Label>
                <Input
                  type="text" inputMode="numeric"
                  value={formatNumberInput(price)}
                  onChange={(e) => setPrice(Math.max(0, parseNumberInput(e.target.value)))}
                  className="text-base font-semibold tabular-nums h-10"
                />
              </div>
              <div className="space-y-1.5 w-40 shrink-0">
                <Label className="text-xs text-muted-foreground">Дата передачи по ДДУ</Label>
                <Input type="date" value={contractTransferDate}
                  onChange={(e) => setContractTransferDate(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5 w-40 shrink-0">
                <Label className="text-xs text-muted-foreground">Фактическая передача</Label>
                <Input type="date" value={actualTransferDate}
                  onChange={(e) => setActualTransferDate(e.target.value)} className="h-10" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Checkbox id="no-shift" checked={doNotShiftDeadline}
                onCheckedChange={(v) => setDoNotShiftDeadline(!!v)} />
              <Label htmlFor="no-shift" className="text-sm text-muted-foreground cursor-pointer">
                Не переносить срок (ст. 193 ГК РФ)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* ── Payer type ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Плательщик:</span>
          {([
            ["individual", "Физлицо (1/150)", <User className="h-3.5 w-3.5" />],
            ["legal", "Юрлицо (1/300)", <Building2 className="h-3.5 w-3.5" />],
          ] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setPayerType(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                payerType === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ── Apply rate cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {APPLY_RATE_OPTIONS.map((t) => (
            <button key={t.id} onClick={() => setApplyRate(t.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                applyRate === t.id ? "border-primary bg-primary/8 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}>
              <div className={cn("mt-0.5 rounded-md p-1.5", applyRate === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                <TrendingDown className="h-4 w-4" />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", applyRate === t.id && "text-primary")}>{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Results ── */}
        {result ? (
          <div className="space-y-4">
            {/* Hero stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Цена договора</p>
                <p className="text-2xl font-bold tabular-nums">{fmtInt(price)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Неустойка за {totalDays} дн.
                </p>
                <p className="text-2xl font-bold tabular-nums text-destructive">+{fmt(result.totalPenalty)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Начало начисления</p>
                <p className="text-lg font-bold">{result.penaltyStartDate}</p>
                <p className="text-xs text-muted-foreground">дата</p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Цена ДДУ — {100 - penaltyShare}%</span>
                <span>Неустойка — {penaltyShare}%</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="bg-primary/50 transition-all duration-500" style={{ width: `${100 - penaltyShare}%` }} />
                <div className="bg-destructive/80 transition-all duration-500" style={{ width: `${penaltyShare}%` }} />
              </div>
            </div>

            {/* Breakdown table */}
            {result.breakdown.length > 0 && (
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
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ставка ЦБ</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Формула</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Неустойка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.breakdown.map((b, i) => (
                          <tr key={i} className={cn(
                            "border-b border-border last:border-0",
                            i % 2 === 1 && !b.isMoratorium && "bg-muted/10",
                            b.isMoratorium && "bg-muted/20 opacity-60"
                          )}>
                            <td className="px-4 py-2.5 text-xs whitespace-nowrap tabular-nums text-muted-foreground">
                              <span>{b.isMoratorium
                                ? b.periodLabel
                                : b.periodLabel}
                              </span>
                              {b.comment && (
                                <p className="text-muted-foreground/60 mt-0.5 text-[11px] max-w-[220px] whitespace-normal">{b.comment}</p>
                              )}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {b.isMoratorium ? "—" : b.days}
                            </td>
                            <td className="px-4 py-2.5">
                              {b.isMoratorium ? (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <CalendarX className="h-3 w-3" /> мораторий
                                </Badge>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <Badge variant="outline">{b.ratePercent}%</Badge>
                                  {b.rateNominalPercent != null && (
                                    <span className="text-xs text-muted-foreground line-through">{b.rateNominalPercent}%</span>
                                  )}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                              {b.isMoratorium ? "—" : b.formula}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                              {b.isMoratorium ? "—" : `${fmt(b.penalty)} ₽`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border bg-muted/20">
                          <td colSpan={4} className="px-4 py-2.5 text-sm font-medium">Итого неустойка</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-bold text-destructive">
                            {fmt(result.totalPenalty)} ₽
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

        {/* Moratoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-muted-foreground" />
              Периоды мораториев
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {DDU_MORATORIUM_PERIODS.map((p, i) => (
                  <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
                    <td className="px-4 py-2.5 tabular-nums text-xs whitespace-nowrap font-medium">{p.from} – {p.to}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">О расчёте</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p><strong>214-ФЗ:</strong> Неустойка составляет 1/150 (физлица) или 1/300 (юрлица) ключевой ставки ЦБ за каждый день просрочки от цены договора.</p>
            <p>В период с 01.07.2023 по 21.03.2024 ставка ограничена 7,5% по постановлению Правительства.</p>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
