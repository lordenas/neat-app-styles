import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, TrendingUp } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { calcAlimonyIndexation, PM_CHILD_HISTORY } from "@/lib/calculators/alimony-indexation";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

export default function AlimonyIndexationCalculator() {
  const [originalAmount, setOriginalAmount] = useState(10000);
  const [originalPm, setOriginalPm] = useState(PM_CHILD_HISTORY[PM_CHILD_HISTORY.length - 1].value);
  const [currentPm, setCurrentPm] = useState(PM_CHILD_HISTORY[0].value);

  const result = calcAlimonyIndexation({ originalAmount, originalPm, currentPm });

  const isGrowth = result.difference > 0;
  const isEqual  = result.difference === 0;

  const title = (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Калькулятор индексации алиментов</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Расчёт индексации алиментов при изменении прожиточного минимума (ст. 117 СК РФ)
      </p>
    </div>
  );

  return (
    <CalculatorLayout calculatorId="alimony-indexation" categoryName="Юридические" categoryPath="/categories/legal" title={title}>
      <div className="space-y-6">

        {/* Params */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Параметры расчёта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Установленная сумма алиментов (₽)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                value={formatNumberInput(originalAmount)}
                onChange={(e) => setOriginalAmount(Math.max(0, parseNumberInput(e.target.value)))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>ПМ на момент установления</Label>
                <Select value={String(originalPm)} onValueChange={(v) => setOriginalPm(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PM_CHILD_HISTORY.map((h) => (
                      <SelectItem key={h.period} value={String(h.value)}>
                        {h.period} — {h.value.toLocaleString("ru-RU")} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Текущий ПМ</Label>
                <Select value={String(currentPm)} onValueChange={(v) => setCurrentPm(+v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PM_CHILD_HISTORY.map((h) => (
                      <SelectItem key={h.period} value={String(h.value)}>
                        {h.period} — {h.value.toLocaleString("ru-RU")} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                value={`Индексированная сумма: ${fmt(result.indexedAmount)} ₽\nКоэффициент: ×${result.indexCoefficient}\nИзменение: ${result.difference > 0 ? "+" : ""}${fmt(result.difference)} ₽\nИсходная сумма: ${fmt(originalAmount)} ₽`}
                label="Скопировать"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Hero */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 dark:bg-primary/[0.04] border border-primary/10 dark:border-primary/[0.08]">
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Индексированная сумма алиментов</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{fmt(result.indexedAmount)} ₽</p>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Исходная сумма</p>
                <p className="text-base font-bold tabular-nums">{fmt(originalAmount)} ₽</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">по решению суда</p>
              </div>
              <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">Коэффициент</p>
                <p className="text-base font-bold tabular-nums">×{result.indexCoefficient}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">ПМ нов. / ПМ стар.</p>
              </div>
              <div
                className={`rounded-lg p-3.5 col-span-2 sm:col-span-1 border ${
                  isEqual
                    ? "bg-muted/50 border-border"
                    : isGrowth
                    ? "bg-[hsl(var(--success)/0.08)] dark:bg-[hsl(var(--success)/0.05)] border-[hsl(var(--success)/0.2)] dark:border-[hsl(var(--success)/0.1)]"
                    : "bg-destructive/8 dark:bg-destructive/[0.05] border-destructive/15 dark:border-destructive/[0.08]"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">Изменение</p>
                <p
                  className={`text-base font-bold tabular-nums ${
                    isEqual ? "" : isGrowth ? "text-[hsl(var(--success))]" : "text-destructive"
                  }`}
                >
                  {result.difference > 0 ? "+" : ""}{fmt(result.difference)} ₽
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">к исходной сумме</p>
              </div>
            </div>

            {/* PM comparison */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Прожиточный минимум</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 border border-border p-3.5">
                  <p className="text-xs text-muted-foreground mb-1">На момент установления</p>
                  <p className="text-base font-bold tabular-nums">{fmt(originalPm)} ₽</p>
                </div>
                <div className="rounded-lg bg-primary/5 dark:bg-primary/[0.04] border border-primary/10 dark:border-primary/[0.08] p-3.5">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <p className="text-xs text-primary font-medium">Текущий</p>
                  </div>
                  <p className="text-base font-bold tabular-nums">{fmt(currentPm)} ₽</p>
                </div>
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-md bg-muted/30 border border-border px-4 py-3 text-xs text-muted-foreground font-mono leading-relaxed">
              {fmt(originalAmount)} ₽ × ({fmt(currentPm)} ₽ / {fmt(originalPm)} ₽) = {fmt(result.indexedAmount)} ₽
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Индексация алиментов</strong> производится пропорционально росту прожиточного минимума для детей по России или субъекту РФ (ст. 117 СК РФ).
            </p>
            <p>
              Индексацию обязан производить <strong className="text-foreground">работодатель плательщика</strong> или судебный пристав-исполнитель без дополнительного обращения в суд.
            </p>
          </CardContent>
        </Card>

      </div>
    </CalculatorLayout>
  );
}
