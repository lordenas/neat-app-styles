import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function ModalAlertsShowcase() {
  const [open, setOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const dismiss = (key: string) => setDismissedAlerts((p) => [...p, key]);
  const isDismissed = (key: string) => dismissedAlerts.includes(key);

  return (
    <div className="space-y-4">
      {/* Alerts with onDismiss */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Alert с onDismiss (закрываемые)</p>
        {!isDismissed("info") && (
          <Alert onDismiss={() => dismiss("info")}>
            <Info className="h-4 w-4" />
            <AlertTitle>Информация</AlertTitle>
            <AlertDescription>Это информационное уведомление. Нажмите × чтобы закрыть.</AlertDescription>
          </Alert>
        )}
        {!isDismissed("success") && (
          <Alert variant="success" onDismiss={() => dismiss("success")}>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Успех</AlertTitle>
            <AlertDescription>Операция выполнена успешно.</AlertDescription>
          </Alert>
        )}
        {!isDismissed("warning") && (
          <Alert variant="warning" onDismiss={() => dismiss("warning")}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Предупреждение</AlertTitle>
            <AlertDescription>Обратите внимание на это сообщение.</AlertDescription>
          </Alert>
        )}
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>Подсказка</AlertTitle>
          <AlertDescription>Этот алерт без кнопки закрытия.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Произошла ошибка при выполнении операции.</AlertDescription>
        </Alert>
        <Alert variant="loading">
          <AlertTitle>Обработка платежа</AlertTitle>
          <AlertDescription>Пожалуйста, подождите. Это может занять несколько секунд.</AlertDescription>
        </Alert>
        {dismissedAlerts.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setDismissedAlerts([])}>
            Показать закрытые алерты
          </Button>
        )}
      </div>

      {/* Dialog sizes */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Dialog с размерами (size prop)</p>
        <div className="flex flex-wrap gap-2">
          {(["sm", "default", "lg", "xl"] as const).map((size) => (
            <Dialog key={size}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">size="{size}"</Button>
              </DialogTrigger>
              <DialogContent size={size}>
                <DialogHeader>
                  <DialogTitle>Dialog {size}</DialogTitle>
                  <DialogDescription>
                    Этот диалог использует size="{size}".
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Контент диалога размера {size}. Ширина ограничена через max-width.
                </p>
                <DialogFooter>
                  <Button variant="outline">Закрыть</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

      {/* Default dialog */}
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Открыть диалог</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подтверждение действия</DialogTitle>
              <DialogDescription>
                Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
              <Button onClick={() => setOpen(false)}>Подтвердить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
