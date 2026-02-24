import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

/**
 * Витрина Slider и Tooltip.
 * Slider — одиночное значение и диапазон.
 * Tooltip — автоматически переключается в режим клика на тач-устройствах.
 *
 * @example
 * ```tsx
 * <Slider value={[50]} onValueChange={setValue} max={100} step={1} />
 * <Slider value={[20, 80]} onValueChange={setRange} max={100} />
 * ```
 */
export function SliderTooltipShowcase() {
  const [value, setValue] = useState([50]);
  const [range, setRange] = useState([20, 80]);

  return (
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

      <div className="space-y-3 sm:col-span-2">
        <Label>Tooltip примеры</Label>
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
