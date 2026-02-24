import { Skeleton, SkeletonCircle, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonForm } from "@/components/ui/skeleton";

/**
 * Витрина паттернов Skeleton-загрузки.
 */
export function SkeletonShowcase() {
  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Базовые пресеты</p>
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

      {/* Composite presets */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Составные пресеты</p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">SkeletonCard</p>
            <SkeletonCard />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">SkeletonForm (fields=3)</p>
            <SkeletonForm fields={3} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">SkeletonTable (rows=4, cols=3)</p>
            <SkeletonTable rows={4} cols={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
