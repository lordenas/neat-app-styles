import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Шаги для Stepper-компонента.
 * Каждый шаг имеет метку и описание.
 */
const steps = [
  { label: "Параметры кредита", description: "Сумма, срок, ставка" },
  { label: "Досрочные погашения", description: "Разовые и регулярные" },
  { label: "Дополнительно", description: "Каникулы, страховка" },
  { label: "Результат", description: "График и переплата" },
];

/**
 * Витрина Progress bar и Stepper.
 * Progress — стандартный индикатор прогресса (0–100%).
 * Stepper — пошаговый визард с кружками, коннекторами и навигацией Назад/Далее.
 *
 * @example
 * ```tsx
 * <Progress value={60} className="h-2" />
 * ```
 */
export function ProgressShowcase() {
  const [progress, setProgress] = useState(45);
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Progress bar</p>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 25))}>
            −25%
          </Button>
          <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 25))}>
            +25%
          </Button>
          <span className="text-sm text-muted-foreground font-mono">{progress}%</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Stepper</p>
        <div className="flex items-start gap-0">
          {steps.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} className="flex-1 flex flex-col items-center text-center relative">
                {/* Connector line */}
                {i > 0 && (
                  <div
                    className={cn(
                      "absolute top-4 -left-1/2 w-full h-0.5",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                {/* Circle */}
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "relative z-10 flex items-center justify-center h-8 w-8 rounded-full border-2 text-xs font-semibold transition-colors",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary bg-background"
                        : "border-border text-muted-foreground bg-background"
                  )}
                  aria-label={`Шаг ${i + 1}: ${s.label}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                <p className={cn(
                  "text-xs mt-1.5 font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">{s.description}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 justify-center pt-2">
          <Button size="sm" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Назад
          </Button>
          <Button size="sm" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
}
