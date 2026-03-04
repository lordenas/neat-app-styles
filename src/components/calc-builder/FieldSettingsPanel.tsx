import { CalcField, CalcFieldType, CalcPage, SelectOption, ButtonActionType, LabelVariant, WebhookPostAction } from "@/types/custom-calc";
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
  Plus, X, Trash2, ChevronDown, MousePointerClick, AlignLeft, TextQuote, ImageIcon, Code2,
} from "lucide-react";
import { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

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
  image:    <ImageIcon className="h-4 w-4" />,
  html:     <Code2 className="h-4 w-4" />,
};

const TYPE_LABELS: Record<CalcFieldType, string> = {
  number: "Число", text: "Текст", textarea: "Многострочный", slider: "Слайдер",
  select: "Список", radio: "Радио", checkbox: "Чекбокс", result: "Результат",
  button: "Кнопка", label: "Текст", image: "Картинка", html: "HTML",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 30);
}

interface FieldSettingsPanelProps {
  field: CalcField | null;
  allFields: CalcField[];
  pages?: CalcPage[];
  onChange: (updated: CalcField) => void;
  onDelete: () => void;
}

export function FieldSettingsPanel({ field, allFields, pages = [], onChange, onDelete }: FieldSettingsPanelProps) {
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
            {field.type === "radio" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Расположение</Label>
                <div className="flex gap-1">
                  {(["horizontal", "vertical"] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => updConfig({ radioOrientation: o })}
                      className={`flex-1 h-7 text-xs rounded-md border transition-colors ${
                        (field.config.radioOrientation ?? "horizontal") === o
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-input bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {o === "horizontal" ? "Горизонтально" : "Вертикально"}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <OptionsEditor options={options} updateOption={updateOption} removeOption={removeOption} addOption={addOption} />
          </div>
        )}

        {field.type === "checkbox" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Числовые значения</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Используются в формулах как <code className="bg-muted px-1 rounded">{`{${field.key || "key"}}`}</code>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Если активен</Label>
                <Input
                  inputSize="sm"
                  type="number"
                  value={field.config.checkedValue ?? 1}
                  onChange={(e) => updConfig({ checkedValue: Number(e.target.value) })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Если неактивен</Label>
                <Input
                  inputSize="sm"
                  type="number"
                  value={field.config.uncheckedValue ?? 0}
                  onChange={(e) => updConfig({ uncheckedValue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
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
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={field.config.manualCalculation ?? false}
                  onChange={(e) => updConfig({ manualCalculation: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs">Считать только по кнопке</span>
              </label>
              {field.config.manualCalculation && (
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Результат не обновляется при вводе — только когда кнопка с действием «Рассчитать» нацелена на это поле.
                </p>
              )}
            </div>
          </div>
        )}

        {field.type === "textarea" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Настройки textarea</p>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Количество строк</Label>
                <Input inputSize="sm" type="number" value={field.config.rows ?? 3} onChange={(e) => updConfig({ rows: Number(e.target.value) })} min={2} max={20} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Подсказка</Label>
                <Input inputSize="sm" value={field.config.hint ?? ""} onChange={(e) => updConfig({ hint: e.target.value })} placeholder="Необязательно" />
              </div>
            </div>
          </div>
        )}

        {field.type === "label" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Статический текст</p>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Вариант оформления</Label>
                <select
                  className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
                  value={field.config.labelVariant ?? "body"}
                  onChange={(e) => updConfig({ labelVariant: e.target.value as LabelVariant })}
                >
                  <option value="h1">Заголовок H1 (крупный)</option>
                  <option value="h2">Заголовок H2 (средний)</option>
                  <option value="h3">Заголовок H3 (мелкий)</option>
                  <option value="body">Обычный текст</option>
                  <option value="caption">Подпись (мелкий серый)</option>
                  <option value="divider">Разделитель с текстом</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Содержимое</Label>
                <textarea
                  className="w-full text-xs rounded-md border border-input bg-background px-2 py-1.5 min-h-[60px] resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                  value={field.config.labelContent ?? ""}
                  onChange={(e) => updConfig({ labelContent: e.target.value })}
                  placeholder="Введите текст..."
                />
              </div>
            </div>
          </div>
        )}

        {field.type === "image" && (
          <ImageSettings field={field} updConfig={updConfig} />
        )}

        {field.type === "html" && (
          <HtmlSettings field={field} updConfig={updConfig} allFields={allFields} />
        )}

        {field.type === "button" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Настройки кнопки</p>
            <ButtonSettings field={field} allFields={allFields} pages={pages} updConfig={updConfig} />
          </div>
        )}

        <Separator />

        {/* Padding controls */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Отступы (внутренние)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Сверху (px)</Label>
              <Input
                inputSize="sm"
                type="number"
                min={0}
                max={64}
                value={field.config.paddingTop ?? 0}
                onChange={(e) => updConfig({ paddingTop: Math.min(64, Math.max(0, Number(e.target.value))) })}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Снизу (px)</Label>
              <Input
                inputSize="sm"
                type="number"
                min={0}
                max={64}
                value={field.config.paddingBottom ?? 0}
                onChange={(e) => updConfig({ paddingBottom: Math.min(64, Math.max(0, Number(e.target.value))) })}
                placeholder="0"
              />
            </div>
          </div>
        </div>

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

// ─── OptionsEditor sub-component ─────────────────────────────

interface OptionsEditorProps {
  options: import("@/types/custom-calc").SelectOption[];
  updateOption: (i: number, partial: Partial<import("@/types/custom-calc").SelectOption>) => void;
  removeOption: (i: number) => void;
  addOption: () => void;
}

function OptionsEditor({ options, updateOption, removeOption, addOption }: OptionsEditorProps) {
  const [showId, setShowId] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center px-0.5">
        <span className="text-[10px] text-muted-foreground flex-1">Название</span>
        <span className="text-[10px] text-muted-foreground w-16">Число</span>
        <button
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors w-5 text-right"
          title={showId ? "Скрыть строковый ID" : "Показать строковый ID (нужен для условий отображения)"}
          onClick={() => setShowId((v) => !v)}
        >
          {showId ? "·" : "⋯"}
        </button>
        <span className="w-7" />
      </div>
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            inputSize="sm"
            value={opt.label}
            onChange={(e) => {
              const label = e.target.value;
              // auto-generate value from label if it hasn't been manually changed
              const autoValue = opt.label === opt.value || opt.value === "" || opt.value === `opt${i + 1}`;
              updateOption(i, { label, ...(autoValue ? { value: label.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20) } : {}) });
            }}
            placeholder="Название"
            className="flex-1"
          />
          <Input
            inputSize="sm"
            type="number"
            value={opt.numericValue ?? ""}
            onChange={(e) => updateOption(i, { numericValue: e.target.value === "" ? undefined : Number(e.target.value) })}
            placeholder="—"
            className="w-16 font-mono"
          />
          {showId && (
            <Input
              inputSize="sm"
              value={opt.value}
              onChange={(e) => updateOption(i, { value: e.target.value })}
              placeholder="id"
              className="w-20 font-mono text-muted-foreground"
              title="Строковый ID (для условий отображения)"
            />
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeOption(i)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground w-full justify-start" onClick={addOption}>
        <Plus className="h-3.5 w-3.5" /> Добавить вариант
      </Button>
    </div>
  );
}

// ─── ButtonSettings sub-component ────────────────────────────

const ACTION_LABELS: Record<ButtonActionType, string> = {
  calculate: "Рассчитать результат",
  navigate: "Перейти по ссылке",
  navigate_page: "Перейти на страницу",
  reset: "Сбросить форму",
  pdf: "Скачать PDF",
  webhook: "Отправить webhook",
};

const ALL_BUTTON_ACTIONS: ButtonActionType[] = ["calculate", "navigate_page", "navigate", "reset", "pdf", "webhook"];

interface ButtonSettingsProps {
  field: CalcField;
  allFields: CalcField[];
  pages: CalcPage[];
  updConfig: (partial: Partial<CalcField["config"]>) => void;
}

function ButtonSettings({ field, allFields, pages, updConfig }: ButtonSettingsProps) {
  const action = field.config.buttonAction ?? { type: "calculate" as ButtonActionType };
  const extraActions = action.extraActions ?? [];
  const post = action.webhookPostAction ?? {} as WebhookPostAction;
  const isWebhook = action.type === "webhook" || extraActions.includes("webhook");

  const updAction = (partial: Partial<typeof action>) =>
    updConfig({ buttonAction: { ...action, ...partial } });

  const toggleExtra = (type: ButtonActionType) => {
    const has = extraActions.includes(type);
    updAction({ extraActions: has ? extraActions.filter((t) => t !== type) : [...extraActions, type] });
  };

  const updPost = (partial: Partial<WebhookPostAction>) =>
    updAction({ webhookPostAction: { ...post, ...partial } });

  return (
    <div className="space-y-3">
      {/* Button variant */}
      <div className="space-y-1.5">
        <Label className="text-xs">Вид кнопки</Label>
        <select
          className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
          value={field.config.buttonVariant ?? "default"}
          onChange={(e) => updConfig({ buttonVariant: e.target.value as "default" | "outline" | "destructive" | "ghost" })}
        >
          <option value="default">Основная</option>
          <option value="outline">Контурная</option>
          <option value="destructive">Деструктивная (красная)</option>
          <option value="ghost">Призрак</option>
        </select>
      </div>

      {/* Primary action */}
      <div className="space-y-1.5">
        <Label className="text-xs">Основное действие</Label>
        <select
          className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
          value={action.type}
          onChange={(e) => updAction({ type: e.target.value as ButtonActionType })}
        >
          {ALL_BUTTON_ACTIONS.map((t) => (
            <option key={t} value={t}>{ACTION_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Extra (additional) actions */}
      <div className="space-y-1.5">
        <Label className="text-xs">Дополнительные действия <span className="text-muted-foreground font-normal">(вместе с основным)</span></Label>
        <div className="space-y-1">
          {ALL_BUTTON_ACTIONS.filter((t) => t !== action.type).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={extraActions.includes(t)}
                onChange={() => toggleExtra(t)}
                className="rounded"
              />
              <span className="text-xs text-muted-foreground">{ACTION_LABELS[t]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* navigate_page target */}
      {(action.type === "navigate_page" || extraActions.includes("navigate_page")) && (
        <div className="space-y-1.5">
          <Label className="text-xs">Целевая страница</Label>
          <select
            className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
            value={action.targetPage === undefined ? "next" : String(action.targetPage)}
            onChange={(e) => {
              const v = e.target.value;
              updAction({ targetPage: v === "next" ? "next" : v === "prev" ? "prev" : Number(v) });
            }}
          >
            <option value="next">Следующая →</option>
            <option value="prev">← Предыдущая</option>
            {pages.map((page, i) => (
              <option key={page.id} value={i}>Страница {i + 1}{page.title ? `: ${page.title}` : ""}</option>
            ))}
          </select>
        </div>
      )}

      {/* URL for navigate / webhook */}
      {(action.type === "navigate" || action.type === "webhook" || extraActions.includes("navigate") || extraActions.includes("webhook")) && (
        <div className="space-y-1.5">
          <Label className="text-xs">URL <span className="text-muted-foreground font-normal">(поддерживает {"{key}"})</span></Label>
          <Input
            inputSize="sm"
            value={action.url ?? ""}
            onChange={(e) => updAction({ url: e.target.value })}
            placeholder="https://example.com?sum={amount}"
          />
          {(action.type === "navigate" || extraActions.includes("navigate")) && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={action.newTab ?? false}
                onChange={(e) => updAction({ newTab: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-muted-foreground">Открыть в новой вкладке</span>
            </label>
          )}
        </div>
      )}

      {/* Target result field for calculate */}
      {(action.type === "calculate" || extraActions.includes("calculate")) && (
        <div className="space-y-1.5">
          <Label className="text-xs">Поле результата <span className="text-muted-foreground font-normal">(пусто = все)</span></Label>
          <select
            className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
            value={action.targetFieldId ?? ""}
            onChange={(e) => updAction({ targetFieldId: e.target.value })}
          >
            <option value="">Все result-поля</option>
            {allFields.filter((f) => f.type === "result").map((f) => (
              <option key={f.id} value={f.id}>{f.label || f.key}</option>
            ))}
          </select>
        </div>
      )}

      {/* Webhook post-actions */}
      {isWebhook && (
        <div className="space-y-2 rounded-md border border-dashed border-border p-3 bg-muted/20">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">После отправки webhook</p>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={post.showToast ?? false}
              onChange={(e) => updPost({ showToast: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs">Показать уведомление</span>
          </label>

          {post.showToast && (
            <div className="space-y-1.5 ml-4">
              <Input inputSize="sm" value={post.successMessage ?? ""} onChange={(e) => updPost({ successMessage: e.target.value })} placeholder="Успешно отправлено" />
              <Input inputSize="sm" value={post.errorMessage ?? ""} onChange={(e) => updPost({ errorMessage: e.target.value })} placeholder="Ошибка при отправке" />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={post.resetAfter ?? false}
              onChange={(e) => updPost({ resetAfter: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs">Сбросить форму</span>
          </label>

          <div className="space-y-1.5">
            <Label className="text-xs">Редирект после успеха</Label>
            <Input inputSize="sm" value={post.redirectUrl ?? ""} onChange={(e) => updPost({ redirectUrl: e.target.value })} placeholder="https://thank-you.com" />
            {post.redirectUrl && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={post.redirectNewTab ?? false}
                  onChange={(e) => updPost({ redirectNewTab: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs text-muted-foreground">Открыть в новой вкладке</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// ─── ImageSettings sub-component ─────────────────────────────

interface ImageSettingsProps {
  field: CalcField;
  updConfig: (partial: Partial<CalcField["config"]>) => void;
}

function ImageSettings({ field, updConfig }: ImageSettingsProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updConfig({ imageData: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Настройки картинки</p>
      <div className="space-y-2">
        {/* Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs">Файл изображения</Label>
          {field.config.imageData ? (
            <div className="space-y-2">
              <div className="rounded-md border border-border overflow-hidden bg-muted/30 flex items-center justify-center" style={{ maxHeight: 120 }}>
                <img src={field.config.imageData} alt="preview" className="max-h-[120px] object-contain" />
              </div>
              <button
                className="text-xs text-destructive hover:underline"
                onClick={() => updConfig({ imageData: undefined })}
              >
                Удалить изображение
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 py-4 cursor-pointer hover:bg-muted/40 transition-colors">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Нажмите, чтобы выбрать файл</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>

        {/* Alt / caption */}
        <div className="space-y-1.5">
          <Label className="text-xs">Alt-текст / подпись</Label>
          <Input
            inputSize="sm"
            value={field.config.imageAlt ?? ""}
            onChange={(e) => updConfig({ imageAlt: e.target.value })}
            placeholder="Описание изображения"
          />
        </div>

        {/* Max width */}
        <div className="space-y-1.5">
          <Label className="text-xs">Макс. ширина (px, 0 = авто)</Label>
          <Input
            inputSize="sm"
            type="number"
            value={field.config.imageMaxWidth ?? 0}
            onChange={(e) => updConfig({ imageMaxWidth: Number(e.target.value) || undefined })}
            placeholder="0"
            min={0}
          />
        </div>

        {/* Alignment */}
        <div className="space-y-1.5">
          <Label className="text-xs">Выравнивание</Label>
          <select
            className="h-8 w-full text-xs rounded-md border border-input bg-background px-2"
            value={field.config.imageAlign ?? "center"}
            onChange={(e) => updConfig({ imageAlign: e.target.value as "left" | "center" | "right" })}
          >
            <option value="left">По левому краю</option>
            <option value="center">По центру</option>
            <option value="right">По правому краю</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── HtmlSettings sub-component ──────────────────────────────

interface HtmlSettingsProps {
  field: CalcField;
  allFields: CalcField[];
  updConfig: (partial: Partial<CalcField["config"]>) => void;
}

function HtmlSettings({ field, allFields, updConfig }: HtmlSettingsProps) {
  const inputFields = allFields.filter(
    (f) => f.type !== "result" && f.type !== "button" && f.type !== "label" && f.type !== "image" && f.type !== "html"
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">HTML-блок</p>
      <div className="space-y-2">
        <div className="space-y-1.5">
          <Label className="text-xs">HTML-код</Label>
          <div className="rounded-md border border-input overflow-hidden text-xs">
            <CodeEditor
              value={field.config.htmlContent ?? ""}
              language="html"
              placeholder="<p>Ваш HTML...</p>"
              onChange={(e) => updConfig({ htmlContent: e.target.value })}
              padding={10}
              style={{
                fontSize: 12,
                fontFamily: "ui-monospace, monospace",
                minHeight: 120,
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--foreground))",
              }}
            />
          </div>
        </div>

        {inputFields.length > 0 && (
          <div className="rounded-md border border-dashed border-border bg-muted/20 p-2.5 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Доступные переменные</p>
            <div className="flex flex-wrap gap-1.5">
              {inputFields.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  onClick={() => updConfig({ htmlContent: (field.config.htmlContent ?? "") + `{${f.key}}` })}
                  title={f.label}
                >
                  {"{" + f.key + "}"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Нажмите на переменную, чтобы вставить в код</p>
          </div>
        )}
      </div>
    </div>
  );
}

