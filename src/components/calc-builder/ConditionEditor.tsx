import { CalcField, VisibilityConfig, VisibilityOperator, VisibilityRule } from "@/types/custom-calc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const OPERATORS: { value: VisibilityOperator; label: string; hint: string }[] = [
  { value: "gt",          label: ">",        hint: "больше чем" },
  { value: "gte",         label: ">=",       hint: "больше или равно" },
  { value: "lt",          label: "<",        hint: "меньше чем" },
  { value: "lte",         label: "<=",       hint: "меньше или равно" },
  { value: "eq",          label: "=",        hint: "равно" },
  { value: "neq",         label: "≠",        hint: "не равно" },
  { value: "checked",     label: "включён",  hint: "чекбокс включён" },
  { value: "not_checked", label: "выключен", hint: "чекбокс выключен" },
  { value: "in",          label: "один из",  hint: "через запятую" },
];

const CHECKBOX_OPS: VisibilityOperator[] = ["checked", "not_checked"];
const VALUE_OPS: VisibilityOperator[]    = ["gt", "gte", "lt", "lte", "eq", "neq", "in"];

interface ConditionEditorProps {
  visibility: VisibilityConfig | null | undefined;
  onChange: (v: VisibilityConfig | null) => void;
  otherFields: CalcField[];
}

function emptyRule(): VisibilityRule {
  return { fieldId: "", operator: "gt", value: "" };
}

export function ConditionEditor({ visibility, onChange, otherFields }: ConditionEditorProps) {
  const config: VisibilityConfig = visibility ?? { rules: [], logic: "AND" };

  const update = (partial: Partial<VisibilityConfig>) =>
    onChange({ ...config, ...partial });

  const updateRule = (i: number, partial: Partial<VisibilityRule>) => {
    const rules = config.rules.map((r, idx) => (idx === i ? { ...r, ...partial } : r));
    update({ rules });
  };

  const addRule = () => update({ rules: [...config.rules, emptyRule()] });

  const removeRule = (i: number) => {
    const rules = config.rules.filter((_, idx) => idx !== i);
    if (rules.length === 0) onChange(null);
    else update({ rules });
  };

  const getFieldById = (id: string) => otherFields.find((f) => f.id === id);
  const needsValue   = (op: VisibilityOperator) => VALUE_OPS.includes(op);

  return (
    <div className="space-y-3">

      {/* Logic toggle — shown only when 2+ rules */}
      {config.rules.length > 1 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Логика:</span>
          {(["AND", "OR"] as const).map((l) => (
            <button
              key={l}
              onClick={() => update({ logic: l })}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md border transition-colors",
                config.logic === l
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {l === "AND" ? "Все условия" : "Любое"}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {config.rules.length === 0 && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5">
          Поле всегда видимо. Добавьте условие, чтобы управлять его отображением.
        </p>
      )}

      {/* Rule cards */}
      <div className="space-y-2">
        {config.rules.map((rule, i) => {
          const srcField     = getFieldById(rule.fieldId);
          const isCheckbox   = srcField?.type === "checkbox";
          const relevantOps  = isCheckbox
            ? OPERATORS.filter((o) => CHECKBOX_OPS.includes(o.value))
            : OPERATORS.filter((o) => !CHECKBOX_OPS.includes(o.value));
          const showValue    = needsValue(rule.operator);

          return (
            <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
              {/* Badge + delete */}
              <div className="flex items-center justify-between">
                {i > 0 ? (
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {config.logic === "AND" ? "И" : "ИЛИ"}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Условие {i + 1}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRule(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Field select */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Поле</Label>
                <Select
                  value={rule.fieldId}
                  onValueChange={(v) => {
                    const sel = otherFields.find((f) => f.id === v);
                    const defaultOp = sel?.type === "checkbox" ? "checked" : "gt";
                    updateRule(i, { fieldId: v, operator: defaultOp, value: "" });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Выберите поле…" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherFields.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="text-xs">
                        <span className="font-mono text-muted-foreground mr-1">{"{" + f.key + "}"}</span>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator + value row */}
              <div className={cn("grid gap-2", showValue ? "grid-cols-2" : "grid-cols-1")}>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Оператор</Label>
                  <Select
                    value={rule.operator}
                    onValueChange={(v) => updateRule(i, { operator: v as VisibilityOperator })}
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantOps.map((op) => (
                        <SelectItem key={op.value} value={op.value} className="text-xs">
                          <span className="font-mono mr-1">{op.label}</span>
                          <span className="text-muted-foreground">{op.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showValue && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Значение</Label>
                    {srcField && (srcField.type === "select" || srcField.type === "radio") && rule.operator !== "in" ? (
                      <Select
                        value={String(rule.value)}
                        onValueChange={(v) => updateRule(i, { value: v })}
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Выберите вариант…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(srcField.config.options ?? []).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="h-8 text-xs"
                        value={String(rule.value)}
                        onChange={(e) => updateRule(i, { value: e.target.value })}
                        placeholder={rule.operator === "in" ? "a, b, c" : "значение"}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 w-full"
        onClick={addRule}
        disabled={otherFields.length === 0}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Добавить условие
      </Button>
    </div>
  );
}
