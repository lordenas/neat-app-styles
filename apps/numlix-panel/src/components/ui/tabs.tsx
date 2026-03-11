import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Вкладки для переключения между контентом.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Контент 1</TabsContent>
 *   <TabsContent value="tab2">Контент 2</TabsContent>
 * </Tabs>
 *
 * // Underline-стиль
 * <Tabs defaultValue="tab1">
 *   <TabsList variant="underline">
 *     <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 *
 * // Outline-стиль
 * <Tabs defaultValue="tab1">
 *   <TabsList variant="outline">
 *     <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 * ```
 */
const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  "inline-flex items-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-10 justify-center rounded-md bg-muted p-1",
        underline: "gap-2 border-b border-border bg-transparent p-0 rounded-none",
        outline: "gap-0 bg-transparent p-0 rounded-none",
        vertical: "flex-col items-stretch gap-1 bg-transparent p-0 rounded-none border-r border-border pr-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type TabsListVariant = VariantProps<typeof tabsListVariants>["variant"];

const TabsListContext = React.createContext<TabsListVariant>("default");

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, variant = "default", ...props }, ref) => (
  <TabsListContext.Provider value={variant}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  </TabsListContext.Provider>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants: Record<NonNullable<TabsListVariant>, string> = {
  default:
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  underline:
    "inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-all border-b-2 border-transparent rounded-none -mb-px data-[state=active]:border-primary data-[state=active]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  outline:
    "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all border border-transparent rounded-t-md -mb-px data-[state=active]:border-border data-[state=active]:border-b-background data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  vertical:
    "inline-flex items-center justify-start whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all border-r-2 border-transparent -mr-px data-[state=active]:border-primary data-[state=active]:bg-muted data-[state=active]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
};

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsListContext) ?? "default";
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants[variant], className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, tabsListVariants, TabsTrigger, TabsContent };
