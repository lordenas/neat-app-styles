import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Числовое поле ввода с кнопками +/- (stepper).
 *
 * @example
 * ```tsx
 * <NumberInput value={count} onChange={setCount} min={0} max={100} step={1} />
 * <NumberInput value={qty} onChange={setQty} min={1} max={10} />
 * ```
 *
 * @prop value - Текущее числовое значение
 * @prop onChange - Колбэк при изменении значения
 * @prop min - Минимальное значение
 * @prop max - Максимальное значение
 * @prop step - Шаг изменения (по умолчанию 1)
 * @prop disabled - Заблокировать
 * @prop error - Сообщение об ошибке под полем
 */
interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  error?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, disabled, className, id, error }, ref) => {
    const clamp = (v: number) => {
      let clamped = v;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      return clamped;
    };

    const decrement = () => onChange(clamp(value - step));
    const increment = () => onChange(clamp(value + step));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || raw === "-") return;
      const num = Number(raw);
      if (!isNaN(num)) onChange(clamp(num));
    };

    const canDecrement = !disabled && (min === undefined || value > min);
    const canIncrement = !disabled && (max === undefined || value < max);

    const errorId = error !== undefined && id ? `${id}-err` : undefined;

    const input = (
      <div
        className={cn(
          "flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-destructive",
          className
        )}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={!canDecrement}
          className="flex items-center justify-center h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Уменьшить"
          tabIndex={-1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="flex-1 bg-transparent text-center text-sm font-mono focus:outline-none disabled:cursor-not-allowed min-w-0"
        />
        <button
          type="button"
          onClick={increment}
          disabled={!canIncrement}
          className="flex items-center justify-center h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Увеличить"
          tabIndex={-1}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );

    if (error !== undefined) {
      return (
        <div>
          {input}
          <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
            {error || "\u00A0"}
          </p>
        </div>
      );
    }

    return input;
  }
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
export type { NumberInputProps };
