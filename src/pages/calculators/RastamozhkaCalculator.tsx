import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { calcRastamozhka, type RastamozhkaInput } from "@/lib/calculators/rastamozhka";

const AGE_GROUPS = [
  { value: "new", label: "Новый" },
  { value: "1-3", label: "1–3 года" },
  { value: "3-5", label: "3–5 лет" },
  { value: "5-7", label: "5–7 лет" },
  { value: "7+", label: "Старше 7 лет" },
] as const;

export default function RastamozhkaCalculator() {
  const [priceEur, setPriceEur] = useState(15000);
  const [engineVolume, setEngineVolume] = useState(2000);
  const [horsePower, setHorsePower] = useState(150);
  const [ageGroup, setAgeGroup] = useState<RastamozhkaInput["ageGroup"]>("3-5");
  const [importerType, setImporterType] = useState<"individual" | "legal">("individual");
  const [eurRate, setEurRate] = useState(100);

  const input: RastamozhkaInput = { priceEur, engineVolume, horsePower, ageGroup, importerType, eurRate };
  const result = calcRastamozhka(input);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  return (
    <CalculatorLayout calculatorId="rastamozhka-auto" categoryName="Автомобильные" categoryPath="/categories/automotive">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <CardHeader><CardTitle>Параметры ввоза</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Стоимость (€)</Label>
                <Input id="price" type="number" value={priceEur} onChange={(e) => setPriceEur(+e.target.value)} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eur">Курс EUR/RUB</Label>
                <Input id="eur" type="number" value={eurRate} onChange={(e) => setEurRate(+e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vol">Объём двигателя (куб. см)</Label>
                <Input id="vol" type="number" value={engineVolume} onChange={(e) => setEngineVolume(+e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hp">Мощность (л.с.)</Label>
                <Input id="hp" type="number" value={horsePower} onChange={(e) => setHorsePower(+e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label>Возраст авто</Label>
                <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as RastamozhkaInput["ageGroup"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AGE_GROUPS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Тип ввозящего</Label>
                <Select value={importerType} onValueChange={(v) => setImporterType(v as "individual" | "legal")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Физлицо</SelectItem>
                    <SelectItem value="legal">Юрлицо</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Итого</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{fmt(result.total)} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">Стоимость авто: {fmt(Math.round(priceEur * eurRate))} ₽</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Разбивка</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Таможенный сбор</span><Badge variant="outline">{fmt(result.customsFee)} ₽</Badge></div>
              <div className="flex justify-between"><span>Пошлина</span><Badge variant="outline">{fmt(result.duty)} ₽</Badge></div>
              <div className="flex justify-between"><span>Утильсбор</span><Badge variant="outline">{fmt(result.recyclingFee)} ₽</Badge></div>
              {result.excise > 0 && <div className="flex justify-between"><span>Акциз</span><Badge variant="outline">{fmt(result.excise)} ₽</Badge></div>}
              {result.vat > 0 && <div className="flex justify-between"><span>НДС</span><Badge variant="outline">{fmt(result.vat)} ₽</Badge></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
