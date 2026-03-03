import { useRef, useEffect } from "react";
import { CalcField } from "@/types/custom-calc";
import { evaluateFormula } from "@/lib/calc-engine";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormulaEditorProps {
  value: string;
  onChange: (v: string) => void;
  /** Все поля калькулятора для подстановки переменных */
  fields: CalcField[];
  /** ID текущего поля (чтобы не включать его в список переменных) */
  currentFieldId?: string;
}

const BUILTIN_FUNCTIONS = [
  { name: "round(x, n)", desc: "Округление" },
  { name: "floor(x)", desc: "Вниз" },
  { name: "ceil(x)", desc: "Вверх" },
  { name: "abs(x)", desc: "Модуль" },
  { name: "pow(x, n)", desc: "Степень" },
  { name: "sqrt(x)", desc: "Корень" },
  { name: "min(a, b)", desc: "Минимум" },
  { name: "max(a, b)", desc: "Максимум" },
  { name: "if(cond, a, b)", desc: "Условие" },
];

export function FormulaEditor({ value, onChange, fields, currentFieldId }: FormulaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Тестовые значения для валидации формулы
  const testValues: Record<string, number> = {};
  for (const f of fields) {
    if (f.type !== "result") testValues[f.key] = 100;
  }

  const previewResult = value.trim()
    ? evaluateFormula(value, testValues)
    : null;

  const isValid = previewResult !== null && !isNaN(previewResult);

  // Вставить переменную в курсор
  const insertVariable = (key: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = value.slice(0, start) + `{${key}}` + value.slice(end);
    onChange(newVal);
    // Восстановить фокус
    setTimeout(() => {
      ta.focus();
      const pos = start + key.length + 2;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const inputFields = fields.filter((f) => f.type !== "result" && f.id !== currentFieldId);

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Формула</Label>

      {/* Переменные */}
      {inputFields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {inputFields.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => insertVariable(f.key)}
              className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded px-1.5 py-0.5 transition-colors"
              title={f.label}
            >
              {"{" + f.key + "}"}
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Например: {amount} * {rate} / 100"
          className={cn(
            "w-full min-h-[80px] font-mono text-sm resize-y rounded-md border bg-background px-3 py-2",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value && !isValid && "border-destructive focus-visible:ring-destructive",
            value && isValid && "border-green-500/50 focus-visible:ring-green-500/50"
          )}
          spellCheck={false}
        />
      </div>

      {/* Превью результата */}
      {value && (
        <div className={cn(
          "text-xs px-3 py-1.5 rounded-md",
          isValid
            ? "bg-green-500/10 text-green-700 dark:text-green-400"
            : "bg-destructive/10 text-destructive"
        )}>
          {isValid
            ? `✓ Тест (все переменные = 100): ${previewResult}`
            : "✗ Ошибка в формуле"}
        </div>
      )}

      {/* Встроенные функции */}
      <details className="group">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
          <span className="group-open:hidden">▶</span>
          <span className="group-open:block hidden">▼</span>
          Доступные функции
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {BUILTIN_FUNCTIONS.map((fn) => (
            <span
              key={fn.name}
              className="font-mono text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5"
              title={fn.desc}
            >
              {fn.name}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}
