import { Skeleton, SkeletonCircle, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonForm } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";

/**
 * Витрина паттернов Skeleton-загрузки и AvatarGroup.
 */
export function SkeletonShowcase() {
  return (
    <div className="space-y-6">
      {/* Avatar Group */}
      <div className="space-y-3">
        <p className="text-sm font-medium">AvatarGroup</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">max=3 (из 5)</p>
            <AvatarGroup max={3}>
              <Avatar><AvatarFallback>АБ</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>ВГ</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>ДЕ</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>ЖЗ</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>ИК</AvatarFallback></Avatar>
            </AvatarGroup>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">size="sm", max=4</p>
            <AvatarGroup max={4} size="sm">
              <Avatar size="sm"><AvatarFallback>A</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>B</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>C</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>D</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>E</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>F</AvatarFallback></Avatar>
            </AvatarGroup>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">size="lg", max=2</p>
            <AvatarGroup max={2} size="lg">
              <Avatar size="lg"><AvatarFallback>ИИ</AvatarFallback></Avatar>
              <Avatar size="lg"><AvatarFallback>МС</AvatarFallback></Avatar>
              <Avatar size="lg"><AvatarFallback>АП</AvatarFallback></Avatar>
            </AvatarGroup>
          </div>
        </div>
      </div>

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
