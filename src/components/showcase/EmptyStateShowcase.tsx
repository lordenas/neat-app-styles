import { Button } from "@/components/ui/button";
import { Calculator, FileSearch, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Универсальный компонент пустого состояния.
 *
 * @param icon - Иконка (рекомендуется h-10 w-10 для default, h-6 w-6 для compact)
 * @param title - Заголовок пустого состояния
 * @param description - Пояснительный текст
 * @param action - Опциональная CTA-кнопка
 * @param size - `"default"` | `"compact"` — compact для таблиц и списков
 * @param bordered - Показывать dashed border (по умолчанию true для default, false для compact)
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  size = "default",
  bordered,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  size?: "default" | "compact";
  bordered?: boolean;
  className?: string;
}) {
  const isCompact = size === "compact";
  const showBorder = bordered ?? !isCompact;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-md",
        showBorder && "border border-dashed border-border",
        isCompact ? "py-6 px-3" : "py-12 px-4",
        className
      )}
    >
      <div className={cn("text-muted-foreground", isCompact ? "mb-2" : "mb-3")}>{icon}</div>
      <p className={cn("font-medium text-foreground", isCompact ? "text-xs" : "text-sm")}>{title}</p>
      <p className={cn("text-muted-foreground mt-1 max-w-xs", isCompact ? "text-[11px]" : "text-xs")}>{description}</p>
      {action && <div className={cn(isCompact ? "mt-2" : "mt-4")}>{action}</div>}
    </div>
  );
}

export { EmptyState };

export function EmptyStateShowcase() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EmptyState
          icon={<Calculator className="h-10 w-10" />}
          title="Нет расчётов"
          description="Заполните параметры кредита и нажмите «Рассчитать»"
          action={<Button size="sm">Рассчитать</Button>}
        />
        <EmptyState
          icon={<Inbox className="h-10 w-10" />}
          title="Список пуст"
          description="Досрочные погашения не добавлены. Добавьте первый платёж."
          action={<Button size="sm" variant="outline">Добавить</Button>}
        />
        <EmptyState
          icon={<FileSearch className="h-10 w-10" />}
          title="Ничего не найдено"
          description="Попробуйте изменить параметры поиска или сбросить фильтры."
        />
      </div>

      <p className="text-xs text-muted-foreground">Compact (для таблиц):</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EmptyState
          size="compact"
          icon={<Inbox className="h-6 w-6" />}
          title="Нет записей"
          description="Данные появятся после добавления."
        />
        <EmptyState
          size="compact"
          bordered
          icon={<FileSearch className="h-6 w-6" />}
          title="Ничего не найдено"
          description="Попробуйте другой запрос."
        />
      </div>
    </div>
  );
}
