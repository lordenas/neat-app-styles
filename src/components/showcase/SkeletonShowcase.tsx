import { Skeleton, SkeletonCircle, SkeletonText, SkeletonAvatar } from "@/components/ui/skeleton";

/**
 * Витрина паттернов Skeleton-загрузки.
 * Демонстрирует скелетоны: базовые, пресеты (Circle, Text, Avatar), карточка, таблица, форма.
 */
export function SkeletonShowcase() {
  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Пресеты</p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Skeleton.Circle</p>
            <div className="flex items-center gap-3">
              <Skeleton.Circle size={32} />
              <Skeleton.Circle size={40} />
              <Skeleton.Circle size={48} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Skeleton.Text</p>
            <Skeleton.Text lines={3} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Skeleton.Avatar</p>
            <Skeleton.Avatar />
          </div>
        </div>
      </div>

      {/* Card skeleton */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Карточка</p>
        <div className="section-card space-y-4 max-w-sm">
          <SkeletonAvatar />
          <Skeleton className="h-32 w-full rounded-md" />
          <SkeletonText lines={3} />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Таблица</p>
        <div className="space-y-2 max-w-lg">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Форма</p>
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
