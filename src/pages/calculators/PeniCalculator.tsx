import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type PeniCalculationType,
  type TaxPayerType,
  getKeyRateOnDate,
  daysBetween,
  calculateDailyPeni,
  getPeniFraction,
} from "@/lib/calculators/peni";
import keyRateData from "@/data/key-rate-ru.json";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

export default function PeniCalculatorPage() {
  const [debt, setDebt] = useState(100000);
  const [calcType, setCalcType] = useState<PeniCalculationType>("tax");
  const [payerType, setPayerType] = useState<TaxPayerType>("individual");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  const result = useMemo(() => {
    if (debt <= 0 || !dateFrom || !dateTo || dateFrom >= dateTo) return null;

    const rates = keyRateData.rates;
    const totalDays = daysBetween(dateFrom, dateTo);
    let totalPeni = 0;
    const breakdown: { date: string; keyRate: number; fraction: number; dailyPeni: number }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(dateFrom);
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().slice(0, 10);
      const keyRate = getKeyRateOnDate(rates, dateStr);
      const fraction = getPeniFraction(calcType, payerType, i + 1);
      const daily = calculateDailyPeni(debt, keyRate, fraction);
      totalPeni += daily;

      if (breakdown.length === 0 || breakdown[breakdown.length - 1].keyRate !== keyRate || breakdown[breakdown.length - 1].fraction !== fraction) {
        breakdown.push({ date: dateStr, keyRate, fraction, dailyPeni: daily });
      }
    }

    return {
      totalDays,
      totalPeni: Math.round(totalPeni * 100) / 100,
      effectiveRate: debt > 0 ? Math.round((totalPeni / debt) * 10000) / 100 : 0,
      breakdown,
    };
  }, [debt, calcType, payerType, dateFrom, dateTo]);

  const fmt = (v: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  const typeLabels: Record<PeniCalculationType, string> = {
    tax: "Налоги и взносы",
    utilities: "ЖКХ",
    salary: "Задержка зарплаты",
  };

  return (
    <CalculatorLayout calculatorId="peni" categoryName="Налоги" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор пеней</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт пеней по налогам, ЖКХ и задержке зарплаты по ключевой ставке ЦБ РФ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Сумма задолженности (₽)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(debt)}
                  onChange={(e) => setDebt(Math.max(0, parseNumberInput(e.target.value)))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Тип расчёта</Label>
                <Select value={calcType} onValueChange={(v) => setCalcType(v as PeniCalculationType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(typeLabels) as PeniCalculationType[]).map((k) => (
                      <SelectItem key={k} value={k}>{typeLabels[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {calcType === "tax" && (
                <div className="space-y-1.5">
                  <Label>Плательщик</Label>
                  <div className="flex gap-2">
                    <Badge variant={payerType === "individual" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setPayerType("individual")}>
                      Физлицо / ИП
                    </Badge>
                    <Badge variant={payerType === "legal" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setPayerType("legal")}>
                      Юрлицо
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Период просрочки</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">С</span>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">По</span>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Задолженность</p>
                        <p className="text-xl font-bold">{fmt(debt)} ₽</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Пени за {result.totalDays} дн.
                        </p>
                        <p className="text-xl font-bold text-destructive">{fmt(result.totalPeni)} ₽</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Итого к оплате</p>
                        <p className="text-xl font-bold">{fmt(debt + result.totalPeni)} ₽</p>
                      </div>
                    </div>

                    {result.breakdown.length > 0 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">Периоды расчёта:</p>
                        {result.breakdown.map((b, i) => (
                          <div key={i} className="flex justify-between py-1 border-b border-border last:border-0">
                            <span className="text-muted-foreground">
                              с {b.date} — ставка {b.keyRate}%, доля {Math.round(b.fraction * 1000)}/1000
                            </span>
                            <span>{fmt(b.dailyPeni)} ₽/день</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Введите параметры для расчёта</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Как считаются пени</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p><strong>Налоги (ст. 75 НК РФ):</strong> Физлица и ИП — 1/300 ключевой ставки. Юрлица — первые 30 дней 1/300, далее 1/150.</p>
                <p><strong>ЖКХ:</strong> Первые 30 дней — без пеней. С 31 по 90 день — 1/300. С 91 дня — 1/130 ключевой ставки.</p>
                <p><strong>Задержка зарплаты (ст. 236 ТК РФ):</strong> 1/150 ключевой ставки за каждый день просрочки.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
