import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export function SelectionsShowcase() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Выпадающий список</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Выберите опцию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Опция 1</SelectItem>
            <SelectItem value="opt2">Опция 2</SelectItem>
            <SelectItem value="opt3">Опция 3</SelectItem>
          </SelectContent>
        </Select>
        <p className="helper-text">Подсказка для селекта.</p>
      </div>

      <div className="space-y-3">
        <Label>Чекбоксы</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="cb1" defaultChecked />
            <label htmlFor="cb1" className="text-sm">Выбрано</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb2" />
            <label htmlFor="cb2" className="text-sm">Не выбрано</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb3" disabled />
            <label htmlFor="cb3" className="text-sm text-muted-foreground">Заблокировано</label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Радиокнопки</Label>
        <RadioGroup defaultValue="r1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="r1" id="r1" />
            <label htmlFor="r1" className="text-sm">Вариант 1</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="r2" id="r2" />
            <label htmlFor="r2" className="text-sm">Вариант 2</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="r3" id="r3" />
            <label htmlFor="r3" className="text-sm">Вариант 3</label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Переключатели</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch id="sw1" defaultChecked />
            <label htmlFor="sw1" className="text-sm">Включено</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="sw2" />
            <label htmlFor="sw2" className="text-sm">Выключено</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="sw3" disabled />
            <label htmlFor="sw3" className="text-sm text-muted-foreground">Заблокировано</label>
          </div>
        </div>
      </div>
    </div>
  );
}
