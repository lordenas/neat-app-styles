import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  calcAlimonyIndexation, PM_CHILD_HISTORY,
} from "@/lib/calculators/alimony-indexation";

export default function AlimonyIndexationCalculator() {
  const [originalAmount, setOriginalAmount] = useState(10000);
  const [originalPm, setOriginalPm] = useState(PM_CHILD_HISTORY[PM_CHILD_HISTORY.length - 1].value);
  const [currentPm, setCurrentPm] = useState(PM_CHILD_HISTORY[0].value);

  const result = calcAlimonyIndexation({ originalAmount, originalPm, currentPm });
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="alimony-indexation" categoryName="Юридические" categoryPath="/#legal">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <Card>
          <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="amount">Установленная сумма алиментов (₽)</Label>
                <Input id="amount" type="number" value={originalAmount} onChange={(e) => setOriginalAmount(+e.target.value)} min={0} />
              </div>

              <div className="space-y-1.5">
                <Label>ПМ на момент установления</Label>
                <Select value={String(originalPm)} onValueChange={(v) => setOriginalPm(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PM_CHILD_HISTORY.map((h) => (
                      <SelectItem key={h.period} value={String(h.value)}>
                        {h.period} — {h.value.toLocaleString("ru-RU")} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Текущий ПМ</Label>
                <Select value={String(currentPm)} onValueChange={(v) => setCurrentPm(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PM_CHILD_HISTORY.map((h) => (
                      <SelectItem key={h.period} value={String(h.value)}>
                        {h.period} — {h.value.toLocaleString("ru-RU")} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Индексированная сумма</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.indexedAmount)} ₽</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Детали</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Коэффициент</span><Badge variant="outline">×{result.indexCoefficient}</Badge></div>
              <div className="flex justify-between">
                <span>Разница</span>
                <Badge variant={result.difference > 0 ? "default" : "outline"}>
                  {result.difference > 0 ? "+" : ""}{fmt(result.difference)} ₽
                </Badge>
              </div>
              <div className="flex justify-between"><span>Исходная сумма</span><Badge variant="outline">{fmt(originalAmount)} ₽</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
