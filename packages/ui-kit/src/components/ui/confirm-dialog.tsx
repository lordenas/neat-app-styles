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
} from "./alert-dialog";
import { buttonVariants } from "./button";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Высокоуровневый диалог подтверждения действия.
 * Поддерживает async `onConfirm` — при возврате Promise показывает спиннер и блокирует кнопки.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   trigger={<Button variant="destructive">Удалить</Button>}
 *   title="Удалить запись?"
 *   description="Это действие нельзя отменить."
 *   onConfirm={async () => { await api.deleteItem(id); }}
 *   variant="destructive"
 * />
 * ```
 */
interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
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
  const [loading, setLoading] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = onConfirm();
    if (result instanceof Promise) {
      setLoading(true);
      try {
        await result;
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(v) => !loading && setIsOpen(v)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              variant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog };
export type { ConfirmDialogProps };
