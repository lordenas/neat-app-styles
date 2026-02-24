import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";

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

/**
 * Текстовое поле ввода с поддержкой размеров, иконок и форматирования чисел.
 *
 * @example
 * ```tsx
 * // Базовое использование
 * <Input placeholder="Введите текст..." />
 *
 * // С иконками
 * <Input inputStart={<Search />} placeholder="Поиск..." />
 * <Input inputEnd={<Eye />} placeholder="Пароль" type="password" />
 * <Input inputStart={<DollarSign />} inputEnd={<span>USD</span>} placeholder="0.00" />
 *
 * // Маленький размер
 * <Input inputSize="sm" placeholder="Компактное поле" />
 *
 * // Автоформатирование числа (1000000 → 1 000 000)
 * <Input formatNumber placeholder="Введите сумму" />
 * ```
 *
 * @prop inputSize - Размер поля: `"sm"` (h-8) | `"default"` (h-10)
 * @prop inputStart - React-элемент (иконка/текст), отображаемый в начале поля
 * @prop inputEnd - React-элемент (иконка/текст), отображаемый в конце поля
 * @prop formatNumber - Автоматически группирует цифры пробелами по разрядам. В `onChange` передаётся «сырое» числовое значение без пробелов
 */
export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  inputStart?: React.ReactNode;
  inputEnd?: React.ReactNode;
  /** Автоматически форматирует числовое значение с разделителями разрядов (пробелами) */
  formatNumber?: boolean;
  /** Сообщение об ошибке. Отображается под полем. Место зарезервировано даже без ошибки (форма не прыгает). */
  error?: string;
  /** Добавляет кнопку показа/скрытия пароля (для type="password") */
  showPasswordToggle?: boolean;
}

function formatWithSpaces(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function parseDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize, inputStart, inputEnd, formatNumber, error, showPasswordToggle, onChange, value, defaultValue, id, ...props }, ref) => {
    const [formatted, setFormatted] = React.useState(() =>
      formatNumber && value != null ? formatWithSpaces(String(value)) : undefined
    );
    const [showPassword, setShowPassword] = React.useState(false);

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

    const errorId = error !== undefined && id ? `${id}-err` : undefined;
    const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
    const ariaInvalid = error ? true : props["aria-invalid"];

    // Resolve effective type (password toggle)
    const isPasswordType = type === "password";
    const effectiveType = formatNumber ? "text" : (isPasswordType && showPassword ? "text" : type);

    const passwordToggle = showPasswordToggle && isPasswordType ? (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((v) => !v)}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    ) : null;

    const effectiveEnd = passwordToggle || inputEnd;

    const renderInput = () => {
      if (inputStart || effectiveEnd) {
        return (
          <div
            className={cn(
              "flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors",
              inputSize === "sm" ? "h-8" : "h-10",
              props.disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive",
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
              type={effectiveType}
              inputMode={formatNumber ? "numeric" : undefined}
              id={id}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              className={cn(
                "flex-1 bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed",
                inputSize === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-base md:text-sm",
                !inputStart && (inputSize === "sm" ? "pl-2.5" : "pl-3"),
                !effectiveEnd && (inputSize === "sm" ? "pr-2.5" : "pr-3"),
              )}
              ref={ref}
              {...inputProps}
            />
            {effectiveEnd && (
              <span className={cn(
                "flex items-center text-muted-foreground shrink-0",
                inputSize === "sm" ? "pr-2 [&>svg]:h-3.5 [&>svg]:w-3.5" : "pr-3 [&>svg]:h-4 [&>svg]:w-4"
              )}>
                {effectiveEnd}
              </span>
            )}
          </div>
        );
      }

      return (
        <input
          type={effectiveType}
          inputMode={formatNumber ? "numeric" : undefined}
          id={id}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(inputVariants({ inputSize }), error && "border-destructive", className)}
          ref={ref}
          {...inputProps}
        />
      );
    };

    if (error !== undefined) {
      return (
        <div>
          {renderInput()}
          <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
            {error || "\u00A0"}
          </p>
        </div>
      );
    }

    return renderInput();
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
