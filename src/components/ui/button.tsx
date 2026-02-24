import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]/90",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        default: "h-10 px-4 py-2 text-sm [&_svg]:size-4",
        lg: "h-11 px-6 text-sm [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-4",
        "icon-sm": "h-8 w-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Кнопка с поддержкой вариантов оформления, размеров и состояния загрузки.
 *
 * @example
 * ```tsx
 * <Button variant="default" size="sm">Сохранить</Button>
 * <Button variant="destructive">Удалить</Button>
 * <Button variant="outline" icon={<Plus />}>Добавить</Button>
 * <Button variant="ghost" size="icon"><Settings /></Button>
 * <Button loading>Сохранение...</Button>
 * <Button asChild><a href="/link">Ссылка-кнопка</a></Button>
 * ```
 *
 * @prop variant - Стиль кнопки: `"default"` | `"destructive"` | `"outline"` | `"secondary"` | `"ghost"` | `"link"`
 * @prop size - Размер: `"sm"` (h-8) | `"default"` (h-10) | `"lg"` (h-11) | `"icon"` (h-10 w-10) | `"icon-sm"` (h-8 w-8)
 * @prop icon - React-элемент иконки, отображается перед `children`
 * @prop loading - Показывает спиннер вместо иконки и делает кнопку `disabled`
 * @prop asChild - Если `true`, рендерит дочерний элемент вместо `<button>` (через Radix Slot)
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  /** Показывает спиннер вместо иконки и делает кнопку disabled */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : icon && icon}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
