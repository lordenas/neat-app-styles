import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calcUnusedVacation } from "@/lib/calculators/unused-vacation";

export default function UnusedVacationCalculator() {
  const [avgDailyPay, setAvgDailyPay] = useState(2048);
  const [workedMonths, setWorkedMonths] = useState(8);
  const [annualVacationDays, setAnnualVacationDays] = useState(28);
  const [usedVacationDays, setUsedVacationDays] = useState(0);

  const result = calcUnusedVacation({ avgDailyPay, workedMonths, annualVacationDays, usedVacationDays });
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="unused-vacation" categoryName="Зарплатные" categoryPath="/categories/salary">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <Card>
          <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sdz">Средний дневной заработок (₽)</Label>
                <Input id="sdz" type="number" value={avgDailyPay} onChange={(e) => setAvgDailyPay(+e.target.value)} min={0} step={0.01} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wm">Отработано месяцев</Label>
                <Input id="wm" type="number" value={workedMonths} onChange={(e) => setWorkedMonths(+e.target.value)} min={0} max={600} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avd">Дней отпуска в году</Label>
                <Input id="avd" type="number" value={annualVacationDays} onChange={(e) => setAnnualVacationDays(+e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uvd">Использовано дней отпуска</Label>
                <Input id="uvd" type="number" value={usedVacationDays} onChange={(e) => setUsedVacationDays(+e.target.value)} min={0} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Компенсация</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.compensation)} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">до вычета НДФЛ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Детали</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Положено дней</span><Badge variant="outline">{fmt(result.earnedDays)}</Badge></div>
              <div className="flex justify-between"><span>Неиспользовано</span><Badge variant="outline">{fmt(result.unusedDays)}</Badge></div>
              <div className="flex justify-between"><span>НДФЛ 13%</span><Badge variant="destructive">{fmt(result.ndfl)} ₽</Badge></div>
              <div className="flex justify-between font-medium"><span>На руки</span><Badge variant="default">{fmt(result.netPay)} ₽</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
