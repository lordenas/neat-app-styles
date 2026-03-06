import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Pipette } from "lucide-react";

/**
 * Компактный выбор цвета из палитры пресетов + ручной ввод HEX.
 *
 * @example
 * ```tsx
 * <ColorPicker value={color} onChange={setColor} />
 * <ColorPicker value={color} onChange={setColor} presets={["#ff0000", "#00ff00"]} />
 * ```
 *
 * @prop value - Текущий цвет (HEX)
 * @prop onChange - Колбэк при выборе цвета
 * @prop presets - Массив пресетов HEX (по умолчанию — стандартная палитра)
 * @prop size - Размер триггера: `"sm"` | `"default"`
 */

const DEFAULT_PRESETS = [
  "#000000", "#374151", "#6b7280", "#9ca3af",
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#f43f5e", "#ffffff",
];

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  size?: "sm" | "default";
  className?: string;
}

export function ColorPicker({
  value = "#3b82f6",
  onChange,
  presets = DEFAULT_PRESETS,
  size = "default",
  className,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      onChange?.(v);
    }
  };

  const handleInputBlur = () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  const swatchSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          className={cn("gap-2 font-mono text-xs", className)}
        >
          <span
            className={cn("rounded border border-input shrink-0", swatchSize)}
            style={{ backgroundColor: value }}
          />
          {value.toUpperCase()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-1.5">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange?.(color);
                  setInputValue(color);
                }}
                className={cn(
                  "h-6 w-6 rounded-sm border transition-all hover:scale-110",
                  value === color
                    ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    : "border-input",
                )}
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Pipette className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              inputSize="sm"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="#000000"
              className="font-mono text-xs"
              maxLength={7}
            />
            <span
              className="h-6 w-6 rounded-sm border border-input shrink-0"
              style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(inputValue) ? inputValue : value }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
