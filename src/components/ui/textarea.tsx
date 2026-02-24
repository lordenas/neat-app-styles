import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      inputSize: {
        sm: "min-h-[60px] text-xs",
        default: "min-h-[80px] text-base md:text-sm",
      },
    },
    defaultVariants: {
      inputSize: "default",
    },
  }
);

/**
 * Многострочное текстовое поле с поддержкой размеров и валидации.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Введите описание..." rows={4} />
 * <Textarea inputSize="sm" placeholder="Компактное поле" />
 * <Textarea error={errors.bio?.message ?? ""} {...register("bio")} />
 * <Textarea disabled value="Только для чтения" />
 * ```
 *
 * @prop inputSize - Размер поля: `"sm"` (min-h-[60px]) | `"default"` (min-h-[80px])
 * @prop error - Сообщение об ошибке. Резервирует место (min-h-[1rem]). Добавляет `border-destructive`, `aria-invalid`, `aria-describedby`
 */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /** Сообщение об ошибке. Отображается под полем. Место зарезервировано даже без ошибки (форма не прыгает). */
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, inputSize, error, id, ...props }, ref) => {
    const errorId = error !== undefined && id ? `${id}-err` : undefined;
    const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
    const ariaInvalid = error ? true : props["aria-invalid"];

    const textarea = (
      <textarea
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn(textareaVariants({ inputSize }), error && "border-destructive", className)}
        ref={ref}
        {...props}
      />
    );

    if (error !== undefined) {
      return (
        <div>
          {textarea}
          <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
            {error || "\u00A0"}
          </p>
        </div>
      );
    }

    return textarea;
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
