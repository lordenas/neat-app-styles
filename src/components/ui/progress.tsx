import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-[hsl(var(--success))]",
      warning: "bg-[hsl(var(--warning))]",
      destructive: "bg-destructive",
      info: "bg-[hsl(var(--info))]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Индикатор прогресса (прогресс-бар) с цветовыми вариантами.
 *
 * @example
 * ```tsx
 * <Progress value={60} />
 * <Progress value={60} showValue />
 * <Progress indeterminate />
 * <Progress indeterminate variant="info" />
 * <Progress value={100} variant="success" className="h-2" />
 * ```
 *
 * @prop value - Текущее значение прогресса (0–100)
 * @prop variant - Цвет: `"default"` | `"success"` | `"warning"` | `"destructive"` | `"info"`
 * @prop showValue - Показывать числовое значение справа
 * @prop indeterminate - Бесконечная анимация загрузки
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    VariantProps<typeof progressVariants> & {
      showValue?: boolean;
      indeterminate?: boolean;
    }
>(({ className, value, variant, showValue, indeterminate, ...props }, ref) => {
  const bar = (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          progressVariants({ variant }),
          indeterminate && "w-1/4 animate-[progress-indeterminate_1.5s_ease-in-out_infinite]"
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );

  if (showValue && !indeterminate) {
    return (
      <div className="flex items-center gap-3">
        {bar}
        <span className="text-sm font-medium tabular-nums text-foreground">{value ?? 0}%</span>
      </div>
    );
  }

  return bar;
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressVariants };
