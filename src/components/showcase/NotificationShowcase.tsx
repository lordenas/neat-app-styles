import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export function NotificationShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />}
          onClick={() =>
            toast.success("Расчёт сохранён", {
              description: "График погашения обновлён успешно.",
            })
          }
        >
          Success
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          onClick={() =>
            toast.error("Ошибка расчёта", {
              description: "Проверьте введённые параметры и попробуйте снова.",
            })
          }
        >
          Error
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />}
          onClick={() =>
            toast.warning("Внимание", {
              description: "Ставка выше средней по рынку — 18% годовых.",
            })
          }
        >
          Warning
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<Info className="h-4 w-4 text-[hsl(var(--info))]" />}
          onClick={() =>
            toast.info("Подсказка", {
              description: "Вы можете добавить досрочные погашения для уменьшения переплаты.",
            })
          }
        >
          Info
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast("Файл экспортирован", {
              description: "График сохранён в формате PDF.",
              action: {
                label: "Открыть",
                onClick: () => {},
              },
            })
          }
        >
          С действием
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const id = toast.loading("Пересчёт графика...");
            setTimeout(() => {
              toast.success("Готово!", {
                id,
                description: "График пересчитан с учётом досрочных погашений.",
              });
            }, 2000);
          }}
        >
          Loading → Success
        </Button>
      </div>

      <p className="helper-text">
        Используется библиотека Sonner. Вызов: <code className="text-xs bg-muted px-1 py-0.5 rounded">toast.success("Текст")</code>
      </p>
    </div>
  );
}
