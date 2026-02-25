import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { calcInsuranceTenure, type TenurePeriod } from "@/lib/calculators/insurance-tenure";

export default function InsuranceTenureCalculator() {
  const [periods, setPeriods] = useState<TenurePeriod[]>([
    { startDate: "2015-03-01", endDate: "2020-06-15" },
    { startDate: "2020-09-01", endDate: "2025-01-31" },
  ]);

  const addPeriod = () => setPeriods([...periods, { startDate: "", endDate: "" }]);
  const removePeriod = (i: number) => setPeriods(periods.filter((_, idx) => idx !== i));
  const updatePeriod = (i: number, field: keyof TenurePeriod, val: string) => {
    const copy = [...periods];
    copy[i] = { ...copy[i], [field]: val };
    setPeriods(copy);
  };

  const validPeriods = periods.filter((p) => p.startDate && p.endDate);
  const result = calcInsuranceTenure(validPeriods);

  return (
    <CalculatorLayout calculatorId="insurance-tenure" categoryName="Зарплатные" categoryPath="/categories/salary">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Периоды работы</CardTitle>
              <Button variant="outline" size="sm" onClick={addPeriod}><Plus className="h-4 w-4 mr-1" />Добавить</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {periods.map((p, i) => (
              <div key={i} className="flex items-end gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Начало</Label>
                  <Input type="date" value={p.startDate} onChange={(e) => updatePeriod(i, "startDate", e.target.value)} />
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Конец</Label>
                  <Input type="date" value={p.endDate} onChange={(e) => updatePeriod(i, "endDate", e.target.value)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removePeriod(i)} className="shrink-0" disabled={periods.length <= 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Страховой стаж</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {result.totalYears} л. {result.totalMonths} мес. {result.totalDays} дн.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Оплата больничного</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Процент</span>
                <Badge variant={result.sickPayPercent === 100 ? "default" : "outline"}>{result.sickPayPercent}%</Badge>
              </div>
              <p className="text-muted-foreground text-xs">{result.sickPayDescription}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
