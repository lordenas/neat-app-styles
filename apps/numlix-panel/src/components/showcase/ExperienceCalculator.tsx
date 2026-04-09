import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Plus, X } from "lucide-react";

interface Period {
  id: number;
  startDate: string;
  endDate: string;
  comment: string;
}

export function ExperienceCalculator() {
  const [initialYears, setInitialYears] = useState("");
  const [initialMonths, setInitialMonths] = useState("");
  const [initialDays, setInitialDays] = useState("");
  const [periods, setPeriods] = useState<Period[]>([
    { id: 1, startDate: "", endDate: "", comment: "" },
  ]);
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

  const addPeriod = () => {
    setPeriods((prev) => [...prev, { id: Date.now(), startDate: "", endDate: "", comment: "" }]);
  };

  const removePeriod = (id: number) => {
    if (periods.length > 1) {
      setPeriods((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const updatePeriod = (id: number, field: keyof Period, value: string) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const calculate = () => {
    let totalDays = (parseInt(initialYears) || 0) * 365 + (parseInt(initialMonths) || 0) * 30 + (parseInt(initialDays) || 0);

    periods.forEach((p) => {
      if (p.startDate && p.endDate) {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 0) totalDays += diff;
      }
    });

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    setResult({ years, months, days });
  };

  return (
    <div className="space-y-5">
      {/* Initial experience */}
      <div className="form-section">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Label className="sm:w-48 shrink-0">Первоначальный стаж</Label>
          <div className="flex gap-2">
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={initialYears}
                onChange={(e) => setInitialYears(e.target.value)}
                className="w-20 pr-10"
                min={0}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">лет</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={initialMonths}
                onChange={(e) => setInitialMonths(e.target.value)}
                className="w-24 pr-12"
                min={0}
                max={11}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">мес</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={initialDays}
                onChange={(e) => setInitialDays(e.target.value)}
                className="w-24 pr-12"
                min={0}
                max={30}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">дней</span>
            </div>
          </div>
        </div>
      </div>

      {/* Periods */}
      <div className="form-section space-y-3">
        <div className="flex items-center gap-2">
          <Label>Периоды для расчёта</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Укажите даты начала и окончания каждого периода работы.</TooltipContent>
          </Tooltip>
        </div>

        {periods.map((period) => (
          <div key={period.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Input
              type="date"
              value={period.startDate}
              onChange={(e) => updatePeriod(period.id, "startDate", e.target.value)}
              className="w-40"
            />
            <span className="text-muted-foreground hidden sm:inline">—</span>
            <Input
              type="date"
              value={period.endDate}
              onChange={(e) => updatePeriod(period.id, "endDate", e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Комментарий"
              value={period.comment}
              onChange={(e) => updatePeriod(period.id, "comment", e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePeriod(period.id)}
              disabled={periods.length === 1}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={addPeriod} className="text-primary">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Добавить период
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={calculate}>Рассчитать</Button>
      </div>

      {/* Result */}
      {result && (
        <div className="form-section animate-fade-in">
          <h4 className="mb-2">Результат</h4>
          <p className="text-lg">
            <span className="font-semibold">{result.years}</span> лет{" "}
            <span className="font-semibold">{result.months}</span> месяцев{" "}
            <span className="font-semibold">{result.days}</span> дней
          </p>
        </div>
      )}
    </div>
  );
}
