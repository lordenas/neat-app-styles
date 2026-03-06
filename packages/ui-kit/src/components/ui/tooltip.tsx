import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "../../lib/utils";

/**
 * Всплывающая подсказка при наведении (десктоп) или по клику (мобильные).
 *
 * На мобильных устройствах тултип открывается/закрывается по тапу,
 * так как hover-события недоступны на тач-экранах.
 *
 * @example
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Наведи / Тапни</TooltipTrigger>
 *     <TooltipContent>Текст подсказки</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Обёртка над Radix Tooltip.Root, которая на тач-устройствах
 * переключается в управляемый режим (open/onOpenChange по клику).
 */
function Tooltip({
  children,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

  // If externally controlled, pass through
  if (controlledOpen !== undefined) {
    return (
      <TooltipPrimitive.Root open={controlledOpen} onOpenChange={onOpenChange} {...props}>
        {children}
      </TooltipPrimitive.Root>
    );
  }

  if (isTouchDevice) {
    return (
      <TooltipPrimitive.Root
        open={uncontrolledOpen}
        onOpenChange={(val) => {
          setUncontrolledOpen(val);
          onOpenChange?.(val);
        }}
        delayDuration={0}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    );
  }

  return (
    <TooltipPrimitive.Root defaultOpen={defaultOpen} onOpenChange={onOpenChange} {...props}>
      {children}
    </TooltipPrimitive.Root>
  );
}

/**
 * Триггер тултипа. На мобильных добавляется onClick-обработчик
 * для переключения видимости.
 */
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, ...props }, ref) => {
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      onClick={(e) => {
        // On touch devices, prevent default to avoid double-triggering
        if ("ontouchstart" in window) {
          e.preventDefault();
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
