import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type PeniCalculationType,
  type TaxPayerType,
  getKeyRateOnDate,
  daysBetween,
  calculateDailyPeni,
  getPeniFraction } from
"@/lib/calculators/peni";
import keyRateData from "@/data/key-rate-ru.json";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";
import { AlertTriangle, Building2, User, Receipt, Home, Briefcase } from "lucide-react";

const CALC_TYPES: {id: PeniCalculationType;label: string;icon: React.ReactNode;desc: string;}[] = [
{ id: "tax", label: "Налоги и взносы", icon: <Receipt className="h-4 w-4" />, desc: "ст. 75 НК РФ" },
{ id: "utilities", label: "ЖКХ", icon: <Home className="h-4 w-4" />, desc: "ЖК РФ" },
{ id: "salary", label: "Задержка зарплаты", icon: <Briefcase className="h-4 w-4" />, desc: "ст. 236 ТК РФ" }];


const FRACTION_LABELS: Record<number, string> = {
  [1 / 300]: "1/300",
  [1 / 150]: "1/150",
  [1 / 130]: "1/130"
};

export default function PeniCalculatorPage() {
  const [debt, setDebt] = useState(100000);
  const [calcType, setCalcType] = useState<PeniCalculationType>("tax");
  const [payerType, setPayerType] = useState<TaxPayerType>("individual");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();d.setMonth(d.getMonth() - 1);return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  const result = useMemo(() => {
    if (debt <= 0 || !dateFrom || !dateTo || dateFrom >= dateTo) return null;
    const rates = keyRateData.rates;
    const totalDays = daysBetween(dateFrom, dateTo);
    let totalPeni = 0;
    const breakdown: {dateFrom: string;dateTo: string;keyRate: number;fraction: number;dailyPeni: number;days: number;}[] = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(dateFrom);
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().slice(0, 10);
      const keyRate = getKeyRateOnDate(rates, dateStr);
      const fraction = getPeniFraction(calcType, payerType, i + 1);
      const daily = calculateDailyPeni(debt, keyRate, fraction);
      totalPeni += daily;

      const last = breakdown[breakdown.length - 1];
      if (!last || last.keyRate !== keyRate || last.fraction !== fraction) {
        breakdown.push({ dateFrom: dateStr, dateTo: dateStr, keyRate, fraction, dailyPeni: daily, days: 1 });
      } else {
        last.dateTo = dateStr;
        last.days++;
      }
    }

    return {
      totalDays,
      totalPeni: Math.round(totalPeni * 100) / 100,
      breakdown
    };
  }, [debt, calcType, payerType, dateFrom, dateTo]);

  const fmt = (v: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const fmtInt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

  const totalWithDebt = debt + (result?.totalPeni ?? 0);
  const peniShare = totalWithDebt > 0 ? Math.round((result?.totalPeni ?? 0) / totalWithDebt * 100) : 0;

  const HOW_IT_WORKS: Record<PeniCalculationType, string> = {
    tax: "Физлица и ИП — 1/300 ключевой ставки за каждый день. Юрлица — первые 30 дней 1/300, далее 1/150.",
    utilities: "Первые 30 дней — без пеней. С 31 по 90 день — 1/300 ключевой ставки. С 91 дня — 1/130.",
    salary: "1/150 ключевой ставки за каждый день задержки с первого дня просрочки."
  };

  return (
    <CalculatorLayout calculatorId="peni" categoryName="Налоги" categoryPath="/categories/taxes">
      <div className="space-y-6">
        






        {/* ── Parameters bar ── */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">

              {/* Debt */}
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <Label className="text-xs text-muted-foreground">Сумма задолженности, ₽</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(debt)}
                  onChange={(e) => setDebt(Math.max(0, parseNumberInput(e.target.value)))}
                  className="text-base font-semibold tabular-nums h-10" />

              </div>

              {/* Date from */}
              <div className="space-y-1.5 w-36 shrink-0">
                <Label className="text-xs text-muted-foreground">С даты</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10" />
              </div>

              {/* Date to */}
              <div className="space-y-1.5 w-36 shrink-0">
                <Label className="text-xs text-muted-foreground">По дату</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Calc type ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CALC_TYPES.map((t) =>
          <button
            key={t.id}
            onClick={() => setCalcType(t.id)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
              calcType === t.id ?
              "border-primary bg-primary/8 shadow-sm" :
              "border-border hover:border-primary/40 hover:bg-muted/30"
            )}>

              <div className={cn(
              "mt-0.5 rounded-md p-1.5",
              calcType === t.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            )}>
                {t.icon}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", calcType === t.id && "text-primary")}>{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          )}
        </div>

        {/* Payer type (tax only) */}
        {calcType === "tax" &&
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Плательщик:</span>
            {([["individual", "Физлицо / ИП", <User className="h-3.5 w-3.5" />], ["legal", "Юрлицо", <Building2 className="h-3.5 w-3.5" />]] as const).map(([id, label, icon]) =>
          <button
            key={id}
            onClick={() => setPayerType(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
              payerType === id ?
              "border-primary bg-primary/10 text-primary" :
              "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}>

                {icon}{label}
              </button>
          )}
          </div>
        }

        {/* ── Results ── */}
        {result ?
        <div className="space-y-4">
            {/* Hero stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Задолженность</p>
                <p className="text-2xl font-bold tabular-nums">{fmtInt(debt)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/8 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Пени за {result.totalDays} дн.
                </p>
                <p className="text-2xl font-bold tabular-nums text-destructive">+{fmt(result.totalPeni)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Итого к оплате</p>
                <p className="text-2xl font-bold tabular-nums">{fmt(totalWithDebt)}</p>
                <p className="text-xs text-muted-foreground">₽</p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Долг — {100 - peniShare}%</span>
                <span>Пени — {peniShare}%</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="bg-primary/50 transition-all duration-500" style={{ width: `${100 - peniShare}%` }} />
                <div className="bg-destructive/80 transition-all duration-500" style={{ width: `${peniShare}%` }} />
              </div>
            </div>

            {/* Breakdown table */}
            {result.breakdown.length > 0 &&
          <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Периоды расчёта</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Период</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Дней</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ставка ЦБ</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Доля</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Пени/день</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Итого</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((b, i) =>
                  <tr key={i} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-muted/10")}>
                          <td className="px-4 py-2.5 tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                            {b.dateFrom === b.dateTo ? b.dateFrom : `${b.dateFrom} — ${b.dateTo}`}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums">{b.days}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline">{b.keyRate}%</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {b.fraction === 0 ? "—" : FRACTION_LABELS[b.fraction] ?? b.fraction.toFixed(4)}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {b.fraction === 0 ? "—" : `${fmt(b.dailyPeni)} ₽`}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                            {b.fraction === 0 ? "—" : `${fmt(b.dailyPeni * b.days)} ₽`}
                          </td>
                        </tr>
                  )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-muted/20">
                        <td colSpan={5} className="px-4 py-2.5 text-sm font-medium">Итого пеней</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-bold text-destructive">{fmt(result.totalPeni)} ₽</td>
                      </tr>
                    </tfoot>
                  </table>
                </CardContent>
              </Card>
          }
          </div> :

        <Card>
            <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Введите параметры для расчёта</p>
            </CardContent>
          </Card>
        }

        {/* How it works */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Как считаются пени</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>{HOW_IT_WORKS[calcType]}</p>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>);

}