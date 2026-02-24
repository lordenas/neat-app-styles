import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

export function AlertDialogShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Destructive */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Удалить аккаунт</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие необратимо. Все данные, включая проекты и настройки, будут безвозвратно удалены.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={() => toast({ title: "Аккаунт удалён (демо)" })}
              >
                Удалить навсегда
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Warning / unsaved */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">Выйти без сохранения</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Несохранённые изменения</AlertDialogTitle>
              <AlertDialogDescription>
                У вас есть несохранённые изменения. Если вы покинете страницу, они будут потеряны.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Остаться</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast({ title: "Изменения отменены (демо)" })}>
                Выйти
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Simple confirm */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="secondary" size="sm">Сбросить настройки</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Сбросить все настройки?</AlertDialogTitle>
              <AlertDialogDescription>
                Все пользовательские настройки будут возвращены к значениям по умолчанию.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast({ title: "Настройки сброшены (демо)" })}>
                Сбросить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-xs text-muted-foreground">
        AlertDialog нельзя закрыть кликом по оверлею — только явное подтверждение или отмена.
      </p>
    </div>
  );
}
