import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-[hsl(var(--success))]/50 text-[hsl(var(--success))] dark:border-[hsl(var(--success))] [&>svg]:text-[hsl(var(--success))]",
        warning: "border-[hsl(var(--warning))]/50 text-[hsl(var(--warning))] dark:border-[hsl(var(--warning))] [&>svg]:text-[hsl(var(--warning))]",
        info: "border-[hsl(var(--info))]/50 text-[hsl(var(--info))] dark:border-[hsl(var(--info))] [&>svg]:text-[hsl(var(--info))]",
        loading: "border-border bg-muted/30 text-muted-foreground [&>svg]:text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Информационное уведомление (inline-блок) с иконкой, заголовком и описанием.
 *
 * @example
 * ```tsx
 * <Alert onDismiss={() => setVisible(false)}>
 *   <Info className="h-4 w-4" />
 *   <AlertTitle>Информация</AlertTitle>
 *   <AlertDescription>Данные были обновлены.</AlertDescription>
 * </Alert>
 *
 * <Alert variant="loading">
 *   <AlertTitle>Обработка</AlertTitle>
 *   <AlertDescription>Пожалуйста, подождите...</AlertDescription>
 * </Alert>
 * ```
 *
 * @prop variant - `"default"` | `"destructive"` | `"success"` | `"warning"` | `"info"` | `"loading"`
 * @prop onDismiss - Колбэк закрытия — добавляет кнопку ×
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      /** Колбэк при закрытии — показывает кнопку × */
      onDismiss?: () => void;
    }
>(({ className, variant, onDismiss, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), onDismiss && "pr-10", className)}
    {...props}
  >
    {variant === "loading" && (
      <Loader2 className="h-4 w-4 animate-spin" />
    )}
    {children}
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-sm p-0.5 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Закрыть"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
