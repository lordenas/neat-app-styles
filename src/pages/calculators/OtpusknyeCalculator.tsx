import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { calcOtpusknye, type ExcludedPeriod } from "@/lib/calculators/otpusknye";

export default function OtpusknyeCalculator() {
  const [totalEarnings, setTotalEarnings] = useState(720000);
  const [fullMonths, setFullMonths] = useState(10);
  const [vacationDays, setVacationDays] = useState(28);
  const [partialMonths, setPartialMonths] = useState<ExcludedPeriod[]>([
    { excludedDays: 10, totalDaysInMonth: 31 },
    { excludedDays: 5, totalDaysInMonth: 30 },
  ]);

  const addPartial = () => setPartialMonths([...partialMonths, { excludedDays: 0, totalDaysInMonth: 30 }]);
  const removePartial = (i: number) => setPartialMonths(partialMonths.filter((_, idx) => idx !== i));
  const updatePartial = (i: number, field: keyof ExcludedPeriod, val: number) => {
    const copy = [...partialMonths];
    copy[i] = { ...copy[i], [field]: val };
    setPartialMonths(copy);
  };

  const result = calcOtpusknye({ totalEarnings, fullMonths, partialMonths, vacationDays });
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="otpusknye" categoryName="Зарплатные" categoryPath="/#salary">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Расчётный период</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="earn">Заработок за 12 мес. (₽)</Label>
                  <Input id="earn" type="number" value={totalEarnings} onChange={(e) => setTotalEarnings(+e.target.value)} min={0} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fm">Полных месяцев</Label>
                  <Input id="fm" type="number" value={fullMonths} onChange={(e) => setFullMonths(+e.target.value)} min={0} max={12} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vd">Дни отпуска</Label>
                  <Input id="vd" type="number" value={vacationDays} onChange={(e) => setVacationDays(+e.target.value)} min={1} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Неполные месяцы</CardTitle>
                <Button variant="outline" size="sm" onClick={addPartial}><Plus className="h-4 w-4 mr-1" />Добавить</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {partialMonths.length === 0 && <p className="text-sm text-muted-foreground">Нет неполных месяцев</p>}
              {partialMonths.map((pm, i) => (
                <div key={i} className="flex items-end gap-3">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Пропущено дней</Label>
                    <Input type="number" value={pm.excludedDays} onChange={(e) => updatePartial(i, "excludedDays", +e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Дней в месяце</Label>
                    <Input type="number" value={pm.totalDaysInMonth} onChange={(e) => updatePartial(i, "totalDaysInMonth", +e.target.value)} min={28} max={31} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removePartial(i)} className="shrink-0">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Отпускные</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.vacationPay)} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">до вычета НДФЛ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Детали</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>СДЗ</span><Badge variant="outline">{fmt(result.avgDailyPay)} ₽</Badge></div>
              <div className="flex justify-between"><span>Расчётные дни</span><Badge variant="outline">{fmt(result.calcDays)}</Badge></div>
              <div className="flex justify-between"><span>НДФЛ 13%</span><Badge variant="destructive">{fmt(result.ndfl)} ₽</Badge></div>
              <div className="flex justify-between font-medium"><span>На руки</span><Badge variant="default">{fmt(result.netPay)} ₽</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
