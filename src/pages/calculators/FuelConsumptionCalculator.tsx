import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel, Route, Banknote, Gauge, TrendingDown } from "lucide-react";
import { calcFuelConsumption, calcFuelNeeded } from "@/lib/calculators/fuel-consumption";

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="px-5 py-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`rounded-lg p-2 ${accent ? "bg-primary/10" : "bg-muted"}`}>
            {icon}
          </div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className={`text-2xl font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({
  id, label, hint, value, onChange, step = 1, inputEnd,
}: {
  id: string; label: string; hint?: string; value: number; onChange: (v: number) => void; step?: number; inputEnd?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="h-[44px] flex flex-col justify-end">
        <Label htmlFor={id} className="text-base font-medium">{label}</Label>
        {hint && <p className="text-sm text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(Math.max(0, +e.target.value))}
        min={0}
        step={step}
        inputEnd={inputEnd}
        className="h-11 text-base font-semibold tabular-nums text-right"
      />
    </div>
  );
}

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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("calculatorNames.fuel-consumption")}</h1>
          <p className="text-muted-foreground mt-2">{t("calculatorDescriptions.fuel-consumption")}</p>
        </div>

        <Tabs defaultValue="calc" className="space-y-8">
          <TabsList className="h-11">
            <TabsTrigger value="calc" className="px-6 text-sm">
              {t("calculator.fuelConsumption.modeAverage")}
            </TabsTrigger>
            <TabsTrigger value="plan" className="px-6 text-sm">
              {t("calculator.fuelConsumption.modeTrip")}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1 — средний расход */}
          <TabsContent value="calc" className="space-y-6 mt-0">
            {/* Параметры */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg">{t("calculator.inputTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <div className="grid sm:grid-cols-3 gap-8">
                  <Field
                    id="dist"
                    label={t("calculator.fuelConsumption.distanceLabel")}
                    hint="Общий пробег"
                    value={distance}
                    onChange={setDistance}
                    inputEnd={<span className="text-sm text-muted-foreground font-medium">км</span>}
                  />
                  <Field
                    id="fuel"
                    label={t("calculator.fuelConsumption.fuelUsedLabel")}
                    hint="Сколько залито топлива"
                    value={fuelUsed}
                    onChange={setFuelUsed}
                    step={0.1}
                    inputEnd={<span className="text-sm text-muted-foreground font-medium">л</span>}
                  />
                  <Field
                    id="fprice"
                    label={t("calculator.fuelConsumption.priceLabel")}
                    hint="Цена за литр"
                    value={fuelPrice}
                    onChange={setFuelPrice}
                    step={0.1}
                    inputEnd={<span className="text-sm text-muted-foreground font-medium">₽/л</span>}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Итоги */}
            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard
                icon={<Banknote className="h-4 w-4 text-primary" />}
                label={t("calculator.fuelConsumption.resultCost")}
                value={`${result1.tripCost.toLocaleString("ru-RU")} ₽`}
                accent
              />
              <StatCard
                icon={<Route className="h-4 w-4 text-muted-foreground" />}
                label="Стоимость 1 км"
                value={`${result1.costPerKm.toLocaleString("ru-RU")} ₽`}
              />
            </div>

            {/* Hero */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="px-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-primary-foreground/15 p-4">
                    <Gauge className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-1">{t("calculator.fuelConsumption.resultConsumptionPer100")}</p>
                    <p className="text-5xl font-bold tracking-tight tabular-nums">
                      {result1.per100km} <span className="text-2xl font-normal opacity-80">{t("calculator.fuelConsumption.consumptionL100km")}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2 — планирование поездки */}
          <TabsContent value="plan" className="space-y-6 mt-0">
            {/* Параметры */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg">{t("calculator.inputTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-8">
                <div className="grid sm:grid-cols-3 gap-8">
                  <Field
                    id="dist2"
                    label={t("calculator.fuelConsumption.distanceLabel")}
                    hint="Дальность поездки"
                    value={distance2}
                    onChange={setDistance2}
                    inputEnd={<span className="text-sm text-muted-foreground font-medium">км</span>}
                  />
                  <Field
                    id="c100"
                    label={t("calculator.fuelConsumption.consumptionLabel")}
                    hint="Расход вашего авто"
                    value={consumption100}
                    onChange={setConsumption100}
                    step={0.1}
                    inputEnd={<span className="text-sm text-muted-foreground font-medium">л/100км</span>}
                  />
                  <Field
                    id="fp2"
                    label={t("calculator.fuelConsumption.priceLabel")}
                    hint="Цена за литр"
                    value={fuelPrice2}
                    onChange={setFuelPrice2}
                    step={0.1}
                    inputEnd={<span className="text-sm text-muted-foreground font-medium">₽/л</span>}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Итоги */}
            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard
                icon={<Banknote className="h-4 w-4 text-primary" />}
                label={t("calculator.fuelConsumption.resultCost")}
                value={`${result2.cost.toLocaleString("ru-RU")} ₽`}
                accent
              />
              <StatCard
                icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
                label="Расход на поездку"
                value={`${result2.liters} л`}
              />
            </div>

            {/* Hero */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardContent className="px-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-primary-foreground/15 p-4">
                    <Fuel className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-75 mb-1">{t("calculator.fuelConsumption.resultFuelUsed")}</p>
                    <p className="text-5xl font-bold tracking-tight tabular-nums">
                      {result2.liters} <span className="text-2xl font-normal opacity-80">л</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CalculatorLayout>
  );
}
