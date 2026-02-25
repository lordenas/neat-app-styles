import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calcFuelConsumption, calcFuelNeeded, type FuelInput } from "@/lib/calculators/fuel-consumption";

export default function FuelConsumptionCalculator() {
  // Tab 1: расчёт расхода
  const [distance, setDistance] = useState(500);
  const [fuelUsed, setFuelUsed] = useState(40);
  const [fuelPrice, setFuelPrice] = useState(56);

  // Tab 2: расчёт нужного топлива
  const [distance2, setDistance2] = useState(300);
  const [consumption100, setConsumption100] = useState(8);
  const [fuelPrice2, setFuelPrice2] = useState(56);

  const result1 = useMemo(
    () => calcFuelConsumption({ distance, fuelUsed, fuelPrice }),
    [distance, fuelUsed, fuelPrice]
  );

  const result2 = useMemo(
    () => calcFuelNeeded(distance2, consumption100, fuelPrice2),
    [distance2, consumption100, fuelPrice2]
  );

  return (
    <CalculatorLayout calculatorId="fuel-consumption" categoryName="Автомобильные" categoryPath="/#automotive">
      <Tabs defaultValue="calc" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calc">Расчёт расхода</TabsTrigger>
          <TabsTrigger value="plan">Планирование поездки</TabsTrigger>
        </TabsList>

        <TabsContent value="calc">
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <Card>
              <CardHeader><CardTitle>Данные поездки</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dist">Расстояние (км)</Label>
                    <Input id="dist" type="number" value={distance} onChange={(e) => setDistance(+e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fuel">Израсходовано (л)</Label>
                    <Input id="fuel" type="number" value={fuelUsed} onChange={(e) => setFuelUsed(+e.target.value)} min={0} step={0.1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fprice">Цена за литр (₽)</Label>
                    <Input id="fprice" type="number" value={fuelPrice} onChange={(e) => setFuelPrice(+e.target.value)} min={0} step={0.1} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Расход</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{result1.per100km} л/100км</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Стоимость поездки</span><Badge variant="outline">{result1.tripCost} ₽</Badge></div>
                  <div className="flex justify-between"><span>Стоимость 1 км</span><Badge variant="outline">{result1.costPerKm} ₽</Badge></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plan">
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            <Card>
              <CardHeader><CardTitle>Планирование</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dist2">Расстояние (км)</Label>
                    <Input id="dist2" type="number" value={distance2} onChange={(e) => setDistance2(+e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c100">Расход (л/100км)</Label>
                    <Input id="c100" type="number" value={consumption100} onChange={(e) => setConsumption100(+e.target.value)} min={0} step={0.1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fp2">Цена за литр (₽)</Label>
                    <Input id="fp2" type="number" value={fuelPrice2} onChange={(e) => setFuelPrice2(+e.target.value)} min={0} step={0.1} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Потребуется топлива</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{result2.liters} л</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm">
                  <div className="flex justify-between"><span>Стоимость поездки</span><Badge variant="outline">{result2.cost} ₽</Badge></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CalculatorLayout>
  );
}
