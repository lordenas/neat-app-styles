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
import {
  calcTransportTax,
  type TransportTaxInput,
  type VehicleCategory,
} from "@/lib/calculators/transport-tax";
import { POPULAR_REGIONS, REGION_NAMES } from "@/lib/calculators/osago";
import { cn } from "@/lib/utils";

// Full vehicle category list per НК РФ ст. 361
const VEHICLE_CATEGORIES: {
  value: VehicleCategory;
  label: string;
  powerLabel: string;
  maxPower: number;
  showPrice?: boolean;
}[] = [
  { value: "passenger_car",       label: "Автомобили легковые",                            powerLabel: "л.с.",       maxPower: 500, showPrice: true  },
  { value: "motorcycle",          label: "Мотоциклы и мотороллеры",                        powerLabel: "л.с.",       maxPower: 200, showPrice: false },
  { value: "bus",                 label: "Автобусы",                                       powerLabel: "л.с.",       maxPower: 600, showPrice: false },
  { value: "truck",               label: "Грузовые автомобили",                            powerLabel: "л.с.",       maxPower: 600, showPrice: false },
  { value: "snowmobile",          label: "Снегоходы, мотосани",                            powerLabel: "л.с.",       maxPower: 200, showPrice: false },
  { value: "boat",                label: "Катера, моторные лодки и другие водные ТС",      powerLabel: "л.с.",       maxPower: 400, showPrice: false },
  { value: "yacht",               label: "Яхты и другие парусно-моторные суда",            powerLabel: "л.с.",       maxPower: 1000,showPrice: false },
  { value: "jetski",              label: "Гидроциклы",                                     powerLabel: "л.с.",       maxPower: 300, showPrice: false },
  { value: "towed_vessel",        label: "Несамоходные (буксируемые) суда",                powerLabel: "тонн валовой вместимости", maxPower: 1000, showPrice: false },
  { value: "aircraft_engine",     label: "Самолёты, вертолёты и иные воздушные суда с двигателями", powerLabel: "л.с.", maxPower: 10000, showPrice: false },
  { value: "jet_aircraft",        label: "Самолёты с реактивными двигателями",             powerLabel: "кгс тяги",   maxPower: 50000,showPrice: false },
  { value: "other_no_engine",     label: "Другие водные и воздушные ТС без двигателей",    powerLabel: "единиц",     maxPower: 1, showPrice: false },
  { value: "other_self_propelled",label: "Другие самоходные транспортные средства",        powerLabel: "л.с.",       maxPower: 500, showPrice: false },
];

const CURRENT_YEAR = new Date().getFullYear();
const TAX_YEAR = CURRENT_YEAR - 1;

function formatRub(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

const OWNER_TYPES = [
  { value: "individual", label: "Физическое лицо" },
  { value: "legal",      label: "Юридическое лицо" },
] as const;

type OwnerType = typeof OWNER_TYPES[number]["value"];

export default function TransportTaxCalculator() {
  const [ownerType, setOwnerType] = useState<OwnerType>("individual");
  const [category, setCategory] = useState<VehicleCategory>("passenger_car");
  const [horsePower, setHorsePower] = useState(150);
  const [regionCode, setRegionCode] = useState("77");
  const [ownershipMonths, setOwnershipMonths] = useState(12);
  const [carPrice, setCarPrice] = useState(2_000_000);
  const [carYear, setCarYear] = useState(2020);
  const [taxYear] = useState(TAX_YEAR);

  const cat = VEHICLE_CATEGORIES.find((c) => c.value === category)!;
  const safePower = cat.value === "other_no_engine" ? 1 : Math.min(horsePower, cat.maxPower);

  const handleCategoryChange = (v: VehicleCategory) => {
    setCategory(v);
    const next = VEHICLE_CATEGORIES.find((c) => c.value === v)!;
    if (horsePower > next.maxPower) setHorsePower(next.maxPower);
  };

  const input: TransportTaxInput = {
    horsePower: safePower,
    vehicleCategory: category,
    regionCode,
    ownershipMonths,
    carPrice: cat.showPrice ? carPrice : 0,
    carYear,
    taxYear,
  };
  const result = calcTransportTax(input);
  const ownershipPct = (ownershipMonths / 12) * 100;

  return (
    <CalculatorLayout calculatorId="transport-tax" categoryName="Автомобильные" categoryPath="/categories/automotive">
      <div className="space-y-5">

        {/* Owner type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Владелец транспортного средства</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {OWNER_TYPES.map((ot) => (
                <button
                  key={ot.value}
                  onClick={() => setOwnerType(ot.value)}
                  className={cn(
                    "rounded-lg border-2 py-3 px-4 text-sm font-medium transition-all",
                    ownerType === ot.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {ot.label}
                </button>
              ))}
            </div>
            {ownerType === "legal" && (
              <p className="mt-3 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                Юридические лица самостоятельно рассчитывают и уплачивают налог (авансовые платежи ежеквартально).
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Тип транспортного средства</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={category} onValueChange={(v) => handleCategoryChange(v as VehicleCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Main params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры транспортного средства</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Power slider (hidden for other_no_engine) */}
            {cat.value !== "other_no_engine" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    {cat.powerLabel === "л.с." && "Мощность двигателя"}
                    {cat.powerLabel === "кгс тяги" && "Тяга двигателя"}
                    {cat.powerLabel === "тонн валовой вместимости" && "Валовая вместимость"}
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={horsePower}
                      onChange={(e) => setHorsePower(Math.min(+e.target.value, cat.maxPower))}
                      className="w-24 h-8 text-right text-sm"
                      min={1}
                      max={cat.maxPower}
                    />
                    <span className="text-sm text-muted-foreground shrink-0">{cat.powerLabel}</span>
                  </div>
                </div>
                <Slider
                  value={[horsePower]}
                  min={1}
                  max={cat.maxPower}
                  step={cat.maxPower > 1000 ? 100 : cat.maxPower > 300 ? 10 : 5}
                  onValueChange={([v]) => setHorsePower(v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 {cat.powerLabel}</span>
                  <span>{cat.maxPower.toLocaleString("ru-RU")} {cat.powerLabel}</span>
                </div>
              </div>
            )}

            {cat.value === "other_no_engine" && (
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
                Для данного типа ТС налог рассчитывается в фиксированном размере за единицу транспортного средства.
              </p>
            )}

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

              {/* Car price — only for passenger cars */}
              {cat.showPrice && (
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
              )}
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
                <p>Ставка: {result.regionalRate} ₽/{cat.powerLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Расчёт по коэффициентам</CardTitle></CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">
                {cat.value === "towed_vessel" ? "Вместимость" : cat.value === "jet_aircraft" ? "Тяга" : "Мощность"}
              </span>
              <span className="font-medium">{safePower.toLocaleString("ru-RU")} {cat.powerLabel}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Базовая ставка (НК РФ)</span>
              <Badge variant="outline">{result.baseRate} ₽/{cat.powerLabel}</Badge>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Региональная ставка</span>
              <Badge variant="outline">{result.regionalRate} ₽/{cat.powerLabel}</Badge>
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
              <span>{safePower} × {result.regionalRate} × {result.ownershipCoeff.toFixed(2)}{result.luxuryMultiplier > 1 ? ` × ${result.luxuryMultiplier}` : ""}</span>
              <span className="text-primary">{formatRub(result.taxAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Luxury info — only for passenger cars */}
        {cat.showPrice && (
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
        )}
      </div>
    </CalculatorLayout>
  );
}
