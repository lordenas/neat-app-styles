import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Группа радиокнопок для выбора одного значения из набора.
 *
 * @example
 * ```tsx
 * <RadioGroup defaultValue="option1" onValueChange={(v) => console.log(v)}>
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="option1" id="r1" />
 *     <Label htmlFor="r1">Вариант 1</Label>
 *   </div>
 * </RadioGroup>
 *
 * // С ошибкой валидации
 * <RadioGroup id="role" error={errors.role?.message ?? ""}>
 *   ...
 * </RadioGroup>
 * ```
 *
 * @prop error - Сообщение об ошибке. Резервирует место (min-h-[1rem]). Добавляет `aria-invalid`, `aria-describedby`
 */

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /** Сообщение об ошибке. Отображается под группой. Место зарезервировано даже без ошибки (форма не прыгает). */
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

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
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
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
