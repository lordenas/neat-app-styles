import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]/80",
        warning: "border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/80",
        info: "border-transparent bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] hover:bg-[hsl(var(--info))]/80",
        outline: "text-foreground",
      },
      size: {
        sm: "px-2 py-px text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Компактная метка/чип для статусов, категорий и тегов.
 *
 * @example
 * ```tsx
 * <Badge>Новый</Badge>
 * <Badge variant="secondary">Черновик</Badge>
 * <Badge variant="destructive">Ошибка</Badge>
 * <Badge variant="success">Успех</Badge>
 * <Badge icon={<Star className="h-3 w-3" />}>Избранное</Badge>
 * <Badge onDismiss={() => remove(id)}>Тег</Badge>
 * ```
 *
 * @prop variant - Стиль: `"default"` | `"secondary"` | `"destructive"` | `"success"` | `"warning"` | `"info"` | `"outline"`
 * @prop icon - React-элемент иконки, отображается перед текстом
 * @prop onDismiss - Колбэк при клике на кнопку удаления (×). Добавляет кнопку × справа
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  /** Иконка перед текстом */
  icon?: React.ReactNode;
  /** Колбэк удаления — добавляет кнопку × */
  onDismiss?: () => void;
}

function Badge({ className, variant, size, icon, onDismiss, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        (icon || onDismiss) && "gap-1",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span>}
      {children}
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="shrink-0 rounded-full p-0.5 hover:bg-foreground/20 transition-colors"
          aria-label="Удалить"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
