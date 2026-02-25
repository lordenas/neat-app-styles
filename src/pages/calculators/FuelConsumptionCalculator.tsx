import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calcFuelConsumption, calcFuelNeeded } from "@/lib/calculators/fuel-consumption";

export default function FuelConsumptionCalculator() {
  const { t } = useTranslation();
  const [distance, setDistance] = useState(500);
  const [fuelUsed, setFuelUsed] = useState(40);
  const [fuelPrice, setFuelPrice] = useState(56);

  const [distance2, setDistance2] = useState(300);
  const [consumption100, setConsumption100] = useState(8);
  const [fuelPrice2, setFuelPrice2] = useState(56);

  const result1 = useMemo(() => calcFuelConsumption({ distance, fuelUsed, fuelPrice }), [distance, fuelUsed, fuelPrice]);
  const result2 = useMemo(() => calcFuelNeeded(distance2, consumption100, fuelPrice2), [distance2, consumption100, fuelPrice2]);

  return (
    <CalculatorLayout calculatorId="fuel-consumption" categoryName="Automotive" categoryPath="/categories/automotive">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.fuel-consumption")}</h1>
          <p className="text-muted-foreground mt-1">{t("calculatorDescriptions.fuel-consumption")}</p>
        </div>

        <Tabs defaultValue="calc" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calc">{t("calculator.fuelConsumption.modeAverage")}</TabsTrigger>
            <TabsTrigger value="plan">{t("calculator.fuelConsumption.modeTrip")}</TabsTrigger>
          </TabsList>

          <TabsContent value="calc">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card>
                <CardHeader><CardTitle>{t("calculator.inputTitle")}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="dist">{t("calculator.fuelConsumption.distanceLabel")}</Label>
                      <Input id="dist" type="number" value={distance} onChange={(e) => setDistance(+e.target.value)} min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fuel">{t("calculator.fuelConsumption.fuelUsedLabel")}</Label>
                      <Input id="fuel" type="number" value={fuelUsed} onChange={(e) => setFuelUsed(+e.target.value)} min={0} step={0.1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fprice">{t("calculator.fuelConsumption.priceLabel")}</Label>
                      <Input id="fprice" type="number" value={fuelPrice} onChange={(e) => setFuelPrice(+e.target.value)} min={0} step={0.1} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>{t("calculator.fuelConsumption.resultConsumptionPer100")}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{result1.per100km} {t("calculator.fuelConsumption.consumptionL100km")}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 space-y-2 text-sm">
                    <div className="flex justify-between"><span>{t("calculator.fuelConsumption.resultCost")}</span><Badge variant="outline">{result1.tripCost} ₽</Badge></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plan">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              <Card>
                <CardHeader><CardTitle>{t("calculator.inputTitle")}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="dist2">{t("calculator.fuelConsumption.distanceLabel")}</Label>
                      <Input id="dist2" type="number" value={distance2} onChange={(e) => setDistance2(+e.target.value)} min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c100">{t("calculator.fuelConsumption.consumptionLabel")}</Label>
                      <Input id="c100" type="number" value={consumption100} onChange={(e) => setConsumption100(+e.target.value)} min={0} step={0.1} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fp2">{t("calculator.fuelConsumption.priceLabel")}</Label>
                      <Input id="fp2" type="number" value={fuelPrice2} onChange={(e) => setFuelPrice2(+e.target.value)} min={0} step={0.1} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>{t("calculator.fuelConsumption.resultFuelUsed")}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{result2.liters} л</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-sm">
                    <div className="flex justify-between"><span>{t("calculator.fuelConsumption.resultCost")}</span><Badge variant="outline">{result2.cost} ₽</Badge></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CalculatorLayout>
  );
}
