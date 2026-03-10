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
import { Mail, User, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  /** Validation errors keyed by field.key */
  validationErrors?: Record<string, string>;
  /** Calculator meta for lead saving */
  calculatorId?: string;
  calculatorTitle?: string;
  ownerUserId?: string;
  /** All evaluated result values at time of lead capture */
  resultValues?: Record<string, number>;
}

/** Returns a validation error message if the value violates configured rules, or null if valid */
export function validateField(field: CalcField, value: number | string | boolean): string | null {
  const cfg = field.config;

  // Required check
  if (cfg.required) {
    const isEmpty =
      value === "" ||
      value === undefined ||
      value === null ||
      (typeof value === "number" && isNaN(value as number));
    if (isEmpty) {
      return cfg.requiredMessage || "Это поле обязательно для заполнения";
    }
  }

  // Numeric min/max validation
  if (field.type === "number" || field.type === "slider") {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (!isNaN(num)) {
      if (cfg.validationMin !== undefined && num < cfg.validationMin) {
        return cfg.validationMinMessage || `Значение должно быть не менее ${cfg.validationMin}`;
      }
      if (cfg.validationMax !== undefined && num > cfg.validationMax) {
        return cfg.validationMaxMessage || `Значение должно быть не более ${cfg.validationMax}`;
      }
    }
  }

  // Pattern validation for text
  if ((field.type === "text" || field.type === "textarea") && cfg.validationPattern) {
    try {
      const regex = new RegExp(cfg.validationPattern);
      if (String(value) && !regex.test(String(value))) {
        return cfg.validationPatternMessage || "Значение не соответствует формату";
      }
    } catch {
      // Invalid regex — ignore
    }
  }

  return null;
}

export function PlayerField({
  field, allFields, values, onChange, onTriggerCalculate, onReset, onNavigatePage, manualResults, validationErrors,
  calculatorId, calculatorTitle, ownerUserId, resultValues,
}: PlayerFieldProps) {
  const visible = resolveVisibility(field.visibility, values, allFields);
  if (!visible) return null;

  const pt = field.config.paddingTop;
  const pb = field.config.paddingBottom;
  const paddingStyle = (pt || pb) ? { paddingTop: pt ? `${pt}px` : undefined, paddingBottom: pb ? `${pb}px` : undefined } : undefined;

  const wrap = (node: React.ReactNode) =>
    paddingStyle ? <div style={paddingStyle}>{node}</div> : <>{node}</>;

  if (field.type === "result") {
    return wrap(
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

    // Unique scope id per field instance so styles don't leak
    const scopeAttr = `data-html-scope-${field.id}`;

    // Extract <style> blocks, prefix every selector with the scope attribute,
    // then re-inject them alongside the sanitized HTML
    let scopedStyles = "";
    const htmlWithoutStyle = interpolated.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/gi,
      (_, css: string) => {
        const prefixed = css.replace(
          /([^{}]+)\{/g,
          (_match: string, selectorPart: string) => {
            const selectors = selectorPart
              .split(",")
              .map((sel) => {
                const s = sel.trim();
                if (!s || s.startsWith("@")) return s;
                return `[${scopeAttr}] ${s}`;
              })
              .join(", ");
            return `${selectors} {`;
          }
        );
        scopedStyles += prefixed;
        return "";
      }
    );

    const clean = DOMPurify.sanitize(htmlWithoutStyle, {
      ALLOWED_TAGS: [
        "p","br","span","div","strong","em","b","i","u","s",
        "h1","h2","h3","h4","h5","h6",
        "ul","ol","li","a","blockquote","pre","code",
        "table","thead","tbody","tr","th","td",
        "img","hr","small","sup","sub",
      ],
      ALLOWED_ATTR: ["href","target","rel","src","alt","class","style","width","height"],
    });

    if (!clean && !scopedStyles) return null;

    return wrap(
      <div {...{ [scopeAttr]: "" }} className="prose prose-sm max-w-none dark:prose-invert">
        {scopedStyles && (
          <style dangerouslySetInnerHTML={{ __html: scopedStyles }} />
        )}
        <div dangerouslySetInnerHTML={{ __html: clean }} />
      </div>
    );
  }



  // ── Image ─────────────────────────────────────────────────────
  if (field.type === "image") {
    const src = field.config.imageData;
    const alt = field.config.imageAlt ?? field.label ?? "";
    const align = field.config.imageAlign ?? "center";
    const maxWidth = field.config.imageMaxWidth;
    if (!src) return null;
    return wrap(
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
    const color = field.config.labelColor;
    const bold = field.config.labelBold;
    const italic = field.config.labelItalic;
    const align = field.config.labelAlign ?? "left";
    const href = field.config.labelHref;

    if (variant === "divider") {
      return wrap(
        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          {content && <span className="text-xs text-muted-foreground shrink-0 font-medium">{content}</span>}
          <Separator className="flex-1" />
        </div>
      );
    }

    // Detect HTML content (from rich text editor)
    const isHtml = content.trim().startsWith("<");

    const variantClass = cn(
      variant === "h1" && "text-2xl font-bold",
      variant === "h2" && "text-xl font-semibold",
      variant === "h3" && "text-base font-semibold",
      variant === "body" && "text-sm",
      variant === "caption" && "text-xs text-muted-foreground",
    );

    if (isHtml) {
      // Interpolate both {key} text and <span data-variable="key"> nodes
      const interpolateHtml = (html: string) =>
        html
          // Replace VariableNode spans: <span data-variable="key">...</span>
          .replace(/<span[^>]*data-variable="(\w+)"[^>]*>[^<]*<\/span>/g, (_, key) => {
            const val = values[key];
            return val !== undefined ? String(val) : `{${key}}`;
          })
          // Fallback plain {key}
          .replace(/\{(\w+)\}/g, (_, key) => {
            const val = values[key];
            return val !== undefined ? String(val) : `{${key}}`;
          });
      const interpolatedContent = interpolateHtml(content);
      return wrap(
        <div
          className={cn(variantClass, "prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_p]:my-0")}
          dangerouslySetInnerHTML={{ __html: interpolatedContent }}
        />
      );
    }

    // Legacy plain-text fallback
    const textAlign = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    const inner = (
      <div
        className={cn(variantClass, bold && "font-bold", italic && "italic", textAlign)}
        style={color ? { color } : undefined}
      >
        {content || <span className="text-muted-foreground italic text-xs">(пустой текст)</span>}
      </div>
    );
    return wrap(
      href
        ? <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{inner}</a>
        : inner
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

    return wrap(
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

  // Validate current value
  const validationError = validationErrors?.[field.key] ?? validateField(field, rawVal ?? "");

  const label = (
    <Label className={cn("text-sm font-medium", validationError && "text-destructive")}>
      {field.label}
      {field.config.required && <span className="ml-0.5 text-destructive">*</span>}
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
          error={validationError ?? undefined}
        />
      );
      break;

    case "text":
      control = (
        <Input
          value={strVal}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.config.placeholder ?? "Введите текст"}
          error={validationError ?? undefined}
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
          error={validationError ?? undefined}
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
            className={validationError ? "accent-destructive" : undefined}
          />
          {validationError && (
            <p className="text-xs text-destructive" role="alert">{validationError}</p>
          )}
        </div>
      );
      break;
    }

    case "select":
      control = (
        <div>
          <Select value={strVal} onValueChange={(v) => onChange(field.key, v)}>
            <SelectTrigger className={validationError ? "border-destructive" : undefined}>
              <SelectValue placeholder="Выберите..." />
            </SelectTrigger>
            <SelectContent>
              {(field.config.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationError && (
            <p className="text-xs text-destructive mt-1" role="alert">{validationError}</p>
          )}
        </div>
      );
      break;

    case "radio":
      control = (
        <div>
          <RadioGroup
            value={strVal}
            onValueChange={(v) => onChange(field.key, v)}
            className={field.config.radioOrientation === "vertical" ? "flex flex-col gap-2" : "flex flex-wrap gap-3"}
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
          {validationError && (
            <p className="text-xs text-destructive mt-1" role="alert">{validationError}</p>
          )}
        </div>
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
      return wrap(
        <div className="py-1">
          {control}
          {field.config.hint && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">{field.config.hint}</p>
          )}
          {validationError && (
            <p className="text-xs text-destructive mt-1 ml-6" role="alert">{validationError}</p>
          )}
        </div>
      );
    }
  }

  return wrap(
    <div className="space-y-2">
      {label}
      {control}
      {field.config.hint && !validationError && (
        <p className="text-xs text-muted-foreground">{field.config.hint}</p>
      )}
    </div>
  );
}

/** Replaces {key} placeholders in URL with actual values */
function resolveUrl(url: string, values: Record<string, number | string | boolean>): string {
  return url.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
