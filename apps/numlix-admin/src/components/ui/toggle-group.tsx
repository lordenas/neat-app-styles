import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

/**
 * Группа кнопок-переключателей для выбора одного или нескольких значений.
 *
 * @example
 * ```tsx
 * // Одиночный выбор
 * <ToggleGroup type="single" defaultValue="center">
 *   <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
 *   <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
 *   <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
 * </ToggleGroup>
 *
 * // Множественный выбор
 * <ToggleGroup type="multiple" variant="outline">
 *   <ToggleGroupItem value="bold"><Bold /></ToggleGroupItem>
 *   <ToggleGroupItem value="italic"><Italic /></ToggleGroupItem>
 * </ToggleGroup>
 * ```
 *
 * @prop type - `"single"` | `"multiple"`
 * @prop variant - Наследуется из `Toggle`: `"default"` | `"outline"`
 * @prop size - Наследуется из `Toggle`: `"sm"` | `"default"` | `"lg"`
 */
const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
