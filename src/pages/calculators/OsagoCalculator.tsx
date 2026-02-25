import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  calcOsago, POPULAR_REGIONS, REGION_NAMES,
  type OsagoInput, type VehicleCategory,
} from "@/lib/calculators/osago";

const CATEGORIES: { value: VehicleCategory; label: string }[] = [
  { value: "B", label: "Легковой (B)" },
  { value: "A", label: "Мотоцикл (A)" },
  { value: "C", label: "Грузовой (C)" },
  { value: "D", label: "Автобус (D)" },
  { value: "taxi", label: "Такси" },
];

export default function OsagoCalculator() {
  const [category, setCategory] = useState<VehicleCategory>("B");
  const [horsePower, setHorsePower] = useState(120);
  const [regionCode, setRegionCode] = useState("77");
  const [driverAge, setDriverAge] = useState(35);
  const [driverExperience, setDriverExperience] = useState(10);
  const [kbmClass, setKbmClass] = useState(4);
  const [usagePeriod, setUsagePeriod] = useState(12);
  const [unlimitedDrivers, setUnlimitedDrivers] = useState(false);

  const input: OsagoInput = {
    category, horsePower, regionCode, driverAge, driverExperience,
    kbmClass, usagePeriod, unlimitedDrivers,
  };
  const result = calcOsago(input);

  return (
    <CalculatorLayout calculatorId="osago" categoryName="Автомобильные" categoryPath="/categories/automotive">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <Card>
          <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Категория ТС</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as VehicleCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {category === "B" && (
                <div className="space-y-1.5">
                  <Label htmlFor="hp">Мощность (л.с.)</Label>
                  <Input id="hp" type="number" value={horsePower} onChange={(e) => setHorsePower(+e.target.value)} min={1} />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Регион регистрации</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POPULAR_REGIONS.map((c) => (
                      <SelectItem key={c} value={c}>{REGION_NAMES[c] ?? c} ({c})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age">Возраст водителя</Label>
                <Input id="age" type="number" value={driverAge} onChange={(e) => setDriverAge(+e.target.value)} min={18} max={99} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp">Стаж (лет)</Label>
                <Input id="exp" type="number" value={driverExperience} onChange={(e) => setDriverExperience(+e.target.value)} min={0} />
              </div>

              <div className="space-y-1.5">
                <Label>Класс КБМ</Label>
                <Select value={String(kbmClass)} onValueChange={(v) => setKbmClass(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>Класс {i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Период использования (мес.)</Label>
                <Select value={String(usagePeriod)} onValueChange={(v) => setUsagePeriod(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <SelectItem key={m} value={String(m)}>{m} мес.</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch checked={unlimitedDrivers} onCheckedChange={setUnlimitedDrivers} id="unlimited" />
              <Label htmlFor="unlimited">Без ограничения числа водителей</Label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Стоимость полиса</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{result.total.toLocaleString("ru-RU")} ₽</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Коэффициенты</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Базовый тариф</span><Badge variant="outline">{result.baseTariff} ₽</Badge></div>
              <div className="flex justify-between"><span>КТ (территория)</span><Badge variant="outline">{result.kt}</Badge></div>
              <div className="flex justify-between"><span>КВС (возраст/стаж)</span><Badge variant="outline">{result.kvs}</Badge></div>
              <div className="flex justify-between"><span>КБМ</span><Badge variant="outline">{result.kbm}</Badge></div>
              {category === "B" && <div className="flex justify-between"><span>КМ (мощность)</span><Badge variant="outline">{result.km}</Badge></div>}
              <div className="flex justify-between"><span>КС (период)</span><Badge variant="outline">{result.ks}</Badge></div>
              {unlimitedDrivers && <div className="flex justify-between"><span>КО (без огр.)</span><Badge variant="outline">{result.ko}</Badge></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
