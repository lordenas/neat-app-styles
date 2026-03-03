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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Eye } from "lucide-react";

const OPERATORS: { value: VisibilityOperator; label: string; hint: string }[] = [
  { value: "gt",          label: ">",           hint: "больше чем" },
  { value: "gte",         label: ">=",          hint: "больше или равно" },
  { value: "lt",          label: "<",           hint: "меньше чем" },
  { value: "lte",         label: "<=",          hint: "меньше или равно" },
  { value: "eq",          label: "=",           hint: "равно" },
  { value: "neq",         label: "≠",           hint: "не равно" },
  { value: "checked",     label: "включён",     hint: "чекбокс включён" },
  { value: "not_checked", label: "выключен",    hint: "чекбокс выключен" },
  { value: "in",          label: "один из",     hint: "значение входит в список (через запятую)" },
];

const CHECKBOX_OPS: VisibilityOperator[] = ["checked", "not_checked"];
const VALUE_OPS: VisibilityOperator[] = ["gt", "gte", "lt", "lte", "eq", "neq", "in"];

interface ConditionEditorProps {
  visibility: VisibilityConfig | null | undefined;
  onChange: (v: VisibilityConfig | null) => void;
  /** Все остальные поля (не текущее) для выбора источника */
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

  const needsValue = (op: VisibilityOperator) => VALUE_OPS.includes(op);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>Условия отображения</span>
        </div>
        {config.rules.length > 1 && (
          <div className="flex gap-1">
            {(["AND", "OR"] as const).map((l) => (
              <button
                key={l}
                onClick={() => update({ logic: l })}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  config.logic === l
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {l === "AND" ? "Все условия" : "Любое условие"}
              </button>
            ))}
          </div>
        )}
      </div>

      {config.rules.length === 0 ? (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
          Поле всегда видимо. Добавьте условие, чтобы управлять его отображением.
        </p>
      ) : (
        <div className="space-y-2">
          {config.rules.map((rule, i) => {
            const srcField = getFieldById(rule.fieldId);
            const isCheckboxField = srcField?.type === "checkbox";
            const relevantOps = isCheckboxField
              ? OPERATORS.filter((o) => CHECKBOX_OPS.includes(o.value))
              : OPERATORS.filter((o) => !CHECKBOX_OPS.includes(o.value));

            return (
              <div key={i} className="flex gap-2 items-start">
                {i > 0 && (
                  <Badge variant="outline" className="mt-2 text-xs shrink-0">
                    {config.logic}
                  </Badge>
                )}
                {/* Source field */}
                <Select
                  value={rule.fieldId}
                  onValueChange={(v) => {
                    const selectedField = otherFields.find((f) => f.id === v);
                    const defaultOp = selectedField?.type === "checkbox" ? "checked" : "gt";
                    updateRule(i, { fieldId: v, operator: defaultOp, value: "" });
                  }}
                >
                  <SelectTrigger className={`h-8 text-xs flex-1 min-w-0 ${!rule.fieldId ? "text-muted-foreground" : ""}`}>
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

                {/* Operator */}
                <Select
                  value={rule.operator}
                  onValueChange={(v) => updateRule(i, { operator: v as VisibilityOperator })}
                >
                  <SelectTrigger className="h-8 text-xs w-28 shrink-0">
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

                {/* Value */}
                {needsValue(rule.operator) && (
                  <Input
                    className="h-8 text-xs w-24 shrink-0"
                    value={String(rule.value)}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    placeholder={rule.operator === "in" ? "a,b,c" : "значение"}
                  />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRule(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={addRule}
        disabled={otherFields.length === 0}
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Добавить условие
      </Button>
    </div>
  );
}
