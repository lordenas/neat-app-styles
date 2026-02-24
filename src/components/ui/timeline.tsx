import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Элемент таймлайна.
 */
export interface TimelineItem {
  /** Заголовок события */
  title: string;
  /** Описание */
  description?: string;
  /** Временная метка */
  time?: string;
  /** Иконка (React-элемент) */
  icon?: React.ReactNode;
  /** Цвет точки (CSS-класс) */
  dotClassName?: string;
}

/**
 * Timeline — вертикальная лента событий.
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     { title: "Заказ создан", time: "10:00", icon: <Package /> },
 *     { title: "Оплачен", time: "10:05" },
 *     { title: "Доставлен", time: "12:30" },
 *   ]}
 * />
 *
 * <Timeline variant="compact" items={items} />
 * <Timeline variant="alternate" items={items} />
 * ```
 *
 * @prop items - Массив событий
 * @prop variant - `"default"` | `"compact"` | `"alternate"`
 */
export interface TimelineProps {
  items: TimelineItem[];
  variant?: "default" | "compact" | "alternate";
  className?: string;
}

export function Timeline({ items, variant = "default", className }: TimelineProps) {
  const isCompact = variant === "compact";
  const isAlternate = variant === "alternate";

  return (
    <div className={cn("relative", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isRight = isAlternate && i % 2 === 1;

        if (isAlternate) {
          return (
            <div key={i} className="relative flex items-stretch justify-center pb-0">
              {/* Left content */}
              <div className={cn("flex-1 pb-6", isRight ? "invisible" : "text-right pr-4")}>
                <TimelineContent item={item} compact={false} align="right" />
              </div>

              {/* Center: dot + line */}
              <div className="relative flex flex-col items-center shrink-0">
                <TimelineDot item={item} compact={false} />
                {!isLast && <div className="w-0.5 flex-1 bg-border" />}
              </div>

              {/* Right content */}
              <div className={cn("flex-1 pb-6", !isRight ? "invisible" : "pl-4")}>
                <TimelineContent item={item} compact={false} />
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="relative flex items-stretch gap-3">
            {/* Dot + line */}
            <div className="relative flex flex-col items-center shrink-0">
              <TimelineDot item={item} compact={isCompact} />
              {!isLast && <div className={cn("w-0.5 flex-1 bg-border")} />}
            </div>

            {/* Content */}
            <div className={cn(isCompact ? "pb-3" : "pb-6")}>
              <TimelineContent item={item} compact={isCompact} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineDot({ item, compact }: { item: TimelineItem; compact: boolean }) {
  if (compact) {
    return (
      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 z-10", item.dotClassName || "bg-primary")} />
    );
  }

  return (
    <div
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10",
        item.icon ? "bg-primary text-primary-foreground" : "bg-muted border-2 border-border",
      )}
    >
      {item.icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>}
    </div>
  );
}

function TimelineContent({
  item,
  compact,
  align,
}: {
  item: TimelineItem;
  compact: boolean;
  align?: "right" | "left";
}) {
  return (
    <div className={cn(compact ? "mt-0" : "mt-1", align === "right" && "text-right")}>
      <div className={cn("flex items-baseline gap-2 flex-wrap", align === "right" && "justify-end")}>
        <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{item.title}</p>
        {item.time && (
          <span className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>{item.time}</span>
        )}
      </div>
      {item.description && (
        <p className={cn("text-muted-foreground mt-0.5", compact ? "text-[10px]" : "text-xs")}>{item.description}</p>
      )}
    </div>
  );
}
