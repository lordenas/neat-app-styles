import { CalcField } from "@/types/custom-calc";
import { resolveVisibility } from "@/lib/calc-engine";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayerResult } from "./PlayerResult";

interface PlayerFieldProps {
  field: CalcField;
  allFields: CalcField[];
  values: Record<string, number | string | boolean>;
  onChange: (key: string, value: number | string | boolean) => void;
}

export function PlayerField({ field, allFields, values, onChange }: PlayerFieldProps) {
  const visible = resolveVisibility(field.visibility, values, allFields);
  if (!visible) return null;

  if (field.type === "result") {
    return (
      <PlayerResult field={field} allFields={allFields} inputValues={values} />
    );
  }

  const rawVal = values[field.key];
  const strVal = rawVal !== undefined ? String(rawVal) : "";
  const numVal = parseFloat(strVal) || 0;

  const label = (
    <Label className="text-sm font-medium">
      {field.label}
      {field.config.unit && (
        <span className="ml-1 text-muted-foreground font-normal text-xs">({field.config.unit})</span>
      )}
    </Label>
  );

  let control: React.ReactNode = null;

  switch (field.type) {
    case "number":
      control = (
        <Input
          type="number"
          value={strVal}
          onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
          min={field.config.min}
          max={field.config.max}
          step={field.config.step}
          placeholder={field.config.placeholder ?? "Введите значение"}
        />
      );
      break;

    case "text":
      control = (
        <Input
          value={strVal}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.config.placeholder ?? "Введите текст"}
        />
      );
      break;

    case "slider": {
      const min = field.config.min ?? 0;
      const max = field.config.max ?? 100;
      const step = field.config.step ?? 1;
      control = (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min.toLocaleString("ru-RU")}</span>
            <span className="font-medium text-foreground">
              {numVal.toLocaleString("ru-RU")} {field.config.unit}
            </span>
            <span>{max.toLocaleString("ru-RU")}</span>
          </div>
          <Slider
            value={[numVal]}
            onValueChange={([v]) => onChange(field.key, v)}
            min={min}
            max={max}
            step={step}
          />
        </div>
      );
      break;
    }

    case "select":
      control = (
        <Select value={strVal} onValueChange={(v) => onChange(field.key, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите..." />
          </SelectTrigger>
          <SelectContent>
            {(field.config.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      break;

    case "radio":
      control = (
        <RadioGroup
          value={strVal}
          onValueChange={(v) => onChange(field.key, v)}
          className="flex flex-wrap gap-3"
        >
          {(field.config.options ?? []).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`${field.key}_${opt.value}`} />
              <Label htmlFor={`${field.key}_${opt.value}`} className="cursor-pointer font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
      break;

    case "checkbox": {
      const checked = rawVal === true || rawVal === 1 || rawVal === "true";
      control = (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.key}
            checked={checked}
            onCheckedChange={(v) => onChange(field.key, !!v)}
          />
          <Label htmlFor={field.key} className="cursor-pointer font-normal">{field.label}</Label>
        </div>
      );
      return (
        <div className="py-1">
          {control}
          {field.config.hint && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">{field.config.hint}</p>
          )}
        </div>
      );
    }
  }

  return (
    <div className="space-y-2">
      {label}
      {control}
      {field.config.hint && (
        <p className="text-xs text-muted-foreground">{field.config.hint}</p>
      )}
    </div>
  );
}
