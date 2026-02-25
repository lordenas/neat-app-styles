import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { calcTransportTax, type TransportTaxInput } from "@/lib/calculators/transport-tax";
import { POPULAR_REGIONS, REGION_NAMES } from "@/lib/calculators/osago";

export default function TransportTaxCalculator() {
  const [horsePower, setHorsePower] = useState(150);
  const [regionCode, setRegionCode] = useState("77");
  const [ownershipMonths, setOwnershipMonths] = useState(12);
  const [carPrice, setCarPrice] = useState(2_000_000);
  const [carYear, setCarYear] = useState(2022);
  const [taxYear, setTaxYear] = useState(2024);

  const input: TransportTaxInput = { horsePower, regionCode, ownershipMonths, carPrice, carYear, taxYear };
  const result = calcTransportTax(input);

  return (
    <CalculatorLayout calculatorId="transport-tax" categoryName="Автомобильные" categoryPath="/#automotive">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <Card>
          <CardHeader><CardTitle>Параметры</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hp">Мощность двигателя (л.с.)</Label>
                <Input id="hp" type="number" value={horsePower} onChange={(e) => setHorsePower(+e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label>Регион</Label>
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
                <Label>Месяцев владения в году</Label>
                <Select value={String(ownershipMonths)} onValueChange={(v) => setOwnershipMonths(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Стоимость авто (₽)</Label>
                <Input id="price" type="number" value={carPrice} onChange={(e) => setCarPrice(+e.target.value)} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cyear">Год выпуска</Label>
                <Input id="cyear" type="number" value={carYear} onChange={(e) => setCarYear(+e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tyear">Налоговый год</Label>
                <Input id="tyear" type="number" value={taxYear} onChange={(e) => setTaxYear(+e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Налог</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{result.taxAmount.toLocaleString("ru-RU")} ₽</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Детали</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Базовая ставка</span><Badge variant="outline">{result.baseRate} ₽/л.с.</Badge></div>
              <div className="flex justify-between"><span>Региональная ставка</span><Badge variant="outline">{result.regionalRate} ₽/л.с.</Badge></div>
              <div className="flex justify-between"><span>Коэфф. владения</span><Badge variant="outline">{result.ownershipCoeff.toFixed(2)}</Badge></div>
              {result.luxuryMultiplier > 1 && (
                <div className="flex justify-between"><span>Повышающий коэфф.</span><Badge variant="destructive">×{result.luxuryMultiplier}</Badge></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
