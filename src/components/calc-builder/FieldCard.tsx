import { useState } from "react";
import { CalcField, CalcFieldType, SelectOption } from "@/types/custom-calc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConditionEditor } from "./ConditionEditor";
import { FormulaEditor } from "./FormulaEditor";
import {
  GripVertical, Trash2, ChevronDown, ChevronUp,
  Hash, Type, SlidersHorizontal, List, CircleDot, ToggleLeft, Calculator, Plus, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<CalcFieldType, React.ReactNode> = {
  number:   <Hash className="h-3.5 w-3.5" />,
  text:     <Type className="h-3.5 w-3.5" />,
  slider:   <SlidersHorizontal className="h-3.5 w-3.5" />,
  select:   <List className="h-3.5 w-3.5" />,
  radio:    <CircleDot className="h-3.5 w-3.5" />,
  checkbox: <ToggleLeft className="h-3.5 w-3.5" />,
  result:   <Calculator className="h-3.5 w-3.5" />,
};

const TYPE_LABELS: Record<CalcFieldType, string> = {
  number: "Число", text: "Текст", slider: "Слайдер",
  select: "Список", radio: "Радио", checkbox: "Чекбокс", result: "Результат",
};

interface FieldCardProps {
  field: CalcField;
  allFields: CalcField[];
  onChange: (updated: CalcField) => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 30);
}

export function FieldCard({ field, allFields, onChange, onDelete, dragHandleProps }: FieldCardProps) {
  const [open, setOpen] = useState(false);
  const [condOpen, setCondOpen] = useState(false);

  const upd = (partial: Partial<CalcField>) => onChange({ ...field, ...partial });
  const updConfig = (partial: Partial<CalcField["config"]>) =>
    upd({ config: { ...field.config, ...partial } });

  const otherFields = allFields.filter((f) => f.id !== field.id);
  const hasConditions = (field.visibility?.rules?.length ?? 0) > 0;

  // Options editor for select/radio
  const options = field.config.options ?? [];
  const addOption = () =>
    updConfig({ options: [...options, { label: `Вариант ${options.length + 1}`, value: `opt${options.length + 1}` }] });
  const updateOption = (i: number, partial: Partial<SelectOption>) =>
    updConfig({ options: options.map((o, idx) => (idx === i ? { ...o, ...partial } : o)) });
  const removeOption = (i: number) =>
    updConfig({ options: options.filter((_, idx) => idx !== i) });

  return (
    <div className={cn(
      "border rounded-lg bg-card transition-shadow",
      open ? "shadow-md" : "shadow-sm hover:shadow-md"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-muted-foreground shrink-0">{TYPE_ICONS[field.type]}</span>
          <span className="font-medium text-sm truncate">{field.label || "Без названия"}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">
            {TYPE_LABELS[field.type]}
          </Badge>
          {field.key && (
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {"{" + field.key + "}"}
            </span>
          )}
          {hasConditions && (
            <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">
              условие
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Expanded settings */}
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t pt-3">
          {/* Label + Key */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Название поля</Label>
              <Input
                inputSize="sm"
                value={field.label}
                onChange={(e) => {
                  const label = e.target.value;
                  const autoKey = field.key === slugify(field.label) || field.key === ""
                    ? slugify(label) : field.key;
                  upd({ label, key: autoKey });
                }}
                placeholder="Сумма кредита"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ключ переменной</Label>
              <Input
                inputSize="sm"
                value={field.key}
                onChange={(e) => upd({ key: slugify(e.target.value) })}
                placeholder="amount"
                className="font-mono"
              />
            </div>
          </div>

          {/* Type-specific settings */}
          {(field.type === "number" || field.type === "slider") && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Мин.</Label>
                <Input inputSize="sm" type="number" value={field.config.min ?? ""} onChange={(e) => updConfig({ min: Number(e.target.value) || undefined })} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Макс.</Label>
                <Input inputSize="sm" type="number" value={field.config.max ?? ""} onChange={(e) => updConfig({ max: Number(e.target.value) || undefined })} placeholder="1000000" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Шаг</Label>
                <Input inputSize="sm" type="number" value={field.config.step ?? ""} onChange={(e) => updConfig({ step: Number(e.target.value) || undefined })} placeholder="1" />
              </div>
            </div>
          )}

          {(field.type === "number" || field.type === "text" || field.type === "slider") && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Единица измерения</Label>
                <Input inputSize="sm" value={field.config.unit ?? ""} onChange={(e) => updConfig({ unit: e.target.value })} placeholder="₽, %, лет" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Подсказка</Label>
                <Input inputSize="sm" value={field.config.hint ?? ""} onChange={(e) => updConfig({ hint: e.target.value })} placeholder="Необязательно" />
              </div>
            </div>
          )}

          {(field.type === "select" || field.type === "radio") && (
            <div className="space-y-2">
              <Label className="text-xs">Варианты</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input inputSize="sm" value={opt.label} onChange={(e) => updateOption(i, { label: e.target.value })} placeholder="Название" className="flex-1" />
                  <Input inputSize="sm" value={opt.value} onChange={(e) => updateOption(i, { value: e.target.value })} placeholder="значение" className="flex-1 font-mono" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOption(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={addOption}>
                <Plus className="h-3.5 w-3.5" /> Добавить вариант
              </Button>
            </div>
          )}

          {field.type === "result" && (
            <>
              <FormulaEditor
                value={field.formula ?? ""}
                onChange={(f) => upd({ formula: f })}
                fields={allFields}
                currentFieldId={field.id}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Формат</Label>
                  <select
                    className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
                    value={field.config.format ?? "number"}
                    onChange={(e) => updConfig({ format: e.target.value as "currency" | "percent" | "number" })}
                  >
                    <option value="number">Число</option>
                    <option value="currency">Рубли (₽)</option>
                    <option value="percent">Проценты (%)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Знаков после запятой</Label>
                  <Input inputSize="sm" type="number" value={field.config.decimals ?? 2} onChange={(e) => updConfig({ decimals: Number(e.target.value) })} min={0} max={10} />
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Conditions */}
          <Collapsible open={condOpen} onOpenChange={setCondOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full transition-colors">
                <span>{condOpen ? "▼" : "▶"}</span>
                <span>Условия отображения</span>
                {hasConditions && (
                  <Badge variant="outline" className="text-[10px] px-1.5 ml-auto">
                    {field.visibility!.rules.length} усл.
                  </Badge>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <ConditionEditor
                visibility={field.visibility}
                onChange={(v) => upd({ visibility: v })}
                otherFields={otherFields}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
