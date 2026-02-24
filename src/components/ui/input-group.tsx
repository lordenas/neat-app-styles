import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Группа поля ввода с текстовым аддоном (префикс/суффикс).
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputAddon>https://</InputAddon>
 *   <Input placeholder="example.com" className="rounded-l-none border-l-0" />
 * </InputGroup>
 *
 * <InputGroup>
 *   <Input placeholder="0.00" className="rounded-r-none border-r-0" />
 *   <InputAddon>₽</InputAddon>
 * </InputGroup>
 * ```
 */

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-stretch", className)}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

export interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Визуальная сторона аддона (auto-определяется позицией, но можно задать явно) */
  position?: "start" | "end";
}

const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, position, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center border border-input bg-muted px-3 text-sm text-muted-foreground",
        "first:rounded-l-md first:border-r-0",
        "last:rounded-r-md last:border-l-0",
        className,
      )}
      {...props}
    />
  ),
);
InputAddon.displayName = "InputAddon";

export { InputGroup, InputAddon };
