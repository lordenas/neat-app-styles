import { Button } from "@/components/ui/button";
import { Calculator, FileSearch, Inbox } from "lucide-react";

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-md border border-dashed border-border">
      <div className="text-muted-foreground mb-3">{icon}</div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function EmptyStateShowcase() {
  return (
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
  );
}
