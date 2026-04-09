import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../lib/utils";

const thumbClass =
  "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

/**
 * Ползунок для выбора числового значения или диапазона.
 *
 * @example
 * ```tsx
 * <Slider defaultValue={[50]} max={100} step={1} />
 * <Slider defaultValue={[25, 75]} max={100} step={5} />
 * <Slider id="amount" error={errors.amount?.message ?? ""} />
 * ```
 *
 * @prop error - Сообщение об ошибке. Резервирует место (min-h-[1rem]). Добавляет `aria-invalid`, `aria-describedby`
 */

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Сообщение об ошибке. Отображается под ползунком. Место зарезервировано даже без ошибки (форма не прыгает). */
  error?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, defaultValue, error, id, ...props }, ref) => {
  const thumbCount = value?.length ?? defaultValue?.length ?? 1;

  const errorId = error !== undefined && id ? `${id}-err` : undefined;
  const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
  const ariaInvalid = error ? true : props["aria-invalid"];

  const slider = (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      value={value}
      defaultValue={defaultValue}
      id={id}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <SliderPrimitive.Track className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
        error && "bg-destructive/20"
      )}>
        <SliderPrimitive.Range className={cn("absolute h-full", error ? "bg-destructive" : "bg-primary")} />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb key={i} className={cn(thumbClass, error && "border-destructive")} />
      ))}
    </SliderPrimitive.Root>
  );

  if (error !== undefined) {
    return (
      <div>
        {slider}
        <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
          {error || "\u00A0"}
        </p>
      </div>
    );
  }

  return slider;
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
