import { useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

const frameworks: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "ember", label: "Ember", disabled: true },
];

export function ComboboxShowcase() {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [creatableOpts, setCreatableOpts] = useState<ComboboxOption[]>(frameworks);

  return (
    <div className="space-y-6">
      {/* Basic */}
      <div className="space-y-1.5">
        <Label>Базовый</Label>
        <Combobox options={frameworks} value={val1} onValueChange={setVal1} placeholder="Выберите фреймворк..." />
        {val1 && <p className="helper-text">Выбрано: {val1}</p>}
      </div>

      {/* Creatable */}
      <div className="space-y-1.5">
        <Label>Creatable (создание новых)</Label>
        <Combobox
          options={creatableOpts}
          value={val2}
          onValueChange={setVal2}
          creatable
          onCreateOption={(v) => setCreatableOpts((prev) => [...prev, { value: v.toLowerCase(), label: v }])}
          placeholder="Поиск или создание..."
          searchPlaceholder="Введите название..."
        />
        {val2 && <p className="helper-text">Выбрано: {val2}</p>}
      </div>

      {/* Disabled */}
      <div className="space-y-1.5">
        <Label>Disabled</Label>
        <Combobox options={frameworks} disabled placeholder="Недоступно" />
      </div>
    </div>
  );
}
