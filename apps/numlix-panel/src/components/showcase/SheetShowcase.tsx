import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, User, Settings } from "lucide-react";

export function SheetShowcase() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" icon={<User className="h-4 w-4" />}>Справа (форма)</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Редактирование профиля</SheetTitle>
              <SheetDescription>Измените данные и нажмите Сохранить</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="sh-name">Имя</Label>
                <Input id="sh-name" defaultValue="Иванов Иван" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sh-email">Email</Label>
                <Input id="sh-email" type="email" defaultValue="ivan@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sh-role">Роль</Label>
                <Select defaultValue="dev">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Разработчик</SelectItem>
                    <SelectItem value="design">Дизайнер</SelectItem>
                    <SelectItem value="pm">Менеджер</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sh-bio">О себе</Label>
                <Textarea id="sh-bio" placeholder="Расскажите о себе..." rows={3} />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Отмена</Button>
              </SheetClose>
              <Button>Сохранить</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" icon={<Filter className="h-4 w-4" />}>Слева (фильтры)</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Фильтры</SheetTitle>
              <SheetDescription>Настройте параметры отображения</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Отдел</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все отделы</SelectItem>
                    <SelectItem value="dev">Разработка</SelectItem>
                    <SelectItem value="design">Дизайн</SelectItem>
                    <SelectItem value="mgmt">Управление</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Статус</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["Активный", "На паузе", "Уволен"].map((s) => (
                    <Badge key={s} variant="outline" className="cursor-pointer">{s}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Зарплата от</Label>
                <Input type="number" placeholder="0" inputSize="sm" />
              </div>
            </div>
            <SheetFooter>
              <Button className="w-full">Применить</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" icon={<Settings className="h-4 w-4" />}>Детали записи</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Иванов Иван</SheetTitle>
              <SheetDescription>Детальная информация о сотруднике</SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-3">
              {[
                ["Отдел", "Разработка"],
                ["Должность", "Старший разработчик"],
                ["Стаж", "5 лет"],
                ["Email", "ivanov@company.ru"],
                ["Телефон", "+7 900 111-22-33"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Текущие задачи</p>
                <div className="space-y-1">
                  {["Рефакторинг API", "Code Review", "Документация"].map((t) => (
                    <div key={t} className="text-sm px-2 py-1.5 rounded-md bg-muted/50">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <p className="helper-text">
        Боковая панель: <code className="text-xs bg-muted px-1 py-0.5 rounded">side="right"</code> (по умолчанию),{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">side="left"</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">side="top"</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">side="bottom"</code>.
      </p>
    </div>
  );
}
