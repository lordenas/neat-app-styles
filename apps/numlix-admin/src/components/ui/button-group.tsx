import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Группа кнопок с объединёнными границами и скруглениями.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outline">Левая</Button>
 *   <Button variant="outline">Центр</Button>
 *   <Button variant="outline">Правая</Button>
 * </ButtonGroup>
 *
 * // Вертикальная группа
 * <ButtonGroup orientation="vertical">
 *   <Button variant="outline">Верх</Button>
 *   <Button variant="outline">Низ</Button>
 * </ButtonGroup>
 * ```
 *
 * @prop orientation - `"horizontal"` (по умолчанию) | `"vertical"`
 */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        "inline-flex",
        orientation === "vertical"
          ? "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:-mt-px [&>*:not(:last-child)]:rounded-b-none"
          : "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:-ml-px [&>*:not(:last-child)]:rounded-r-none",
        "[&>*]:focus-visible:z-10",
        className,
      )}
      {...props}
    />
  ),
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
