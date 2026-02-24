import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonShowcase() {
  return (
    <div className="space-y-6">
      {/* Card skeleton */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Карточка</p>
        <div className="section-card space-y-4 max-w-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Таблица</p>
        <div className="space-y-2 max-w-lg">
          {/* Header */}
          <div className="flex gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Rows */}
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
