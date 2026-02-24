import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning: "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
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
 * <Alert>
 *   <Info className="h-4 w-4" />
 *   <AlertTitle>Информация</AlertTitle>
 *   <AlertDescription>Данные были обновлены.</AlertDescription>
 * </Alert>
 *
 * <Alert variant="destructive">
 *   <AlertCircle className="h-4 w-4" />
 *   <AlertTitle>Ошибка</AlertTitle>
 *   <AlertDescription>Не удалось сохранить данные.</AlertDescription>
 * </Alert>
 *
 * <Alert variant="success">
 *   <CheckCircle2 className="h-4 w-4" />
 *   <AlertTitle>Успех</AlertTitle>
 *   <AlertDescription>Данные сохранены.</AlertDescription>
 * </Alert>
 *
 * <Alert variant="warning">
 *   <AlertTriangle className="h-4 w-4" />
 *   <AlertTitle>Внимание</AlertTitle>
 *   <AlertDescription>Проверьте настройки.</AlertDescription>
 * </Alert>
 *
 * <Alert variant="info">
 *   <Info className="h-4 w-4" />
 *   <AlertTitle>Подсказка</AlertTitle>
 *   <AlertDescription>Полезная информация.</AlertDescription>
 * </Alert>
 * ```
 *
 * @prop variant - `"default"` | `"destructive"` | `"success"` | `"warning"` | `"info"`
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
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
