import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

/**
 * Переключатель (switch) для бинарных состояний вкл/выкл.
 *
 * @example
 * ```tsx
 * <Switch id="notifications" label="Уведомления" checked={enabled} onCheckedChange={setEnabled} />
 * <Switch id="terms" error={errors.terms?.message ?? ""} />
 * ```
 *
 * @prop label - Текст подписи. Автоматически оборачивается в `<label>`.
 * @prop error - Сообщение об ошибке.
 */

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  error?: string;
  label?: React.ReactNode;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, error, id, label, ...props }, ref) => {
  const errorId = error !== undefined && id ? `${id}-err` : undefined;
  const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
  const ariaInvalid = error ? true : props["aria-invalid"];

  const switchEl = (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      id={id}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitives.Root>
  );

  const content = label ? (
    <div className="flex items-center gap-2">
      {switchEl}
      <label
        htmlFor={id}
        className="text-sm font-normal leading-tight cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  ) : (
    switchEl
  );

  if (error !== undefined) {
    return (
      <div>
        {content}
        <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
          {error || "\u00A0"}
        </p>
      </div>
    );
  }

  return content;
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
