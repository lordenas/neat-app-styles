import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "border shadow-sm",
        outline: "border-2",
        elevated: "shadow-md border-0",
        interactive: "border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        selected: "border-2 border-primary ring-2 ring-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Контейнер-карточка с вариантами оформления.
 *
 * @example
 * ```tsx
 * <Card>Обычная карточка</Card>
 * <Card variant="outline">Только рамка</Card>
 * <Card variant="elevated">С тенью</Card>
 * <Card variant="interactive">Кликабельная с hover-эффектом</Card>
 * <Card variant="selected">Выбранная карточка</Card>
 * <Card variant={active ? "selected" : "outline"} asButton onClick={toggle}>Выбор</Card>
 * ```
 *
 * @prop variant - `"default"` | `"outline"` | `"elevated"` | `"interactive"` | `"selected"`
 * @prop asButton - Рендерит `<button>` вместо `<div>` для доступности
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & {
    asButton?: boolean;
  }
>(({ className, variant, asButton, ...props }, ref) => {
  const Comp = asButton ? "button" : "div";
  return (
    <Comp
      ref={ref as any}
      className={cn(
        cardVariants({ variant }),
        asButton && "text-left w-full cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...(props as any)}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
