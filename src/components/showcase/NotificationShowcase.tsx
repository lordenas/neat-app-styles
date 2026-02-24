import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * Витрина Toast-уведомлений.
 * Демонстрирует все варианты: default, destructive, с действием.
 *
 * @example
 * ```tsx
 * import { toast } from "@/hooks/use-toast";
 * toast({ title: "Сохранено", description: "Описание" });
 * toast({ title: "Ошибка", description: "Описание", variant: "destructive" });
 * ```
 */
export function NotificationShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />}
          onClick={() =>
            toast({
              title: "Расчёт сохранён",
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
            toast({
              title: "Ошибка расчёта",
              description: "Проверьте введённые параметры и попробуйте снова.",
              variant: "destructive",
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
            toast({
              title: "Внимание",
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
            toast({
              title: "Подсказка",
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
            toast({
              title: "Файл экспортирован",
              description: "График сохранён в формате PDF.",
            })
          }
        >
          С действием
        </Button>
      </div>

      <p className="helper-text">
        Используется встроенный useToast. Вызов: <code className="text-xs bg-muted px-1 py-0.5 rounded">toast({"{"} title: "Текст" {"}"})</code>.
        Варианты: <code className="text-xs bg-muted px-1 py-0.5 rounded">default</code> и{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">destructive</code>.
      </p>
    </div>
  );
}
