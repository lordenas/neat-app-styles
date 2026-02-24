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
 * <Progress value={100} variant="success" className="h-2" />
 * <Progress value={30} variant="warning" />
 * <Progress value={10} variant="destructive" />
 * <Progress value={50} variant="info" />
 * ```
 *
 * @prop value - Текущее значение прогресса (0–100)
 * @prop variant - Цвет: `"default"` | `"success"` | `"warning"` | `"destructive"` | `"info"`
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    VariantProps<typeof progressVariants>
>(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressVariants({ variant }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressVariants };
