import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, Settings, User, LogOut, HelpCircle } from "lucide-react";

export function SelectionsShowcase() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Select */}
        <div className="space-y-1.5">
          <Label>Select</Label>
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
          <p className="helper-text">Простой выпадающий список.</p>
        </div>

        {/* Grouped Select */}
        <div className="space-y-1.5">
          <Label>Select с группами</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Выберите город" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Россия</SelectLabel>
                <SelectItem value="moscow">Москва</SelectItem>
                <SelectItem value="spb">Санкт-Петербург</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Беларусь</SelectLabel>
                <SelectItem value="minsk">Минск</SelectItem>
                <SelectItem value="gomel">Гомель</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Dropdown Menu</p>
        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Действия <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Меню</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" /> Профиль
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" /> Настройки
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <HelpCircle className="h-4 w-4" /> Помощь
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" /> Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Checkboxes, Radio, Switch */}
      <div className="grid gap-6 sm:grid-cols-3">
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

      {/* Error states */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Состояния ошибки (error prop)</p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>RadioGroup с ошибкой</Label>
            <RadioGroup id="radio-err" error="Выберите один из вариантов">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="re1" />
                <label htmlFor="re1" className="text-sm">Вариант A</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="re2" />
                <label htmlFor="re2" className="text-sm">Вариант B</label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label>Switch с ошибкой</Label>
            <div className="flex items-center gap-2">
              <Switch id="sw-err" error="Необходимо принять условия" />
              <label htmlFor="sw-err" className="text-sm">Принимаю условия</label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>RadioGroup без ошибки (место зарезервировано)</Label>
            <RadioGroup id="radio-ok" error="">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="x" id="ro1" />
                <label htmlFor="ro1" className="text-sm">Опция</label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
