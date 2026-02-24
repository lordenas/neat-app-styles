import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";

export function ColorPickerShowcase() {
  const [color1, setColor1] = useState("#3b82f6");
  const [color2, setColor2] = useState("#22c55e");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-6">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Default</p>
          <ColorPicker value={color1} onChange={setColor1} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Small</p>
          <ColorPicker value={color2} onChange={setColor2} size="sm" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Превью</p>
          <div
            className="h-10 w-32 rounded-md border transition-colors"
            style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
          />
        </div>
      </div>
      <p className="helper-text">
        Компактный выбор из палитры пресетов + ручной ввод HEX. Импорт:{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">ColorPicker</code>
      </p>
    </div>
  );
}
