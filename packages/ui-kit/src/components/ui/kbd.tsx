import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Компонент для отображения клавиатурных сочетаний.
 *
 * @example
 * ```tsx
 * <Kbd>Ctrl+K</Kbd>
 * <Kbd>⌘</Kbd>
 * <Kbd>Enter</Kbd>
 * ```
 */
function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 text-[0.7rem] font-mono font-medium text-muted-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd };
