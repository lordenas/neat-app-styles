import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Компонент рейтинга (звёзды).
 *
 * @example
 * ```tsx
 * <Rating value={3.5} onChange={setRating} />
 * <Rating value={4} readOnly size="lg" />
 * <Rating value={2} max={10} size="sm" />
 * ```
 *
 * @prop value - Текущее значение (0–max)
 * @prop max - Максимум звёзд (по умолчанию 5)
 * @prop onChange - Колбэк при клике (не вызывается если readOnly)
 * @prop readOnly - Запретить клик (только отображение)
 * @prop size - `"sm"` | `"default"` | `"lg"`
 * @prop allowHalf - Разрешить половинки (0.5 шаг)
 */
export interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "default" | "lg";
  allowHalf?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  default: "h-5 w-5",
  lg: "h-7 w-7",
};

export function Rating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = "default",
  allowHalf = false,
  className,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const displayValue = hovered ?? value;
  const iconSize = sizeMap[size];

  const handleClick = (star: number) => {
    if (readOnly || !onChange) return;
    onChange(star);
  };

  const handleMouseMove = (e: React.MouseEvent, star: number) => {
    if (readOnly) return;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeft = e.clientX - rect.left < rect.width / 2;
      setHovered(isLeft ? star - 0.5 : star);
    } else {
      setHovered(star);
    }
  };

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => setHovered(null)}
      role="radiogroup"
      aria-label="Рейтинг"
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const fill = displayValue >= star ? "full" : displayValue >= star - 0.5 ? "half" : "empty";

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(allowHalf && hovered ? hovered : star)}
            onMouseMove={(e) => handleMouseMove(e, star)}
            className={cn(
              "relative p-0 border-0 bg-transparent transition-transform",
              !readOnly && "cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              readOnly && "cursor-default"
            )}
            aria-label={`${star} из ${max}`}
          >
            {/* Empty star (background) */}
            <Star className={cn(iconSize, "text-muted-foreground/30")} />
            {/* Filled star (overlay) */}
            {fill !== "empty" && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={fill === "half" ? { width: "50%" } : undefined}
              >
                <Star className={cn(iconSize, "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]")} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
