import { CalcField } from "@/types/custom-calc";
import { evaluateAllFormulas, formatResult, resolveVisibility } from "@/lib/calc-engine";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface PlayerResultProps {
  field: CalcField;
  allFields: CalcField[];
  inputValues: Record<string, number | string | boolean>;
  /** Если передан — поле использует ручной расчёт, значение уже вычислено снаружи */
  manualValue?: number | undefined;
}

export function PlayerResult({ field, allFields, inputValues, manualValue }: PlayerResultProps) {
  if (!resolveVisibility(field.visibility, inputValues, allFields)) return null;

  // Manual mode: show manualValue (undefined = not yet calculated)
  const isManual = field.config.manualCalculation;
  let value: number;

  if (isManual) {
    if (manualValue === undefined) {
      return (
        <div className="rounded-xl border p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-muted text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
              <p className="text-sm text-muted-foreground italic">Нажмите кнопку для расчёта</p>
            </div>
          </div>
        </div>
      );
    }
    value = manualValue;
  } else {
    const results = evaluateAllFormulas(allFields, inputValues);
    value = results[field.key];
  }

  const formatted = formatResult(
    value,
    field.config.format ?? "number",
    field.config.decimals ?? 2
  );

  const isValid = !isNaN(value);

  return (
    <div className={cn(
      "rounded-xl border p-4 bg-primary/5",
      !isValid && "opacity-50"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {isValid ? formatted : "—"}
          </p>
          {field.config.hint && (
            <p className="text-xs text-muted-foreground mt-1">{field.config.hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
