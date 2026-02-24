import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Группа радиокнопок для выбора одного значения из набора.
 *
 * @example
 * ```tsx
 * <RadioGroup defaultValue="option1">
 *   <RadioGroupItem value="option1" id="r1" label="Вариант 1" />
 *   <RadioGroupItem value="option2" id="r2" label="Вариант 2" />
 * </RadioGroup>
 * ```
 *
 * @prop error - Сообщение об ошибке
 */

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  error?: string;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, error, id, ...props }, ref) => {
  const errorId = error !== undefined && id ? `${id}-err` : undefined;
  const ariaDescribedBy = [props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
  const ariaInvalid = error ? true : props["aria-invalid"];

  const group = (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      id={id}
      {...props}
      ref={ref}
    />
  );

  if (error !== undefined) {
    return (
      <div>
        {group}
        <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
          {error || "\u00A0"}
        </p>
      </div>
    );
  }

  return group;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** Текст подписи рядом с радиокнопкой */
  label?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, id, ...props }, ref) => {
  const radio = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );

  if (label) {
    return (
      <div className="flex items-center gap-2">
        {radio}
        <label
          htmlFor={id}
          className="text-sm font-normal leading-tight cursor-pointer"
        >
          {label}
        </label>
      </div>
    );
  }

  return radio;
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
