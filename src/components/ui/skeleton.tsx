import { cn } from "@/lib/utils";

/**
 * Заглушка-скелетон для отображения загрузки контента.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-48" />
 * <Skeleton.Circle size={40} />
 * <Skeleton.Text lines={3} />
 * <Skeleton.Avatar />
 * ```
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

/** Круглый скелетон для аватаров и иконок */
function SkeletonCircle({ size = 40, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) {
  return (
    <div
      className={cn("animate-pulse rounded-full bg-muted shrink-0", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
SkeletonCircle.displayName = "Skeleton.Circle";

/** Несколько строк-скелетонов для текста */
function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number; lastLineWidth?: string }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-md bg-muted h-3"
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}
SkeletonText.displayName = "Skeleton.Text";

/** Аватар + 2 строки текста — популярный паттерн */
function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <SkeletonCircle size={40} />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
SkeletonAvatar.displayName = "Skeleton.Avatar";

Skeleton.Circle = SkeletonCircle;
Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;

export { Skeleton, SkeletonCircle, SkeletonText, SkeletonAvatar };
