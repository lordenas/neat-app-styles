import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Car, Building2, Info, TrendingUp } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";
import { calcRastamozhka, type RastamozhkaInput } from "@/lib/calculators/rastamozhka";

const AGE_GROUPS = [
  { value: "new",  label: "Новый" },
  { value: "1-3",  label: "1–3 года" },
  { value: "3-5",  label: "3–5 лет" },
  { value: "5-7",  label: "5–7 лет" },
  { value: "7+",   label: "7+ лет" },
] as const;

const IMPORTER_TYPES = [
  { value: "individual", label: "Физическое лицо", icon: Car },
  { value: "legal",      label: "Юридическое лицо", icon: Building2 },
] as const;

function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function RatioBar({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <div className="space-y-1.5">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted gap-0.5">
        {items.filter(i => i.value > 0).map((item, idx) => (
          <div
            key={idx}
            className={cn("transition-all", item.color)}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.filter(i => i.value > 0).map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-sm shrink-0", item.color)} />
            {item.label} — {Math.round((item.value / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RastamozhkaCalculator() {
  const [priceEur, setPriceEur]         = useState(15000);
  const [engineVolume, setEngineVolume] = useState(2000);
  const [horsePower, setHorsePower]     = useState(150);
  const [ageGroup, setAgeGroup]         = useState<RastamozhkaInput["ageGroup"]>("3-5");
  const [importerType, setImporterType] = useState<"individual" | "legal">("individual");
  const [eurRate, setEurRate]           = useState(100);
  const [infoOpen, setInfoOpen]         = useState(false);

  const input: RastamozhkaInput = { priceEur, engineVolume, horsePower, ageGroup, importerType, eurRate };
  const result = calcRastamozhka(input);

  const priceRub  = Math.round(priceEur * eurRate);
  const totalCost = priceRub + result.total;

  const breakdownItems = [
    { label: "Таможенный сбор",  value: result.customsFee,    color: "bg-primary/70" },
    { label: "Пошлина",          value: result.duty,           color: "bg-primary" },
    { label: "Утильсбор",        value: result.recyclingFee,   color: "bg-amber-500" },
    { label: "Акциз",            value: result.excise,         color: "bg-destructive/70" },
    { label: "НДС",              value: result.vat,            color: "bg-destructive" },
  ];

  const ratioItems = [
    { label: "Стоимость авто",  value: priceRub,       color: "bg-muted-foreground/40" },
    { label: "Таможенные расходы", value: result.total, color: "bg-primary" },
  ];

  return (
    <CalculatorLayout calculatorId="rastamozhka-auto" categoryName="Автомобильные" categoryPath="/categories/automotive">
      <div className="space-y-5">

        {/* Тип ввозящего */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Кто ввозит автомобиль?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {IMPORTER_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setImporterType(t.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 py-3 px-4 text-sm font-medium transition-all",
                      importerType === t.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          {/* Параметры */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Параметры автомобиля</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Возраст */}
                <div className="space-y-2">
                  <Label>Возраст автомобиля</Label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setAgeGroup(g.value as RastamozhkaInput["ageGroup"])}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                          ageGroup === g.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="vol">Объём двигателя, куб. см</Label>
                    <Input id="vol" type="number" value={engineVolume}
                      onChange={(e) => setEngineVolume(+e.target.value)} min={1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hp">Мощность, л.с.</Label>
                    <Input id="hp" type="number" value={horsePower}
                      onChange={(e) => setHorsePower(+e.target.value)} min={1} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Стоимость и курс</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Стоимость автомобиля, €</Label>
                    <Input id="price" type="number" value={priceEur}
                      onChange={(e) => setPriceEur(+e.target.value)} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="eur">Курс EUR/RUB</Label>
                    <Input id="eur" type="number" value={eurRate}
                      onChange={(e) => setEurRate(+e.target.value)} min={1} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Стоимость в рублях: <span className="font-semibold text-foreground">{fmt(priceRub)}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Результаты */}
          <div className="space-y-4">
            {/* Hero */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Итого таможенные расходы</p>
                <p className="text-4xl font-bold text-primary">{fmt(result.total)}</p>
                <div className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Итоговая стоимость авто: <strong className="text-foreground">{fmt(totalCost)}</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Разбивка */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Разбивка расходов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {breakdownItems.map((item) => item.value > 0 && (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-sm shrink-0", item.color)} />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">{fmt(item.value)}</Badge>
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between text-sm font-semibold">
                  <span>Итого</span>
                  <span className="text-primary">{fmt(result.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Соотношение стоимости */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Структура затрат</CardTitle>
              </CardHeader>
              <CardContent>
                <RatioBar items={ratioItems} />
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Стоимость авто</span><span className="font-medium text-foreground">{fmt(priceRub)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Таможенные расходы</span><span className="font-medium text-foreground">{fmt(result.total)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold text-sm text-foreground">
                    <span>Полная стоимость</span><span>{fmt(totalCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Справка */}
            <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between p-4 text-sm font-medium hover:bg-muted/30 transition-colors rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span>Как рассчитывается растаможка?</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{infoOpen ? "Скрыть" : "Показать"}</span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 text-xs text-muted-foreground space-y-2">
                    <p><strong className="text-foreground">Таможенный сбор</strong> — фиксированная ставка от стоимости авто (775–30 000 ₽).</p>
                    <p><strong className="text-foreground">Пошлина</strong> — для физлиц единая ставка в €/куб.см, для юрлиц 15–20% от стоимости.</p>
                    <p><strong className="text-foreground">Утильсбор</strong> — базовая ставка × коэффициент (зависит от возраста и объёма двигателя).</p>
                    <p><strong className="text-foreground">Акциз и НДС</strong> — начисляются только для юридических лиц.</p>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
