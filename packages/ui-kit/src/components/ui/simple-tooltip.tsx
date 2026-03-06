import * as React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";

/**
 * Обёртка для быстрого создания тултипа в одну строку.
 *
 * @example
 * ```tsx
 * <SimpleTooltip content="Настройки">
 *   <Button size="icon"><Settings /></Button>
 * </SimpleTooltip>
 *
 * <SimpleTooltip content="Копировать" side="right">
 *   <CopyButton value="text" />
 * </SimpleTooltip>
 * ```
 */
interface SimpleTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

function SimpleTooltip({ children, content, side, delayDuration = 300 }: SimpleTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { SimpleTooltip };
export type { SimpleTooltipProps };
