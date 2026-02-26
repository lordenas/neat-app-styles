import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { calcTransportTax, type TransportTaxInput } from "@/lib/calculators/transport-tax";
import { POPULAR_REGIONS, REGION_NAMES } from "@/lib/calculators/osago";
import { Car, Truck, Bike, Bus, Tractor } from "lucide-react";
import { cn } from "@/lib/utils";

const VEHICLE_TYPES = [
  { label: "Легковой", icon: Car, maxHp: 400 },
  { label: "Грузовой", icon: Truck, maxHp: 600 },
  { label: "Мотоцикл", icon: Bike, maxHp: 150 },
  { label: "Автобус", icon: Bus, maxHp: 400 },
  { label: "Спецтехника", icon: Tractor, maxHp: 300 },
];

const CURRENT_YEAR = new Date().getFullYear();
const TAX_YEAR = CURRENT_YEAR - 1;

function formatRub(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

export default function TransportTaxCalculator() {
  const [vehicleTypeIdx, setVehicleTypeIdx] = useState(0);
  const [horsePower, setHorsePower] = useState(150);
  const [regionCode, setRegionCode] = useState("77");
  const [ownershipMonths, setOwnershipMonths] = useState(12);
  const [carPrice, setCarPrice] = useState(2_000_000);
  const [carYear, setCarYear] = useState(2020);
  const [taxYear] = useState(TAX_YEAR);

  const maxHp = VEHICLE_TYPES[vehicleTypeIdx].maxHp;
  const safeHp = Math.min(horsePower, maxHp);

  const input: TransportTaxInput = {
    horsePower: safeHp,
    regionCode,
    ownershipMonths,
    carPrice,
    carYear,
    taxYear,
  };
  const result = calcTransportTax(input);

  // For ownership bar visualization
  const ownershipPct = (ownershipMonths / 12) * 100;

  return (
    <CalculatorLayout calculatorId="transport-tax" categoryName="Автомобильные" categoryPath="/categories/automotive">
      <div className="space-y-5">

        {/* Vehicle type */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Тип транспортного средства</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {VEHICLE_TYPES.map((vt, i) => {
                const Icon = vt.icon;
                const active = vehicleTypeIdx === i;
                return (
                  <button
                    key={vt.label}
                    onClick={() => { setVehicleTypeIdx(i); if (horsePower > vt.maxHp) setHorsePower(vt.maxHp); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {vt.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main params */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Параметры автомобиля</CardTitle></CardHeader>
          <CardContent className="space-y-6">

            {/* Horse Power slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Мощность двигателя</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={horsePower}
                    onChange={(e) => setHorsePower(Math.min(+e.target.value, maxHp))}
                    className="w-20 h-8 text-right text-sm"
                    min={1}
                    max={maxHp}
                  />
                  <span className="text-sm text-muted-foreground">л.с.</span>
                </div>
              </div>
              <Slider
                value={[horsePower]}
                min={1}
                max={maxHp}
                step={5}
                onValueChange={([v]) => setHorsePower(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 л.с.</span>
                <span>{maxHp} л.с.</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Region */}
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

              {/* Car year */}
              <div className="space-y-1.5">
                <Label htmlFor="cyear">Год выпуска</Label>
                <Input
                  id="cyear"
                  type="number"
                  value={carYear}
                  onChange={(e) => setCarYear(+e.target.value)}
                  min={1990}
                  max={CURRENT_YEAR}
                />
              </div>

              {/* Car price */}
              <div className="space-y-1.5">
                <Label htmlFor="price">Стоимость авто</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="price"
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(+e.target.value)}
                    min={0}
                    step={100000}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">₽</span>
                </div>
                {carPrice >= 10_000_000 && (
                  <p className="text-xs text-destructive">Применяется повышающий коэффициент роскоши</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ownership months */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Период владения в {taxYear} году</CardTitle>
              <Badge variant={ownershipMonths === 12 ? "default" : "secondary"}>
                {ownershipMonths} {ownershipMonths === 1 ? "месяц" : ownershipMonths < 5 ? "месяца" : "месяцев"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Month pills */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  onClick={() => setOwnershipMonths(m)}
                  className={cn(
                    "rounded-md border py-2 text-xs font-medium transition-all",
                    ownershipMonths === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            {/* Ownership bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${ownershipPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Коэффициент владения: {result.ownershipCoeff.toFixed(2)} · {ownershipPct.toFixed(0)}% года
              </p>
            </div>
          </CardContent>
        </Card>

        {/* RESULT */}
        <Card variant="elevated" className="border-primary/20">
          <CardContent className="pt-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Транспортный налог за {taxYear} год</p>
                <p className="text-4xl font-bold text-primary">{formatRub(result.taxAmount)}</p>
                {result.luxuryMultiplier > 1 && (
                  <Badge variant="destructive" className="mt-2">Коэффициент роскоши ×{result.luxuryMultiplier}</Badge>
                )}
              </div>
              <div className="sm:text-right space-y-1 text-sm text-muted-foreground">
                <p>{formatRub(Math.round(result.taxAmount / ownershipMonths))} / мес.</p>
                <p>Ставка: {result.regionalRate} ₽/л.с.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Расчёт по коэффициентам</CardTitle></CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Мощность</span>
              <span className="font-medium">{safeHp} л.с.</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Базовая ставка (НК РФ)</span>
              <Badge variant="outline">{result.baseRate} ₽/л.с.</Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Региональная ставка</span>
              <Badge variant="outline">{result.regionalRate} ₽/л.с.</Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Коэффициент владения</span>
              <Badge variant="outline">{result.ownershipCoeff.toFixed(2)}</Badge>
            </div>
            {result.luxuryMultiplier > 1 && (
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Повышающий коэфф. (роскошь)</span>
                <Badge variant="destructive">×{result.luxuryMultiplier}</Badge>
              </div>
            )}
            <div className="flex justify-between items-center py-2 mt-1 bg-muted/40 rounded-lg px-3 font-medium">
              <span>{safeHp} × {result.regionalRate} × {result.ownershipCoeff.toFixed(2)}{result.luxuryMultiplier > 1 ? ` × ${result.luxuryMultiplier}` : ""}</span>
              <span className="text-primary">{formatRub(result.taxAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Luxury info */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 select-none">
            <span className="transition-transform group-open:rotate-90">▶</span>
            Повышающий коэффициент (автомобили стоимостью от 10 млн ₽)
          </summary>
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2 text-muted-foreground">
            <p>С 1 января 2022 года применяется повышающий коэффициент Кп согласно п. 2 ст. 362 НК РФ:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>От 10 до 15 млн ₽, возраст до 10 лет — <strong className="text-foreground">×2</strong></li>
              <li>От 15 млн ₽, возраст до 20 лет — <strong className="text-foreground">×3</strong></li>
            </ul>
            <p>Перечень дорогостоящих автомобилей ежегодно публикуется на сайте Минпромторга.</p>
          </div>
        </details>
      </div>
    </CalculatorLayout>
  );
}
