import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CheckCircle2, AlertTriangle, XCircle, Info, Bell } from "lucide-react";

export function NotificationShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Событие зарегистрировано",
              description: "Данные сохранены в системе.",
            })
          }
        >
          <Bell className="h-4 w-4 mr-1.5" />
          Default
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Расчёт сохранён",
              description: "График погашения обновлён успешно.",
              variant: "success",
              icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
            })
          }
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5 text-[hsl(var(--success))]" />
          Success
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Ошибка расчёта",
              description: "Проверьте введённые параметры и попробуйте снова.",
              variant: "destructive",
              icon: <XCircle className="h-5 w-5 text-destructive" />,
            })
          }
        >
          <XCircle className="h-4 w-4 mr-1.5 text-destructive" />
          Error
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Внимание",
              description: "Ставка выше средней по рынку — 18% годовых.",
              variant: "warning",
              icon: <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />,
            })
          }
        >
          <AlertTriangle className="h-4 w-4 mr-1.5 text-[hsl(var(--warning))]" />
          Warning
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Подсказка",
              description: "Добавьте досрочные погашения для уменьшения переплаты.",
              variant: "info",
              icon: <Info className="h-5 w-5 text-[hsl(var(--info))]" />,
            })
          }
        >
          <Info className="h-4 w-4 mr-1.5 text-[hsl(var(--info))]" />
          Info
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({
              title: "Файл экспортирован",
              description: "График сохранён в формате PDF.",
              variant: "success",
              icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
              action: <ToastAction altText="Отменить">Отменить</ToastAction>,
            })
          }
        >
          С действием
        </Button>
      </div>

      <p className="helper-text">
        Стиль Sonner: чистые карточки с тенью, цветной рамкой и иконкой по типу. Варианты:{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">default</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">destructive</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">success</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">warning</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">info</code>.
        До 3 одновременно, автозакрытие 5 сек с прогрессом.
      </p>
    </div>
  );
}
