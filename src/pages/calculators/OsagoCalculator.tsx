import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Car, MapPin, User, Shield, Clock, Zap } from "lucide-react";
import {
  calcOsago, POPULAR_REGIONS, REGION_NAMES,
  type OsagoInput, type VehicleCategory,
} from "@/lib/calculators/osago";
import { cn } from "@/lib/utils";

const fmt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

const CATEGORIES: { value: VehicleCategory; label: string; icon: string }[] = [
  { value: "B", label: "Легковой (B)", icon: "🚗" },
  { value: "A", label: "Мотоцикл (A)", icon: "🏍️" },
  { value: "C", label: "Грузовой (C)", icon: "🚛" },
  { value: "D", label: "Автобус (D)", icon: "🚌" },
  { value: "taxi", label: "Такси", icon: "🚕" },
];

const HP_PRESETS = [70, 100, 120, 150, 200];
const KBM_CLASSES = Array.from({ length: 14 }, (_, i) => i);

const KBM_DISCOUNT: Record<number, string> = {
  0: "−0%", 1: "−0%", 2: "−0%", 3: "−0%", 4: "0%",
  5: "−5%", 6: "−10%", 7: "−15%", 8: "−20%", 9: "−25%",
  10: "−30%", 11: "−35%", 12: "−40%", 13: "−50%",
};

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

  const coefficients = [
    { label: "Базовый тариф", value: `${fmt(result.baseTariff)} ₽`, neutral: true },
    { label: "КТ (регион)", value: result.kt },
    { label: "КВС (возраст/стаж)", value: result.kvs },
    { label: "КБМ (бонус-малус)", value: result.kbm },
    ...(category === "B" ? [{ label: "КМ (мощность)", value: result.km }] : []),
    { label: "КС (период)", value: result.ks },
    ...(unlimitedDrivers ? [{ label: "КО (без огр.)", value: result.ko }] : []),
  ] as { label: string; value: number | string; neutral?: boolean }[];

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор ОСАГО</h1>
      <p className="text-muted-foreground mt-1">Расчёт стоимости полиса ОСАГО по коэффициентам ЦБ РФ (2024–2025)</p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="osago" categoryName="Автомобильные" categoryPath="/categories/automotive" title={title}>
      <div className="space-y-6">

        {/* Hero result */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Стоимость полиса ОСАГО</span>
            </div>
            <p className="text-4xl font-bold tracking-tight">{fmt(result.total)} ₽</p>
            <p className="text-sm text-muted-foreground mt-1">
              Базовый тариф: {fmt(result.baseTariff)} ₽ · Регион: {REGION_NAMES[regionCode] ?? regionCode}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {coefficients.slice(1).map((c) => (
              <div key={c.label} className={cn(
                "rounded-lg px-3 py-2 text-center min-w-[72px]",
                typeof c.value === "number" && c.value > 1 ? "bg-destructive/10" :
                typeof c.value === "number" && c.value < 1 ? "bg-[hsl(var(--success)/0.1)]" : "bg-muted"
              )}>
                <p className="text-xs text-muted-foreground">{c.label.split(" ")[0]}</p>
                <p className={cn("text-base font-bold",
                  typeof c.value === "number" && c.value > 1 ? "text-destructive" :
                  typeof c.value === "number" && c.value < 1 ? "text-[hsl(var(--success))]" : ""
                )}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parameters grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Параметры
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Category */}
            <div className="space-y-1.5">
              <Label>Категория ТС</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.value} onClick={() => setCategory(c.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                      category === c.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Region */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Регион</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POPULAR_REGIONS.map((c) => (
                      <SelectItem key={c} value={c}>{REGION_NAMES[c] ?? c} ({c})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Horsepower */}
              {category === "B" && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Мощность (л.с.)</Label>
                  <Input type="number" value={horsePower} onChange={(e) => setHorsePower(+e.target.value)} min={1} />
                  <div className="flex flex-wrap gap-1.5">
                    {HP_PRESETS.map((p) => (
                      <button key={p} onClick={() => setHorsePower(p)}
                        className={cn("text-xs px-2 py-0.5 rounded-full border transition-colors",
                          horsePower === p
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary hover:text-primary")}>
                        {p} л.с.
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Age */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Возраст водителя</Label>
                <Input type="number" value={driverAge} onChange={(e) => setDriverAge(+e.target.value)} min={18} max={99} disabled={unlimitedDrivers} />
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <Label>Стаж вождения (лет)</Label>
                <Input type="number" value={driverExperience} onChange={(e) => setDriverExperience(+e.target.value)} min={0} disabled={unlimitedDrivers} />
              </div>

              {/* Usage period */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Период использования</Label>
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

            {/* KBM */}
            <div className="space-y-1.5">
              <Label>Класс КБМ (бонус-малус) — скидка/надбавка</Label>
              <div className="flex flex-wrap gap-1.5">
                {KBM_CLASSES.map((k) => (
                  <button key={k} onClick={() => setKbmClass(k)}
                    className={cn(
                      "flex flex-col items-center rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all min-w-[48px]",
                      kbmClass === k
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}>
                    <span className="font-bold">{k}</span>
                    <span className={cn("text-[10px]",
                      k > 4 ? "text-[hsl(var(--success))]" : k < 4 ? "text-destructive" : "text-muted-foreground"
                    )}>{KBM_DISCOUNT[k]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Unlimited drivers */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <Switch checked={unlimitedDrivers} onCheckedChange={setUnlimitedDrivers} id="unlimited" />
              <div>
                <Label htmlFor="unlimited" className="cursor-pointer font-medium">Без ограничения числа водителей</Label>
                <p className="text-xs text-muted-foreground mt-0.5">КО = 1.94, КВС не применяется</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coefficients breakdown */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Расчёт по коэффициентам</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {coefficients.map((c, i) => (
                <div key={c.label} className={cn(
                  "flex items-center justify-between py-2.5 text-sm",
                  i < coefficients.length - 1 && "border-b border-border/50"
                )}>
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className={cn("font-semibold tabular-nums",
                    !c.neutral && typeof c.value === "number" && c.value > 1 ? "text-destructive" :
                    !c.neutral && typeof c.value === "number" && c.value < 1 ? "text-[hsl(var(--success))]" : ""
                  )}>{c.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-border font-semibold text-base">
                <span>Итого</span>
                <span className="text-primary">{fmt(result.total)} ₽</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
