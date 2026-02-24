import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Mail, Eye, Calendar, DollarSign, Hash } from "lucide-react";

export function InputsShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Базовые поля</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="text-input">Текстовое поле</Label>
            <Input id="text-input" placeholder="Введите текст..." />
            <p className="helper-text">Подсказка к полю ввода.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="num-input">Числовое поле</Label>
            <Input id="num-input" type="number" placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="disabled-input">Заблокированное</Label>
            <Input id="disabled-input" disabled value="Нельзя изменить" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="error-input">С ошибкой</Label>
            <Input id="error-input" className="border-destructive focus-visible:ring-destructive" value="Неверное значение" />
            <p className="error-text">Поле заполнено некорректно.</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Размеры (inputSize)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Small</Label>
            <Input inputSize="sm" placeholder="Маленькое поле..." />
          </div>
          <div className="space-y-1.5">
            <Label>Default</Label>
            <Input inputSize="default" placeholder="Обычное поле..." />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">С иконками (inputStart / inputEnd)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Поиск (inputStart)</Label>
            <Input inputStart={<Search />} placeholder="Поиск..." />
          </div>
          <div className="space-y-1.5">
            <Label>Email (inputStart)</Label>
            <Input inputStart={<Mail />} placeholder="email@example.com" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>Пароль (inputEnd)</Label>
            <Input inputEnd={<Eye />} placeholder="Введите пароль" type="password" />
          </div>
          <div className="space-y-1.5">
            <Label>Дата (inputEnd)</Label>
            <Input inputEnd={<Calendar />} placeholder="дд.мм.гггг" />
          </div>
          <div className="space-y-1.5">
            <Label>Сумма (оба)</Label>
            <Input inputStart={<DollarSign />} inputEnd={<span className="text-xs">USD</span>} placeholder="0.00" type="number" />
          </div>
          <div className="space-y-1.5">
            <Label>Small с иконкой</Label>
            <Input inputSize="sm" inputStart={<Search />} placeholder="Поиск..." />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Форматирование числа (formatNumber)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Сумма с разбиением по разрядам</Label>
            <Input formatNumber inputStart={<Hash />} placeholder="1 000 000" />
            <p className="helper-text">Автоматическая группировка цифр пробелами.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Валюта</Label>
            <Input formatNumber inputEnd={<span className="text-xs">₽</span>} placeholder="0" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Textarea</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="textarea">Обычное поле</Label>
            <Textarea id="textarea" placeholder="Введите описание..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-sm">Маленький размер (inputSize="sm")</Label>
            <Textarea id="textarea-sm" inputSize="sm" placeholder="Компактное поле..." rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-err">С ошибкой</Label>
            <Textarea id="textarea-err" error="Поле обязательно для заполнения" placeholder="Введите текст..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-ok">Без ошибки (место зарезервировано)</Label>
            <Textarea id="textarea-ok" error="" placeholder="Ошибки нет, но место занято" />
          </div>
        </div>
      </div>
    </div>
  );
}
