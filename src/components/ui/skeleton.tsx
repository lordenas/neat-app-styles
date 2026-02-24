import { cn } from "@/lib/utils";

/**
 * Заглушка-скелетон для отображения загрузки контента.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-48" />
 * <Skeleton className="h-10 w-full rounded-md" />
 * ```
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
