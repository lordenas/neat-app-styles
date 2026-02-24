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

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Информация</AlertTitle>
          <AlertDescription>Это информационное уведомление для пользователя.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Успех</AlertTitle>
          <AlertDescription>Операция выполнена успешно.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Предупреждение</AlertTitle>
          <AlertDescription>Обратите внимание на это сообщение.</AlertDescription>
        </Alert>
        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>Подсказка</AlertTitle>
          <AlertDescription>Полезная информация для пользователя.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Произошла ошибка при выполнении операции.</AlertDescription>
        </Alert>
      </div>

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
