import { CalcField, CalcFieldType, SelectOption } from "@/types/custom-calc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConditionEditor } from "./ConditionEditor";
import { FormulaEditor } from "./FormulaEditor";
import {
  Hash, Type, SlidersHorizontal, List, CircleDot, ToggleLeft, Calculator,
  Plus, X, Trash2, ChevronDown, MousePointerClick, AlignLeft, TextQuote,
} from "lucide-react";
import { useState } from "react";
import { ButtonActionType, LabelVariant } from "@/types/custom-calc";

const TYPE_ICONS: Record<CalcFieldType, React.ReactNode> = {
  number:   <Hash className="h-4 w-4" />,
  text:     <Type className="h-4 w-4" />,
  textarea: <AlignLeft className="h-4 w-4" />,
  slider:   <SlidersHorizontal className="h-4 w-4" />,
  select:   <List className="h-4 w-4" />,
  radio:    <CircleDot className="h-4 w-4" />,
  checkbox: <ToggleLeft className="h-4 w-4" />,
  result:   <Calculator className="h-4 w-4" />,
  button:   <MousePointerClick className="h-4 w-4" />,
  label:    <TextQuote className="h-4 w-4" />,
};

const TYPE_LABELS: Record<CalcFieldType, string> = {
  number: "Число", text: "Текст", textarea: "Многострочный", slider: "Слайдер",
  select: "Список", radio: "Радио", checkbox: "Чекбокс", result: "Результат",
  button: "Кнопка", label: "Текст",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 30);
}

interface FieldSettingsPanelProps {
  field: CalcField | null;
  allFields: CalcField[];
  onChange: (updated: CalcField) => void;
  onDelete: () => void;
}

export function FieldSettingsPanel({ field, allFields, onChange, onDelete }: FieldSettingsPanelProps) {
  const [condOpen, setCondOpen] = useState(false);

  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Hash className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">Выберите поле</p>
        <p className="text-xs mt-1">Кликните на блок в канвасе, чтобы редактировать его настройки</p>
      </div>
    );
  }

  const upd = (partial: Partial<CalcField>) => onChange({ ...field, ...partial });
  const updConfig = (partial: Partial<CalcField["config"]>) =>
    upd({ config: { ...field.config, ...partial } });

  const otherFields = allFields.filter((f) => f.id !== field.id);
  const hasConditions = (field.visibility?.rules?.length ?? 0) > 0;
  const options = field.config.options ?? [];

  const addOption = () =>
    updConfig({ options: [...options, { label: `Вариант ${options.length + 1}`, value: `opt${options.length + 1}` }] });
  const updateOption = (i: number, partial: Partial<SelectOption>) =>
    updConfig({ options: options.map((o, idx) => (idx === i ? { ...o, ...partial } : o)) });
  const removeOption = (i: number) =>
    updConfig({ options: options.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary shrink-0">
          {TYPE_ICONS[field.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{field.label || "Без названия"}</p>
          <Badge variant="secondary" className="text-[10px] px-1.5 mt-0.5">{TYPE_LABELS[field.type]}</Badge>
        </div>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Label + Key */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Название поля</Label>
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Ключ переменной</Label>
            <Input
              inputSize="sm"
              value={field.key}
              onChange={(e) => upd({ key: slugify(e.target.value) })}
              placeholder="amount"
              className="font-mono"
            />
          </div>
        </div>

        <Separator />

        {/* Type-specific settings */}
        {(field.type === "number" || field.type === "slider") && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Диапазон</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Мин.</Label>
                <Input inputSize="sm" type="number" value={field.config.min ?? ""} onChange={(e) => updConfig({ min: Number(e.target.value) || undefined })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Макс.</Label>
                <Input inputSize="sm" type="number" value={field.config.max ?? ""} onChange={(e) => updConfig({ max: Number(e.target.value) || undefined })} placeholder="1000000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Шаг</Label>
                <Input inputSize="sm" type="number" value={field.config.step ?? ""} onChange={(e) => updConfig({ step: Number(e.target.value) || undefined })} placeholder="1" />
              </div>
            </div>
          </div>
        )}

        {(field.type === "number" || field.type === "text" || field.type === "slider") && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Отображение</p>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Единица измерения</Label>
                <Input inputSize="sm" value={field.config.unit ?? ""} onChange={(e) => updConfig({ unit: e.target.value })} placeholder="₽, %, лет" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Подсказка</Label>
                <Input inputSize="sm" value={field.config.hint ?? ""} onChange={(e) => updConfig({ hint: e.target.value })} placeholder="Необязательно" />
              </div>
            </div>
          </div>
        )}

        {(field.type === "select" || field.type === "radio") && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Варианты</p>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input inputSize="sm" value={opt.label} onChange={(e) => updateOption(i, { label: e.target.value })} placeholder="Название" className="flex-1" />
                  <Input inputSize="sm" value={opt.value} onChange={(e) => updateOption(i, { value: e.target.value })} placeholder="значение" className="w-24 font-mono" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeOption(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground w-full justify-start" onClick={addOption}>
                <Plus className="h-3.5 w-3.5" /> Добавить вариант
              </Button>
            </div>
          </div>
        )}

        {field.type === "result" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Формула и формат</p>
            <FormulaEditor
              value={field.formula ?? ""}
              onChange={(f) => upd({ formula: f })}
              fields={allFields}
              currentFieldId={field.id}
            />
            <div className="space-y-2">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label className="text-xs">Знаков после запятой</Label>
                <Input inputSize="sm" type="number" value={field.config.decimals ?? 2} onChange={(e) => updConfig({ decimals: Number(e.target.value) })} min={0} max={10} />
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Conditions */}
        <Collapsible open={condOpen} onOpenChange={setCondOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full transition-colors group">
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${condOpen ? "rotate-180" : ""}`} />
              <span className="font-medium">Условия отображения</span>
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
    </div>
  );
}
