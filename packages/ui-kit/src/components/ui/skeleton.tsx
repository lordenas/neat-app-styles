import { cn } from "../../lib/utils";

/**
 * Заглушка-скелетон для отображения загрузки контента.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-48" />
 * <SkeletonCard />
 * <SkeletonTable rows={3} cols={4} />
 * <SkeletonForm fields={3} />
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

/**
 * Карточка-скелетон: аватар + текст + блок контента + кнопка.
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * ```
 */
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)} {...props}>
      <SkeletonAvatar />
      <Skeleton className="h-24 w-full rounded-md" />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
SkeletonCard.displayName = "Skeleton.Card";

/**
 * Таблица-скелетон с настраиваемым числом строк и колонок.
 *
 * @example
 * ```tsx
 * <SkeletonTable rows={5} cols={4} />
 * ```
 */
function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { rows?: number; cols?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex gap-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1 rounded" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={`${r}-${c}`}
              className="h-4 flex-1 rounded"
              style={c === 0 ? { maxWidth: "30%" } : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
SkeletonTable.displayName = "Skeleton.Table";

/**
 * Форма-скелетон: label + input повторённые N раз.
 *
 * @example
 * ```tsx
 * <SkeletonForm fields={3} />
 * ```
 */
function SkeletonForm({
  fields = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { fields?: number }) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
SkeletonForm.displayName = "Skeleton.Form";

Skeleton.Circle = SkeletonCircle;
Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Card = SkeletonCard;
Skeleton.Table = SkeletonTable;
Skeleton.Form = SkeletonForm;

export { Skeleton, SkeletonCircle, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonForm };
