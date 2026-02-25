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
  calcSubsistenceMinimum, PM_REGIONS, type PmCategory,
} from "@/lib/calculators/subsistence-minimum";

export default function SubsistenceMinimumCalculator() {
  const [regionCode, setRegionCode] = useState("00");
  const [category, setCategory] = useState<PmCategory>("child");
  const [multiplier, setMultiplier] = useState(1);

  const result = calcSubsistenceMinimum({ regionCode, category, multiplier });
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  return (
    <CalculatorLayout calculatorId="subsistence-minimum" categoryName="Юридические" categoryPath="/categories/legal">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <Card>
          <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Регион</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PM_REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as PmCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Дети</SelectItem>
                    <SelectItem value="working">Трудоспособное население</SelectItem>
                    <SelectItem value="pensioner">Пенсионеры</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mult">Кратность</Label>
                <Input id="mult" type="number" value={multiplier} onChange={(e) => setMultiplier(+e.target.value)} min={0.1} step={0.1} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Результат</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.resultAmount)} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">{multiplier}× от ПМ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Детали</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>ПМ</span><Badge variant="outline">{fmt(result.pmValue)} ₽</Badge></div>
              <div className="flex justify-between"><span>Категория</span><Badge variant="outline">{result.categoryLabel}</Badge></div>
              <div className="flex justify-between"><span>Регион</span><span className="text-xs text-muted-foreground">{result.regionName}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
