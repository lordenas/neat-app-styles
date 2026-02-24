import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Высокоуровневый диалог подтверждения действия.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   trigger={<Button variant="destructive">Удалить</Button>}
 *   title="Удалить запись?"
 *   description="Это действие нельзя отменить."
 *   onConfirm={() => deleteItem(id)}
 *   variant="destructive"
 * />
 *
 * <ConfirmDialog
 *   trigger={<Button>Подтвердить</Button>}
 *   title="Сохранить изменения?"
 *   onConfirm={handleSave}
 *   confirmText="Сохранить"
 *   cancelText="Отмена"
 * />
 * ```
 *
 * @prop trigger - Элемент, открывающий диалог
 * @prop title - Заголовок диалога
 * @prop description - Описание (опционально)
 * @prop onConfirm - Колбэк при подтверждении
 * @prop variant - `"default"` | `"destructive"` — стиль кнопки подтверждения
 * @prop confirmText - Текст кнопки подтверждения (по умолчанию "Подтвердить")
 * @prop cancelText - Текст кнопки отмены (по умолчанию "Отмена")
 */
interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  confirmText?: string;
  cancelText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  variant = "default",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              variant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog };
export type { ConfirmDialogProps };
