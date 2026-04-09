import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import {
  calcSubsistenceMinimum, PM_REGIONS, PM_BY_REGION, type PmCategory,
} from "@/lib/calculators/subsistence-minimum";

/** legacy-local-calc: no backend endpoint yet (migration gap). See apps/numlix-main/docs/MIGRATION_CALC_STATUS.md */

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

const CATEGORIES: { value: PmCategory; label: string }[] = [
  { value: "child",     label: "Дети" },
  { value: "working",   label: "Трудоспособное население" },
  { value: "pensioner", label: "Пенсионеры" },
];

export default function SubsistenceMinimumCalculator() {
  const [regionCode, setRegionCode] = useState("00");
  const [category, setCategory] = useState<PmCategory>("child");
  const [multiplier, setMultiplier] = useState(1);

  const result = calcSubsistenceMinimum({ regionCode, category, multiplier });
  const regionData = PM_BY_REGION[regionCode] ?? PM_BY_REGION["00"];

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор прожиточного минимума</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Расчёт суммы, кратной ПМ, для алиментов (ст. 83 СК РФ) и других целей
      </p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="subsistence-minimum" categoryName="Юридические" categoryPath="/categories/legal" title={title}>
      <div className="space-y-6">

        {/* Params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры расчёта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Регион</Label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PM_REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as PmCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mult">Кратность (например: 0.5, 1, 1.5)</Label>
                <Input
                  id="mult"
                  type="number"
                  value={multiplier}
                  onChange={(e) => setMultiplier(Math.max(0.1, +e.target.value))}
                  min={0.1}
                  step={0.1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Результат</CardTitle>
              <CopyButton
                value={`Сумма: ${fmt(result.resultAmount)} ₽\nПМ: ${fmt(result.pmValue)} ₽\nКатегория: ${result.categoryLabel}\nРегион: ${result.regionName}`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 dark:bg-primary/[0.04] border border-primary/10 dark:border-primary/[0.08]">
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{multiplier}× от ПМ · {result.categoryLabel}</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{fmt(result.resultAmount)} ₽</p>
                <p className="text-xs text-muted-foreground mt-1">{result.regionName}</p>
              </div>
            </div>

            {/* Stat grid — все три категории для выбранного региона */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ПМ по категориям в выбранном регионе</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(({ value, label }) => {
                  const active = value === category;
                  return (
                    <div
                      key={value}
                      className={`rounded-lg p-3.5 border transition-colors cursor-pointer ${
                        active ? "bg-primary/5 border-primary/15" : "bg-muted/50 border-border"
                      }`}
                      onClick={() => setCategory(value)}
                    >
                      <p className={`text-xs mb-1 ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</p>
                      <p className={`text-base font-bold tabular-nums ${active ? "text-primary" : ""}`}>
                        {fmt(regionData[value])} ₽
                      </p>
                      {active && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">× {multiplier} = {fmt(result.resultAmount)} ₽</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-md bg-muted/30 border border-border px-4 py-3 text-xs text-muted-foreground font-mono leading-relaxed">
              {fmt(result.pmValue)} ₽ × {multiplier} = {fmt(result.resultAmount)} ₽
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Прожиточный минимум</strong> — минимальная сумма доходов, необходимая для обеспечения нормального существования.
            </p>
            <p>
              Для расчёта алиментов в твёрдой сумме (ст. 83 СК РФ) суд привязывает выплату к кратному размеру ПМ на ребёнка в регионе проживания.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
