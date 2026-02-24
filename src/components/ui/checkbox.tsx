import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Флажок (checkbox) для переключения булевых значений.
 *
 * @example
 * ```tsx
 * <Checkbox id="terms" label="Принимаю условия" />
 *
 * // Без label
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Принимаю условия</Label>
 * </div>
 *
 * // С ошибкой валидации
 * <Checkbox id="agree" label="Согласен" error={errors.agree?.message ?? ""} />
 * ```
 *
 * @prop label — Текст подписи. Автоматически оборачивается в `<label>` с правильным `htmlFor`.
 * @prop error — Сообщение об ошибке. Отображается под чекбоксом. Место зарезервировано даже без ошибки.
 */

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Сообщение об ошибке. Место зарезервировано даже без ошибки (форма не прыгает). */
  error?: string;
  /** Текст подписи рядом с чекбоксом */
  label?: React.ReactNode;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, error, id, label, ...props }, ref) => {
  const errorId = error !== undefined && id ? `${id}-err` : undefined;
  const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
  const ariaInvalid = error ? true : props["aria-invalid"];

  const checkboxEl = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={id}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  const content = label ? (
    <div className="flex items-start gap-2">
      {checkboxEl}
      <label
        htmlFor={id}
        className="text-sm font-normal leading-tight cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  ) : (
    checkboxEl
  );

  if (error !== undefined) {
    return (
      <div>
        {content}
        <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
          {error || "\u00A0"}
        </p>
      </div>
    );
  }

  return content;
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
