import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Car, MapPin, Shield, Clock, Zap, Plus, Trash2, User, Users, Info } from "lucide-react";
import {
  calcOsago, POPULAR_REGIONS, REGION_NAMES, BASE_TARIFF_CORRIDORS,
  type OsagoInput, type VehicleCategory,
} from "@/lib/calculators/osago";
import { cn } from "@/lib/utils";

const fmt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));

const CATEGORY_GROUPS: { label: string; items: { value: VehicleCategory; label: string; icon: string; short: string }[] }[] = [
  {
    label: "Легковые и мото",
    items: [
      { value: "B",   label: "Легковой",        short: "B",      icon: "🚗" },
      { value: "A",   label: "Мотоцикл",        short: "A/M",    icon: "🏍️" },
      { value: "taxi",label: "Такси",            short: "Такси",  icon: "🚕" },
    ],
  },
  {
    label: "Грузовые",
    items: [
      { value: "C",       label: "до 16 т",    short: "C",       icon: "🚛" },
      { value: "C_heavy", label: "свыше 16 т", short: "C тяж.",  icon: "🚚" },
    ],
  },
  {
    label: "Автобусы",
    items: [
      { value: "D",        label: ">16 мест",         short: "D",      icon: "🚌" },
      { value: "D_small",  label: "≤16 мест",         short: "D мал.", icon: "🚐" },
      { value: "D_regular",label: "Регулярные",        short: "D рег.", icon: "🚍" },
    ],
  },
  {
    label: "Спецтехника",
    items: [
      { value: "tractor",    label: "Трактор / спецтехника", short: "Трактор",   icon: "🚜" },
      { value: "trolleybus", label: "Троллейбус",             short: "Троллейб.", icon: "🚎" },
    ],
  },
];

const HP_PRESETS = [70, 100, 120, 150, 200];
const KBM_CLASSES = Array.from({ length: 14 }, (_, i) => i);

const KBM_DISCOUNT: Record<number, string> = {
  0: "надб.", 1: "надб.", 2: "надб.", 3: "надб.", 4: "0%",
  5: "−5%", 6: "−10%", 7: "−15%", 8: "−20%", 9: "−25%",
  10: "−30%", 11: "−35%", 12: "−40%", 13: "−50%",
};

function getKvs(age: number, exp: number): number {
  if (age <= 22 && exp <= 3) return 1.93;
  if (age <= 22) return 1.66;
  if (age <= 25 && exp <= 3) return 1.79;
  if (age <= 25) return 1.04;
  if (exp <= 3) return 1.63;
  if (age <= 30) return 1.04;
  if (age <= 35) return 1.01;
  if (age <= 40) return 0.96;
  if (age <= 50) return 0.96;
  if (age <= 60) return 0.93;
  return 0.90;
}

type Driver = { age: number; experience: number };

export default function OsagoCalculator() {
  const [category, setCategory] = useState<VehicleCategory>("B");
  const [horsePower, setHorsePower] = useState(120);
  const [regionCode, setRegionCode] = useState("77");
  const [kbmClass, setKbmClass] = useState(4);
  const [usagePeriod, setUsagePeriod] = useState(12);
  const [unlimitedDrivers, setUnlimitedDrivers] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([{ age: 35, experience: 10 }]);
  const [customBaseTariff, setCustomBaseTariff] = useState<number | null>(null);

  const corridor = BASE_TARIFF_CORRIDORS[category];
  const [corridorMin, corridorMax] = corridor;
  const midTariff = Math.round((corridorMin + corridorMax) / 2);
  const activeTariff = customBaseTariff ?? midTariff;

  // Reset custom tariff when category changes
  const handleCategoryChange = (v: VehicleCategory) => {
    setCategory(v);
    setCustomBaseTariff(null);
  };

  const worstKvs = unlimitedDrivers ? 1.94
    : drivers.length === 0 ? 1.0
    : Math.max(...drivers.map((d) => getKvs(d.age, d.experience)));

  const input: OsagoInput = {
    category, horsePower, regionCode,
    driverAge: drivers[0]?.age ?? 35,
    driverExperience: drivers[0]?.experience ?? 10,
    kbmClass, usagePeriod, unlimitedDrivers,
  };
  const baseResult = calcOsago({ ...input, customBaseTariff: activeTariff });
  const { kt, kbm, km, ks, ko } = baseResult;
  const kvs = worstKvs;
  const total = Math.round(activeTariff * kt * kvs * kbm * km * ks * ko);
  const totalMin = Math.round(corridorMin * kt * kvs * kbm * km * ks * ko);
  const totalMax = Math.round(corridorMax * kt * kvs * kbm * km * ks * ko);

  const addDriver = () => setDrivers([...drivers, { age: 25, experience: 3 }]);
  const removeDriver = (i: number) => setDrivers(drivers.filter((_, j) => j !== i));
  const updateDriver = (i: number, field: keyof Driver, val: number) => {
    const arr = [...drivers]; arr[i] = { ...arr[i], [field]: val }; setDrivers(arr);
  };

  const coefficients = [
    { label: "Базовый тариф", value: `${fmt(activeTariff)} ₽`, neutral: true },
    { label: "КТ (регион)", value: kt },
    { label: "КВС (возраст/стаж)", value: kvs },
    { label: "КБМ (бонус-малус)", value: kbm },
    ...(["B", "A"].includes(category) ? [{ label: "КМ (мощность)", value: km }] : []),
    { label: "КС (период)", value: ks },
    ...(unlimitedDrivers ? [{ label: "КО (без огр.)", value: ko }] : []),
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

        {/* Hero */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Стоимость полиса ОСАГО</span>
            </div>
            <p className="text-4xl font-bold tracking-tight">{fmt(total)} ₽</p>
            <p className="text-sm text-muted-foreground mt-1">
              Базовый тариф: {fmt(activeTariff)} ₽ · {REGION_NAMES[regionCode] ?? regionCode}
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

        {/* Price range banner */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Диапазон стоимости</p>
            <p className="text-2xl font-bold mt-0.5 tabular-nums">
              {fmt(totalMin)} ₽ — {fmt(totalMax)} ₽
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Страховые компании могут устанавливать свою стоимость полиса в пределах этого диапазона.
            </p>
          </div>
          <div className="text-xs text-muted-foreground shrink-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-16 text-right font-medium">Мин:</span>
              <span>{fmt(corridorMin)} ₽ × коэф.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-right font-medium">Макс:</span>
              <span>{fmt(corridorMax)} ₽ × коэф.</span>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Параметры ТС
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label>Категория ТС</Label>
              <div className="space-y-3">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => handleCategoryChange(c.value)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                            category === c.value
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50"
                          )}>
                          <span className="text-base leading-none">{c.icon}</span>
                          <span>{c.label}</span>
                          {category === c.value && (
                            <span className="text-xs bg-primary/20 text-primary rounded px-1 font-bold">{c.short}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Базовый тариф */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Базовый тариф (в коридоре ЦБ)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums text-primary">{fmt(activeTariff)} ₽</span>
                  {customBaseTariff !== null && (
                    <button onClick={() => setCustomBaseTariff(null)}
                      className="text-xs text-muted-foreground hover:text-foreground underline">сброс</button>
                  )}
                </div>
              </div>
              <Slider
                min={corridorMin} max={corridorMax} step={1}
                value={[activeTariff]}
                onValueChange={([v]) => setCustomBaseTariff(v)}
                className="w-full"
              />
              <div className="grid grid-cols-3 text-xs text-muted-foreground">
                <button onClick={() => setCustomBaseTariff(corridorMin)}
                  className="text-left hover:text-primary transition-colors">
                  <span className="block font-medium">Мин</span>
                  <span>{fmt(corridorMin)} ₽</span>
                </button>
                <button onClick={() => setCustomBaseTariff(midTariff)}
                  className="text-center hover:text-primary transition-colors">
                  <span className="block font-medium">Середина</span>
                  <span>{fmt(midTariff)} ₽</span>
                </button>
                <button onClick={() => setCustomBaseTariff(corridorMax)}
                  className="text-right hover:text-primary transition-colors">
                  <span className="block font-medium">Макс</span>
                  <span>{fmt(corridorMax)} ₽</span>
                </button>
              </div>
            </div>

            {/* Регион и мощность */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Регион</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POPULAR_REGIONS.map((c) => (
                      <SelectItem key={c} value={c}>{REGION_NAMES[c] ?? c} (КТ {({
                        "77":1.9,"78":1.72,"50":1.63,"16":1.95,"23":1.43,"52":1.55,"54":1.54,
                        "61":1.43,"63":1.54,"66":1.72,"74":1.68,"24":1.43,"25":1.43,"34":1.32,
                        "72":1.55,"55":1.43,"59":1.43
                      } as Record<string,number>)[c] ?? "–"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {["B", "A"].includes(category) && (
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
            </div>

            {/* Период использования */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Период использования
                </Label>
                <span className="text-xs text-muted-foreground">КС = {ks}</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                  const ksVal = m <= 3 ? 0.5 : m === 4 ? 0.6 : m === 5 ? 0.65 : m === 6 ? 0.7 :
                    m === 7 ? 0.8 : m === 8 ? 0.9 : m === 9 ? 0.95 : 1.0;
                  return (
                    <button key={m} onClick={() => setUsagePeriod(m)}
                      className={cn(
                        "flex flex-col items-center rounded-lg border py-2 px-1 text-xs font-medium transition-all",
                        usagePeriod === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}>
                      <span className="font-bold">{m}</span>
                      <span className={cn("text-[10px]", ksVal < 1 ? "text-[hsl(var(--success))]" : "text-muted-foreground")}>
                        {ksVal < 1 ? `×${ksVal}` : "×1"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <details className="group">
                <summary className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none select-none">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Как работает коэффициент сезонности?
                  <span className="ml-auto text-[10px] group-open:hidden">▼</span>
                  <span className="ml-auto text-[10px] hidden group-open:inline">▲</span>
                </summary>
                <div className="mt-2 rounded-lg bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>Срок, на который оформляется полис. При оформлении менее чем на год применяется понижающий коэффициент сезонности (КС).</p>
                  <p className="text-[10px] opacity-70">Регулируется постановлениями Правительства РФ.</p>
                </div>
              </details>
            </div>

            <div className="space-y-1.5">
              <Label>Класс КБМ (бонус-малус)</Label>
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
              {/* КБМ info block */}
              <details className="group mt-1">
                <summary className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none select-none">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Как определяется КБМ?
                  <span className="ml-auto text-[10px] group-open:hidden">▼</span>
                  <span className="ml-auto text-[10px] hidden group-open:inline">▲</span>
                </summary>
                <div className="mt-2 rounded-lg bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>КБМ понижает или повышает стоимость полиса в зависимости от безаварийной езды. Страховые компании применяют сведения АИС РСА при заключении договора ОСАГО.</p>
                  <p>При первом оформлении присваивается <strong className="text-foreground">класс 3 (КБМ = 1,17)</strong>. Всего 14 классов: от М (надбавка, КБМ = 3,92) до 13 (скидка −54%, КБМ = 0,46).</p>
                  <p>Пересчёт производится <strong className="text-foreground">1 апреля каждого года</strong>. При нуле аварий класс ежегодно повышается на 1. При авариях по вине — снижается по таблице ЦБ РФ.</p>
                  <p className="text-[10px] opacity-70">Регламентировано ст. 9 ФЗ № 40 «Об ОСАГО» и Указанием Банка России от 04.09.2018 № 4884-У.</p>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* Drivers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" /> Водители
                {!unlimitedDrivers && drivers.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    КВС = {kvs.toFixed(2)} (наихудший)
                  </span>
                )}
              </CardTitle>
              {!unlimitedDrivers && (
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addDriver}>
                  <Plus className="h-3 w-3" /> Добавить водителя
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <Switch checked={unlimitedDrivers} onCheckedChange={setUnlimitedDrivers} id="unlimited" />
              <div>
                <Label htmlFor="unlimited" className="cursor-pointer font-medium">Без ограничения числа водителей</Label>
                <p className="text-xs text-muted-foreground mt-0.5">КО = 1.94 · КВС не применяется</p>
              </div>
            </div>

            {!unlimitedDrivers && (
              <div className="space-y-2">
                {drivers.map((d, i) => {
                  const dKvs = getKvs(d.age, d.experience);
                  const isWorst = drivers.length > 1 && dKvs === Math.max(...drivers.map((x) => getKvs(x.age, x.experience)));
                  return (
                    <div key={i} className={cn(
                      "flex items-end gap-3 p-3 rounded-lg border bg-muted/20 transition-colors",
                      isWorst ? "border-destructive/40" : "border-border"
                    )}>
                      <div className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 mb-0.5",
                        isWorst ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      )}>
                        {i + 1}
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> Возраст
                        </Label>
                        <Input type="number" value={d.age} min={18} max={99} className="h-8 text-sm"
                          onChange={(e) => updateDriver(i, "age", +e.target.value)} />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Label className="text-xs text-muted-foreground">Стаж (лет)</Label>
                        <Input type="number" value={d.experience} min={0} className="h-8 text-sm"
                          onChange={(e) => updateDriver(i, "experience", +e.target.value)} />
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium shrink-0 mb-0.5",
                        dKvs > 1 ? "bg-destructive/10 text-destructive" :
                        dKvs < 1 ? "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"
                      )}>
                        КВС {dKvs.toFixed(2)}{isWorst ? " ⚠" : ""}
                      </div>
                      {drivers.length > 1 && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeDriver(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                <span className="text-primary">{fmt(total)} ₽</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coefficients reference */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Справочник коэффициентов</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="kt">
                <AccordionTrigger className="text-sm font-medium py-3">КТ — Коэффициент территории</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Зависит от региона регистрации транспортного средства. Утверждается Банком России для каждого субъекта РФ; в некоторых регионах различается по городам (например, Краснодарский край).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="km">
                <AccordionTrigger className="text-sm font-medium py-3">КМ — Коэффициент мощности двигателя</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>Применяется для легковых автомобилей и мототранспорта. Зависит от мощности двигателя в л.с.: чем выше мощность, тем выше коэффициент. Для грузовиков, автобусов и т.п. не применяется (равен 1).</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full border-collapse mt-2">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 pr-4 font-medium">Мощность, л.с.</th>
                          <th className="text-right py-1.5 font-medium">КМ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[["до 50", "0,6"], ["51–70", "1,0"], ["71–100", "1,1"], ["101–120", "1,2"], ["121–150", "1,4"], ["свыше 150", "1,6"]].map(([r, v]) => (
                          <tr key={r} className="border-b border-border/40">
                            <td className="py-1.5 pr-4 text-muted-foreground">{r}</td>
                            <td className="py-1.5 text-right font-medium">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="kvs">
                <AccordionTrigger className="text-sm font-medium py-3">КВС — Коэффициент возраст/стаж</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
                  <p>Для неограниченного числа водителей не применяется — вместо него действует КО. При нескольких водителях применяется наихудший (наибольший) КВС среди всех.</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 pr-3 font-medium">Возраст</th>
                          <th className="text-right py-1.5 pr-2 font-medium">Стаж ≤3</th>
                          <th className="text-right py-1.5 pr-2 font-medium">Стаж 4–6</th>
                          <th className="text-right py-1.5 font-medium">Стаж 7+</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["16–22", "1,93", "1,66", "1,66"],
                          ["23–25", "1,79", "1,04", "1,04"],
                          ["26–30", "1,63", "1,04", "1,04"],
                          ["31–35", "1,63", "1,01", "1,01"],
                          ["36–40", "1,63", "0,96", "0,96"],
                          ["41–50", "1,63", "0,96", "0,96"],
                          ["51–60", "1,63", "0,93", "0,93"],
                          ["60+",   "1,63", "0,90", "0,90"],
                        ].map(([age, s1, s2, s3]) => (
                          <tr key={age} className="border-b border-border/40">
                            <td className="py-1.5 pr-3 text-muted-foreground">{age}</td>
                            <td className="py-1.5 pr-2 text-right text-destructive font-medium">{s1}</td>
                            <td className="py-1.5 pr-2 text-right">{s2}</td>
                            <td className="py-1.5 text-right">{s3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ko">
                <AccordionTrigger className="text-sm font-medium py-3">КО — Коэффициент ограничения</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>1 — в полисе указаны конкретные водители; 1,94 — физлицо без ограничений; 1,97 — юрлицо без ограничений. Полис «без ограничений» существенно дороже.</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full border-collapse mt-1">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 pr-4 font-medium">Условие</th>
                          <th className="text-right py-1.5 font-medium">КО</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[["Указаны конкретные водители", "1,00"], ["Без ограничений (физлицо)", "1,94"], ["Без ограничений (юрлицо)", "1,97"]].map(([r, v]) => (
                          <tr key={r} className="border-b border-border/40">
                            <td className="py-1.5 pr-4 text-muted-foreground">{r}</td>
                            <td className="py-1.5 text-right font-medium">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ks">
                <AccordionTrigger className="text-sm font-medium py-3">КС — Коэффициент сезонности</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>При оформлении полиса менее чем на год применяется понижающий коэффициент.</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full border-collapse mt-1">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 pr-4 font-medium">Период</th>
                          <th className="text-right py-1.5 font-medium">КС</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[["3 мес.", "0,50"], ["4 мес.", "0,60"], ["5 мес.", "0,65"], ["6 мес.", "0,70"], ["7 мес.", "0,80"], ["8 мес.", "0,90"], ["9 мес.", "0,95"], ["10–12 мес.", "1,00"]].map(([r, v]) => (
                          <tr key={r} className="border-b border-border/40">
                            <td className="py-1.5 pr-4 text-muted-foreground">{r}</td>
                            <td className="py-1.5 text-right font-medium">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="kbm">
                <AccordionTrigger className="text-sm font-medium py-3">КБМ — Коэффициент бонус-малус</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  <p>Зависит от класса водителя (от М до 13) и количества ДТП по вине. При неограниченном списке водителей применяется КБМ собственника. Класс можно проверить в базе РСА.</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full border-collapse mt-1">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 pr-4 font-medium">Класс</th>
                          <th className="text-right py-1.5 pr-4 font-medium">КБМ</th>
                          <th className="text-right py-1.5 font-medium">Скидка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["М (0)", "2,45", "+145%"], ["1", "2,30", "+130%"], ["2", "1,55", "+55%"], ["3", "1,40", "+40%"],
                          ["4", "1,00", "0%"], ["5", "0,95", "−5%"], ["6", "0,90", "−10%"], ["7", "0,85", "−15%"],
                          ["8", "0,80", "−20%"], ["9", "0,75", "−25%"], ["10", "0,70", "−30%"], ["11", "0,65", "−35%"],
                          ["12", "0,60", "−40%"], ["13", "0,50", "−50%"],
                        ].map(([cls, kbm, disc]) => (
                          <tr key={cls} className="border-b border-border/40">
                            <td className="py-1 pr-4 text-muted-foreground">{cls}</td>
                            <td className="py-1 pr-4 text-right font-medium">{kbm}</td>
                            <td className={cn("py-1 text-right font-medium text-xs",
                              disc.startsWith("−") ? "text-[hsl(var(--success))]" : disc === "0%" ? "" : "text-destructive"
                            )}>{disc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
