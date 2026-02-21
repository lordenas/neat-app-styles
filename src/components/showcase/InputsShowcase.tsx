import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InputsShowcase() {
  return (
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
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="textarea">Многострочное поле</Label>
        <Textarea id="textarea" placeholder="Введите описание..." rows={3} />
      </div>
    </div>
  );
}
