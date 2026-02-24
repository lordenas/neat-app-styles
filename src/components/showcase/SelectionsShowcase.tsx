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
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronDown, Settings, User, LogOut, HelpCircle, Bold, Italic, Underline, Star, Heart, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export function SelectionsShowcase() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Select */}
        <div className="space-y-1.5">
          <Label>Select (default)</Label>
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

        {/* Select sm */}
        <div className="space-y-1.5">
          <Label>Select (inputSize="sm")</Label>
          <Select>
            <SelectTrigger inputSize="sm">
              <SelectValue placeholder="Компактный" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opt1">Опция 1</SelectItem>
              <SelectItem value="opt2">Опция 2</SelectItem>
              <SelectItem value="opt3">Опция 3</SelectItem>
            </SelectContent>
          </Select>
          <p className="helper-text">Маленький размер — h-8, text-xs.</p>
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

      {/* Toggle variants */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Toggle — варианты (default / outline / filled) и size="icon"</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">default</p>
            <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">outline</p>
            <Toggle variant="outline" aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">filled</p>
            <Toggle variant="filled" aria-label="Star"><Star className="h-4 w-4" /></Toggle>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">filled icon</p>
            <Toggle variant="filled" size="icon" aria-label="Heart"><Heart className="h-4 w-4" /></Toggle>
          </div>
        </div>
      </div>

      {/* ToggleGroup */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">ToggleGroup (filled variant)</p>
        <div className="flex flex-wrap items-center gap-4">
          <ToggleGroup type="single" variant="filled" defaultValue="center">
            <ToggleGroupItem value="left" aria-label="Left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="multiple" variant="outline">
            <ToggleGroupItem value="bold" aria-label="Bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Checkboxes with label */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-3">
          <Label>Чекбоксы (label prop)</Label>
          <div className="space-y-2">
            <Checkbox id="cb1" defaultChecked label="Выбрано" />
            <Checkbox id="cb2" label="Не выбрано" />
            <Checkbox id="cb3" disabled label="Заблокировано" />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Радиокнопки (label prop)</Label>
          <RadioGroup defaultValue="r1">
            <RadioGroupItem value="r1" id="r1" label="Вариант 1" />
            <RadioGroupItem value="r2" id="r2" label="Вариант 2" />
            <RadioGroupItem value="r3" id="r3" label="Вариант 3" />
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Переключатели (label prop)</Label>
          <div className="space-y-3">
            <Switch id="sw1" defaultChecked label="Включено" />
            <Switch id="sw2" label="Выключено" />
            <Switch id="sw3" disabled label="Заблокировано" />
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
              <RadioGroupItem value="a" id="re1" label="Вариант A" />
              <RadioGroupItem value="b" id="re2" label="Вариант B" />
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label>Switch с ошибкой</Label>
            <Switch id="sw-err" label="Принимаю условия" error="Необходимо принять условия" />
          </div>

          <div className="space-y-1.5">
            <Label>Checkbox с label и ошибкой</Label>
            <Checkbox id="cb-err" label="Согласен с условиями" error="Необходимо согласие" />
          </div>
        </div>
      </div>
    </div>
  );
}
