import { useState, useMemo } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type DduPenaltyInput,
  type DduPayerType,
  type ApplyRateType,
  calcDduPenalty,
  DDU_MORATORIUM_PERIODS,
} from "@/lib/calculators/ddu-penalty";
import type { KeyRateEntry } from "@/lib/calculators/peni";
import keyRateData from "@/data/key-rate-ru.json";
import { formatNumberInput, parseNumberInput } from "@/lib/calculators/format-utils";

const fmt = (v: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const applyRateLabels: Record<ApplyRateType, string> = {
  on_transfer_day: "На дату передачи",
  on_obligation_day: "На дату обязательства",
  by_period: "По периодам",
};

export default function PenaltyDduCalculatorPage() {
  const [price, setPrice] = useState(5000000);
  const [contractTransferDate, setContractTransferDate] = useState("2023-06-30");
  const [actualTransferDate, setActualTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doNotShiftDeadline, setDoNotShiftDeadline] = useState(false);
  const [applyRate, setApplyRate] = useState<ApplyRateType>("by_period");
  const [payerType, setPayerType] = useState<DduPayerType>("individual");

  const rates = keyRateData.rates as KeyRateEntry[];

  const result = useMemo(() => {
    const input: DduPenaltyInput = { price, contractTransferDate, actualTransferDate, doNotShiftDeadline, applyRate, payerType };
    return calcDduPenalty(input, rates);
  }, [price, contractTransferDate, actualTransferDate, doNotShiftDeadline, applyRate, payerType, rates]);

  return (
    <CalculatorLayout calculatorId="penalty-ddu" categoryName="Налоги" categoryPath="/#categories">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Неустойка по ДДУ (214-ФЗ)</h1>
          <p className="text-muted-foreground mt-1">
            Расчёт неустойки за просрочку передачи квартиры по договору долевого участия
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Цена по договору (₽)</Label>
                <Input type="text" inputMode="numeric"
                  value={formatNumberInput(price)}
                  onChange={(e) => setPrice(Math.max(0, parseNumberInput(e.target.value)))} />
              </div>

              <div className="space-y-1.5">
                <Label>Дата передачи по ДДУ</Label>
                <Input type="date" value={contractTransferDate} onChange={(e) => setContractTransferDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Фактическая дата передачи</Label>
                <Input type="date" value={actualTransferDate} onChange={(e) => setActualTransferDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Плательщик</Label>
                <div className="flex gap-2">
                  <Badge variant={payerType === "individual" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setPayerType("individual")}>
                    Физлицо (1/150)
                  </Badge>
                  <Badge variant={payerType === "legal" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5" onClick={() => setPayerType("legal")}>
                    Юрлицо (1/300)
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Применение ставки ЦБ</Label>
                <Select value={applyRate} onValueChange={(v) => setApplyRate(v as ApplyRateType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(applyRateLabels) as ApplyRateType[]).map((k) => (
                      <SelectItem key={k} value={k}>{applyRateLabels[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="no-shift" checked={doNotShiftDeadline} onCheckedChange={(v) => setDoNotShiftDeadline(!!v)} />
                <Label htmlFor="no-shift" className="text-sm">Не переносить срок (ст. 193 ГК)</Label>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Начало начисления</p>
                        <p className="text-xl font-bold">{result.penaltyStartDate}</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Неустойка</p>
                        <p className="text-xl font-bold text-destructive">{fmt(result.totalPenalty)} ₽</p>
                      </div>
                    </div>

                    {result.breakdown.length > 0 && (
                      <div className="text-sm space-y-1 pt-2">
                        <p className="font-medium text-foreground">Расчёт по периодам:</p>
                        {result.breakdown.map((b, i) => (
                          <div key={i} className={`py-1.5 border-b border-border last:border-0 ${b.isMoratorium ? "opacity-50" : ""}`}>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-xs">{b.periodLabel}</span>
                              <span className="font-medium">{b.isMoratorium ? "—" : `${fmt(b.penalty)} ₽`}</span>
                            </div>
                            {b.formula && <p className="text-xs text-muted-foreground mt-0.5">{b.formula}</p>}
                            {b.comment && <p className="text-xs text-muted-foreground/70 mt-0.5">{b.comment}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Введите параметры для расчёта</p>
                )}
              </CardContent>
            </Card>

            {/* Moratoria info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Периоды мораториев</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {DDU_MORATORIUM_PERIODS.map((p, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-border last:border-0">
                    <span>{p.from} – {p.to}</span>
                    <span className="text-xs text-right max-w-[200px]">{p.comment}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">О расчёте</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <p>
                  <strong>214-ФЗ:</strong> Неустойка за просрочку передачи квартиры составляет 1/150 (физлица) или 1/300 (юрлица) ключевой ставки ЦБ за каждый день просрочки от цены договора.
                </p>
                <p>В период с 01.07.2023 по 21.03.2024 ставка ограничена 7,5% по постановлению Правительства.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
