import { CalcField } from "@/types/custom-calc";
import { resolveVisibility } from "@/lib/calc-engine";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayerResult } from "./PlayerResult";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";

interface PlayerFieldProps {
  field: CalcField;
  allFields: CalcField[];
  values: Record<string, number | string | boolean>;
  onChange: (key: string, value: number | string | boolean) => void;
  onTriggerCalculate?: (targetFieldId?: string) => void;
  onReset?: () => void;
  onNavigatePage?: (target: "next" | "prev" | number) => void;
  /** Manual result values keyed by field.key */
  manualResults?: Record<string, number>;
}

export function PlayerField({
  field, allFields, values, onChange, onTriggerCalculate, onReset, onNavigatePage, manualResults,
}: PlayerFieldProps) {
  const visible = resolveVisibility(field.visibility, values, allFields);
  if (!visible) return null;

  if (field.type === "result") {
    return (
      <PlayerResult
        field={field}
        allFields={allFields}
        inputValues={values}
        manualValue={field.config.manualCalculation ? manualResults?.[field.key] : undefined}
      />
    );
  }

  // ── HTML block ────────────────────────────────────────────────
  if (field.type === "html") {
    const raw = field.config.htmlContent ?? "";
    // Interpolate {key} placeholders with current values
    const interpolated = raw.replace(/\{(\w+)\}/g, (_, key) => {
      const val = values[key];
      return val !== undefined ? String(val) : `{${key}}`;
    });
    const clean = DOMPurify.sanitize(interpolated, {
      ALLOWED_TAGS: [
        "p","br","span","div","strong","em","b","i","u","s",
        "h1","h2","h3","h4","h5","h6",
        "ul","ol","li","a","blockquote","pre","code",
        "table","thead","tbody","tr","th","td",
        "img","hr","small","sup","sub",
      ],
      ALLOWED_ATTR: ["href","target","rel","src","alt","class","style","width","height"],
    });
    if (!clean) return null;
    return (
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  // ── Image ─────────────────────────────────────────────────────
  if (field.type === "image") {
    const src = field.config.imageData;
    const alt = field.config.imageAlt ?? field.label ?? "";
    const align = field.config.imageAlign ?? "center";
    const maxWidth = field.config.imageMaxWidth;
    if (!src) return null;
    return (
      <div className={cn("py-1", align === "center" && "flex justify-center", align === "right" && "flex justify-end")}>
        <img
          src={src}
          alt={alt}
          style={maxWidth ? { maxWidth } : { maxWidth: "100%" }}
          className="rounded-md object-contain"
        />
        {alt && <p className="text-xs text-muted-foreground mt-1 text-center">{alt}</p>}
      </div>
    );
  }

  // ── Label / static text ──────────────────────────────────────
  if (field.type === "label") {
    const variant = field.config.labelVariant ?? "body";
    const content = field.config.labelContent ?? field.label ?? "";

    if (variant === "divider") {
      return (
        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          {content && <span className="text-xs text-muted-foreground shrink-0 font-medium">{content}</span>}
          <Separator className="flex-1" />
        </div>
      );
    }

    return (
      <div className={cn(
        variant === "h1" && "text-2xl font-bold",
        variant === "h2" && "text-xl font-semibold",
        variant === "h3" && "text-base font-semibold",
        variant === "body" && "text-sm",
        variant === "caption" && "text-xs text-muted-foreground",
      )}>
        {content || <span className="text-muted-foreground italic text-xs">(пустой текст)</span>}
      </div>
    );
  }

  // ── Button ───────────────────────────────────────────────────
  if (field.type === "button") {
    const action = field.config.buttonAction;
    const variant = (field.config.buttonVariant ?? "default") as "default" | "outline" | "destructive" | "ghost";

    /** All action types to execute on click */
    const allActionTypes = action
      ? [action.type, ...(action.extraActions ?? [])]
      : [];

    const executeWebhook = async () => {
      if (!action?.url) return;
      const url = resolveUrl(action.url, values);
      const post = action.webhookPostAction;
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (post?.showToast) {
          toast({ title: post.successMessage || "Отправлено успешно" });
        }
        if (post?.resetAfter) onReset?.();
        if (post?.redirectUrl) {
          const rUrl = resolveUrl(post.redirectUrl, values);
          if (post.redirectNewTab) window.open(rUrl, "_blank");
          else window.location.href = rUrl;
        }
      } catch {
        if (post?.showToast) {
          toast({
            title: post.errorMessage || "Ошибка отправки",
            variant: "destructive",
          });
        }
      }
    };

    const handleClick = async () => {
      if (!action) return;

      for (const type of allActionTypes) {
        switch (type) {
          case "calculate":
            onTriggerCalculate?.(action.targetFieldId);
            break;
          case "reset":
            onReset?.();
            break;
          case "navigate_page":
            onNavigatePage?.(action.targetPage ?? "next");
            break;
          case "navigate": {
            const url = resolveUrl(action.url ?? "", values);
            if (action.newTab) window.open(url, "_blank");
            else window.location.href = url;
            break;
          }
          case "webhook":
            await executeWebhook();
            break;
          case "pdf":
            window.print();
            break;
        }
      }
    };

    return (
      <div>
        <Button variant={variant} onClick={handleClick} className="w-full">
          {field.label || "Кнопка"}
        </Button>
      </div>
    );
  }

  const rawVal = values[field.key];
  const strVal = rawVal !== undefined ? String(rawVal) : "";
  const numVal = parseFloat(strVal) || 0;

  const label = (
    <Label className="text-sm font-medium">
      {field.label}
      {field.config.unit && (
        <span className="ml-1 text-muted-foreground font-normal text-xs">({field.config.unit})</span>
      )}
    </Label>
  );

  let control: React.ReactNode = null;

  switch (field.type) {
    case "number":
      control = (
        <Input
          type="number"
          value={strVal}
          onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
          min={field.config.min}
          max={field.config.max}
          step={field.config.step}
          placeholder={field.config.placeholder ?? "Введите значение"}
        />
      );
      break;

    case "text":
      control = (
        <Input
          value={strVal}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.config.placeholder ?? "Введите текст"}
        />
      );
      break;

    case "textarea":
      control = (
        <Textarea
          value={strVal}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.config.placeholder ?? "Введите текст"}
          rows={field.config.rows ?? 3}
        />
      );
      break;

    case "slider": {
      const min = field.config.min ?? 0;
      const max = field.config.max ?? 100;
      const step = field.config.step ?? 1;
      control = (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min.toLocaleString("ru-RU")}</span>
            <span className="font-medium text-foreground">
              {numVal.toLocaleString("ru-RU")} {field.config.unit}
            </span>
            <span>{max.toLocaleString("ru-RU")}</span>
          </div>
          <Slider
            value={[numVal]}
            onValueChange={([v]) => onChange(field.key, v)}
            min={min}
            max={max}
            step={step}
          />
        </div>
      );
      break;
    }

    case "select":
      control = (
        <Select value={strVal} onValueChange={(v) => onChange(field.key, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите..." />
          </SelectTrigger>
          <SelectContent>
            {(field.config.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      break;

    case "radio":
      control = (
        <RadioGroup
          value={strVal}
          onValueChange={(v) => onChange(field.key, v)}
          className="flex flex-wrap gap-3"
        >
          {(field.config.options ?? []).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`${field.key}_${opt.value}`} />
              <Label htmlFor={`${field.key}_${opt.value}`} className="cursor-pointer font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
      break;

    case "checkbox": {
      const checked = rawVal === true || rawVal === 1 || rawVal === "true";
      control = (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.key}
            checked={checked}
            onCheckedChange={(v) => onChange(field.key, !!v)}
          />
          <Label htmlFor={field.key} className="cursor-pointer font-normal">{field.label}</Label>
        </div>
      );
      return (
        <div className="py-1">
          {control}
          {field.config.hint && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">{field.config.hint}</p>
          )}
        </div>
      );
    }
  }

  return (
    <div className="space-y-2">
      {label}
      {control}
      {field.config.hint && (
        <p className="text-xs text-muted-foreground">{field.config.hint}</p>
      )}
    </div>
  );
}

/** Replaces {key} placeholders in URL with actual values */
function resolveUrl(url: string, values: Record<string, number | string | boolean>): string {
  return url.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
