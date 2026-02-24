import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type AvatarStatus = "online" | "away" | "offline" | "busy";

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-[hsl(var(--success))]",
  away: "bg-[hsl(var(--warning))]",
  offline: "bg-muted-foreground/50",
  busy: "bg-destructive",
};

const statusDotSize: Record<NonNullable<VariantProps<typeof avatarVariants>["size"]>, string> = {
  xs: "h-1.5 w-1.5 border",
  sm: "h-2 w-2 border-[1.5px]",
  default: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
  xl: "h-3.5 w-3.5 border-2",
};

/**
 * Аватар пользователя с размерами и статус-индикатором.
 *
 * @example
 * ```tsx
 * <Avatar size="lg" status="online">
 *   <AvatarImage src="/avatar.jpg" />
 *   <AvatarFallback>ИИ</AvatarFallback>
 * </Avatar>
 * ```
 *
 * @prop size - `"xs"` | `"sm"` | `"default"` | `"lg"` | `"xl"`
 * @prop status - `"online"` | `"away"` | `"offline"` | `"busy"` — показывает цветной индикатор
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof avatarVariants> & {
      status?: AvatarStatus;
    }
>(({ className, size, status, children, ...props }, ref) => (
  <div className="relative inline-flex">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
    {status && (
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-background",
          statusColors[status],
          statusDotSize[size ?? "default"],
        )}
        aria-label={status}
      />
    )}
  </div>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
