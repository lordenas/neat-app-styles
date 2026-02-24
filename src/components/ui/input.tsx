import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      inputSize: {
        sm: "h-8 px-2.5 py-1 text-xs",
        default: "h-10 px-3 py-2 text-base md:text-sm",
      },
    },
    defaultVariants: {
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  inputStart?: React.ReactNode;
  inputEnd?: React.ReactNode;
  /** Автоматически форматирует числовое значение с разделителями разрядов (пробелами) */
  formatNumber?: boolean;
}

function formatWithSpaces(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parseDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize, inputStart, inputEnd, formatNumber, onChange, value, defaultValue, ...props }, ref) => {
    const [formatted, setFormatted] = React.useState(() =>
      formatNumber && value != null ? formatWithSpaces(String(value)) : undefined
    );

    React.useEffect(() => {
      if (formatNumber && value != null) {
        setFormatted(formatWithSpaces(String(value)));
      }
    }, [formatNumber, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (formatNumber) {
        const raw = parseDigits(e.target.value);
        const display = formatWithSpaces(raw);
        setFormatted(display);
        // Expose raw numeric value to parent
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: raw },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      } else {
        onChange?.(e);
      }
    };

    const inputProps = formatNumber
      ? { ...props, value: formatted ?? "", onChange: handleChange }
      : { ...props, value, defaultValue, onChange };
    if (inputStart || inputEnd) {
      return (
        <div
          className={cn(
            "flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors",
            inputSize === "sm" ? "h-8" : "h-10",
            props.disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          {inputStart && (
            <span className={cn(
              "flex items-center text-muted-foreground shrink-0",
              inputSize === "sm" ? "pl-2 [&>svg]:h-3.5 [&>svg]:w-3.5" : "pl-3 [&>svg]:h-4 [&>svg]:w-4"
            )}>
              {inputStart}
            </span>
          )}
          <input
            type={formatNumber ? "text" : type}
            inputMode={formatNumber ? "numeric" : undefined}
            className={cn(
              "flex-1 bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed",
              inputSize === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-base md:text-sm",
              !inputStart && (inputSize === "sm" ? "pl-2.5" : "pl-3"),
              !inputEnd && (inputSize === "sm" ? "pr-2.5" : "pr-3"),
            )}
            ref={ref}
            {...inputProps}
          />
          {inputEnd && (
            <span className={cn(
              "flex items-center text-muted-foreground shrink-0",
              inputSize === "sm" ? "pr-2 [&>svg]:h-3.5 [&>svg]:w-3.5" : "pr-3 [&>svg]:h-4 [&>svg]:w-4"
            )}>
              {inputEnd}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={formatNumber ? "text" : type}
        inputMode={formatNumber ? "numeric" : undefined}
        className={cn(inputVariants({ inputSize }), className)}
        ref={ref}
        {...inputProps}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
