import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputGroup, InputAddon } from "@/components/ui/input-group";
import { Search, Mail, Calendar, DollarSign, Hash, MessageSquare, Lock, Globe } from "lucide-react";

export function InputsShowcase() {
  const [clearVal, setClearVal] = useState("Текст для очистки");
  const [clearSearch, setClearSearch] = useState("");
  const [autoText, setAutoText] = useState("");
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
            <Input id="error-input" error="Поле заполнено некорректно." value="Неверное значение" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Размеры (inputSize)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Small</Label>
            <Input inputSize="sm" placeholder="Маленькое поле..." />
          </div>
          <div className="space-y-1.5">
            <Label>Default</Label>
            <Input inputSize="default" placeholder="Обычное поле..." />
          </div>
          <div className="space-y-1.5">
            <Label>Large</Label>
            <Input inputSize="lg" placeholder="Крупное поле..." />
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
        <p className="text-xs text-muted-foreground mb-3">Пароль (showPasswordToggle)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pw-input">Пароль с тогглом</Label>
            <Input id="pw-input" type="password" showPasswordToggle inputStart={<Lock />} placeholder="Введите пароль..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-input2">Пароль (без иконки)</Label>
            <Input id="pw-input2" type="password" showPasswordToggle placeholder="Введите пароль..." />
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
        <p className="text-xs text-muted-foreground mb-3">Загрузка (loading)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Input с loading</Label>
            <Input loading placeholder="Проверка..." />
          </div>
          <div className="space-y-1.5">
            <Label>Input с loading + иконка</Label>
            <Input loading inputStart={<Mail />} placeholder="Валидация email..." />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Очистка (clearable)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Clearable с значением</Label>
            <Input clearable value={clearVal} onChange={e => setClearVal(e.target.value)} placeholder="Введите текст..." />
          </div>
          <div className="space-y-1.5">
            <Label>Поиск с clearable</Label>
            <Input clearable inputStart={<Search />} value={clearSearch} onChange={e => setClearSearch(e.target.value)} placeholder="Поиск..." />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">InputGroup (аддоны)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>URL с префиксом</Label>
            <InputGroup>
              <InputAddon>https://</InputAddon>
              <Input placeholder="example.com" className="rounded-l-none border-l-0" />
            </InputGroup>
          </div>
          <div className="space-y-1.5">
            <Label>Сумма с суффиксом</Label>
            <InputGroup>
              <Input placeholder="0.00" className="rounded-r-none border-r-0" />
              <InputAddon>₽</InputAddon>
            </InputGroup>
          </div>
          <div className="space-y-1.5">
            <Label>Домен с обоими</Label>
            <InputGroup>
              <InputAddon><Globe className="h-4 w-4" /></InputAddon>
              <Input placeholder="mysite" className="rounded-none border-x-0" />
              <InputAddon>.ru</InputAddon>
            </InputGroup>
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
            <Label htmlFor="textarea-lg">Крупный размер (inputSize="lg")</Label>
            <Textarea id="textarea-lg" inputSize="lg" placeholder="Большое поле для лендингов..." rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-err">С ошибкой</Label>
            <Textarea id="textarea-err" error="Поле обязательно для заполнения" placeholder="Введите текст..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-ok">Без ошибки (место зарезервировано)</Label>
            <Textarea id="textarea-ok" error="" placeholder="Ошибки нет, но место занято" />
          </div>
          <div className="space-y-1.5">
            <Label>С иконкой (inputStart)</Label>
            <Textarea inputStart={<MessageSquare />} placeholder="Комментарий..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>autoResize (maxRows=5)</Label>
            <Textarea 
              autoResize 
              maxRows={5} 
              value={autoText} 
              onChange={e => setAutoText(e.target.value)} 
              placeholder="Начните печатать — высота будет увеличиваться..." 
            />
            <p className="helper-text">Высота растёт до 5 строк, потом — скролл.</p>
          </div>
          <div className="space-y-1.5">
            <Label>С иконкой и ошибкой</Label>
            <Textarea id="ta-err2" inputStart={<MessageSquare />} error="Слишком короткий комментарий" placeholder="Введите текст..." rows={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
