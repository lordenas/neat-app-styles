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
 * Многострочное текстовое поле с поддержкой размеров, иконок и валидации.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Введите описание..." rows={4} />
 * <Textarea inputSize="sm" placeholder="Компактное поле" />
 * <Textarea inputStart={<MessageSquare />} placeholder="Комментарий..." />
 * <Textarea error={errors.bio?.message ?? ""} {...register("bio")} />
 * ```
 *
 * @prop inputSize - Размер поля: `"sm"` (min-h-[60px]) | `"default"` (min-h-[80px])
 * @prop inputStart - React-элемент (иконка), отображаемый в начале поля
 * @prop inputEnd - React-элемент (иконка/текст), отображаемый в конце поля
 * @prop error - Сообщение об ошибке. Резервирует место (min-h-[1rem])
 */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /** Сообщение об ошибке. Отображается под полем. Место зарезервировано даже без ошибки (форма не прыгает). */
  error?: string;
  /** Элемент в начале поля (иконка) */
  inputStart?: React.ReactNode;
  /** Элемент в конце поля (иконка/текст) */
  inputEnd?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, inputSize, error, id, inputStart, inputEnd, ...props }, ref) => {
    const errorId = error !== undefined && id ? `${id}-err` : undefined;
    const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
    const ariaInvalid = error ? true : props["aria-invalid"];

    const textareaEl = (
      <textarea
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn(
          inputStart || inputEnd
            ? "flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed resize-y"
            : cn(textareaVariants({ inputSize }), error && "border-destructive"),
          inputStart || inputEnd
            ? inputSize === "sm" ? "min-h-[60px] text-xs py-1.5" : "min-h-[80px] text-base md:text-sm py-2"
            : "",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    const wrapped = inputStart || inputEnd ? (
      <div
        className={cn(
          "flex rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors",
          props.disabled && "cursor-not-allowed opacity-50",
          error && "border-destructive",
        )}
      >
        {inputStart && (
          <span className="flex items-start pt-2.5 pl-3 text-muted-foreground shrink-0 [&>svg]:h-4 [&>svg]:w-4">
            {inputStart}
          </span>
        )}
        <div className="flex-1 min-w-0 px-3">
          {textareaEl}
        </div>
        {inputEnd && (
          <span className="flex items-start pt-2.5 pr-3 text-muted-foreground shrink-0 [&>svg]:h-4 [&>svg]:w-4">
            {inputEnd}
          </span>
        )}
      </div>
    ) : textareaEl;

    if (error !== undefined) {
      return (
        <div>
          {wrapped}
          <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
            {error || "\u00A0"}
          </p>
        </div>
      );
    }

    return wrapped;
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
