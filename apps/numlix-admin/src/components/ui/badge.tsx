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
 * <Badge variant="success" dot>Онлайн</Badge>
 * <Badge variant="outline" active={isActive} onClick={() => toggle()}>Фильтр</Badge>
 * <Badge onDismiss={() => remove(id)}>Тег</Badge>
 * ```
 *
 * @prop variant - Стиль
 * @prop icon - Иконка перед текстом
 * @prop dot - Цветной кружок-индикатор
 * @prop onDismiss - Кнопка удаления ×
 * @prop active - Визуально выделяет бейдж (для фильтров)
 * @prop onClick - Делает бейдж кликабельным с hover/focus стилями
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  onDismiss?: () => void;
  dot?: boolean;
  /** Визуально выделяет бейдж (заливка для outline, кольцо для остальных) */
  active?: boolean;
}

function Badge({ className, variant, size, icon, onDismiss, dot, active, onClick, children, ...props }: BadgeProps) {
  const isClickable = !!onClick;

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(e as any); } } : undefined}
      className={cn(
        badgeVariants({ variant, size }),
        (icon || onDismiss || dot) && "gap-1",
        isClickable && "cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active && variant === "outline" && "bg-primary text-primary-foreground border-transparent",
        active && variant !== "outline" && "ring-2 ring-ring ring-offset-1",
        className
      )}
      {...props}
    >
      {dot && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-current" />}
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
