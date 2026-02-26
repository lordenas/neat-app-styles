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
import { Car, MapPin, Shield, Clock, Zap, Plus, Trash2, User, Users } from "lucide-react";
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

  const worstKvs = unlimitedDrivers ? 1.94
    : drivers.length === 0 ? 1.0
    : Math.max(...drivers.map((d) => getKvs(d.age, d.experience)));

  const input: OsagoInput = {
    category, horsePower, regionCode,
    driverAge: drivers[0]?.age ?? 35,
    driverExperience: drivers[0]?.experience ?? 10,
    kbmClass, usagePeriod, unlimitedDrivers,
  };
  const baseResult = calcOsago(input);
  const { baseTariff, kt, kbm, km, ks, ko } = baseResult;
  const kvs = worstKvs;
  const total = Math.round(baseTariff * kt * kvs * kbm * km * ks * ko);

  const addDriver = () => setDrivers([...drivers, { age: 25, experience: 3 }]);
  const removeDriver = (i: number) => setDrivers(drivers.filter((_, j) => j !== i));
  const updateDriver = (i: number, field: keyof Driver, val: number) => {
    const arr = [...drivers]; arr[i] = { ...arr[i], [field]: val }; setDrivers(arr);
  };

  const coefficients = [
    { label: "Базовый тариф", value: `${fmt(baseTariff)} ₽`, neutral: true },
    { label: "КТ (регион)", value: kt },
    { label: "КВС (возраст/стаж)", value: kvs },
    { label: "КБМ (бонус-малус)", value: kbm },
    ...(category === "B" ? [{ label: "КМ (мощность)", value: km }] : []),
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
              Базовый тариф: {fmt(baseTariff)} ₽ · {REGION_NAMES[regionCode] ?? regionCode}
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

        {/* Parameters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Параметры ТС
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
