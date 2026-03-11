import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Kbd } from "@/components/ui/kbd";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, MessageSquare } from "lucide-react";

export function SliderTooltipShowcase() {
  const [value, setValue] = useState([50]);
  const [range, setRange] = useState([20, 80]);
  const [count, setCount] = useState(5);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Слайдер</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Текущее значение: {value[0]}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Slider value={value} onValueChange={setValue} max={100} step={1} />
          <p className="text-sm text-muted-foreground">Значение: {value[0]}</p>
        </div>

        <div className="space-y-3">
          <Label>Диапазон</Label>
          <Slider value={range} onValueChange={setRange} max={100} step={1} />
          <p className="text-sm text-muted-foreground">
            Диапазон: {range[0]} — {range[1]}
          </p>
        </div>

        <div className="space-y-3">
          <Label>Slider с ошибкой (error)</Label>
          <Slider id="slider-err" defaultValue={[10]} max={100} step={1} error="Минимальное значение — 20" />
        </div>

        <div className="space-y-3">
          <Label>Slider без ошибки (место зарезервировано)</Label>
          <Slider id="slider-ok" defaultValue={[50]} max={100} step={1} error="" />
        </div>
      </div>

      {/* NumberInput */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">NumberInput (stepper +/−)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Количество</Label>
            <NumberInput value={count} onChange={setCount} min={0} max={20} />
          </div>
          <div className="space-y-1.5">
            <Label>С ошибкой</Label>
            <NumberInput id="num-err" value={0} onChange={() => {}} min={0} max={10} error="Укажите количество больше 0" />
          </div>
        </div>
      </div>

      {/* Kbd */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Kbd — клавиатурные сочетания</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">Поиск: <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></span>
          <span className="text-sm">Сохранить: <Kbd>⌘</Kbd> + <Kbd>S</Kbd></span>
          <span className="text-sm">Отмена: <Kbd>Esc</Kbd></span>
          <span className="text-sm">Ввод: <Kbd>Enter</Kbd></span>
        </div>
      </div>

      {/* ConfirmDialog */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">ConfirmDialog</p>
        <div className="flex flex-wrap gap-3">
          <ConfirmDialog
            trigger={<Button variant="outline" size="sm">Подтвердить действие</Button>}
            title="Сохранить изменения?"
            description="Все несохранённые данные будут применены."
            onConfirm={() => { toast({ title: "Сохранено" }); }}
            confirmText="Сохранить"
          />
          <ConfirmDialog
            trigger={<Button variant="destructive" size="sm">Удалить</Button>}
            title="Удалить запись?"
            description="Это действие нельзя отменить. Все данные будут потеряны."
            onConfirm={() => { toast({ title: "Удалено" }); }}
            variant="destructive"
            confirmText="Удалить"
          />
        </div>
      </div>

      {/* Textarea with inputStart */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Textarea с иконкой (inputStart / inputEnd)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Комментарий (inputStart)</Label>
            <Textarea inputStart={<MessageSquare />} placeholder="Напишите комментарий..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>С иконкой и ошибкой</Label>
            <Textarea id="ta-icon-err" inputStart={<Info />} error="Поле обязательно" placeholder="Введите текст..." rows={3} />
          </div>
        </div>
      </div>

      {/* Tooltip examples */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Tooltip примеры</p>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm underline decoration-dotted cursor-help">
                Наведите сюда
              </span>
            </TooltipTrigger>
            <TooltipContent>Пояснительный текст для пользователя</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Иконка с подсказкой</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
