import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FilterForm() {
  const [priceRange, setPriceRange] = useState([10000, 80000]);
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const featuresList = [
    "Удалённая работа",
    "Полная занятость",
    "Частичная занятость",
    "Стажировка",
    "С опытом от 3 лет",
    "Без опыта",
  ];

  return (
    <div className="space-y-5">
      <div className="form-section space-y-4">
        <div>
          <Label className="mb-2 block">Категория</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dev">Разработка</SelectItem>
              <SelectItem value="design">Дизайн</SelectItem>
              <SelectItem value="management">Управление</SelectItem>
              <SelectItem value="analytics">Аналитика</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block">
            Зарплата: {priceRange[0].toLocaleString("ru-RU")} ₽ — {priceRange[1].toLocaleString("ru-RU")} ₽
          </Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={300000}
            step={5000}
          />
        </div>

        <div>
          <Label className="mb-2 block">Условия</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featuresList.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Checkbox
                  id={f}
                  checked={features.includes(f)}
                  onCheckedChange={() => toggleFeature(f)}
                />
                <label htmlFor={f} className="text-sm cursor-pointer">{f}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button>Применить фильтры</Button>
        <Button
          variant="outline"
          onClick={() => {
            setCategory("");
            setPriceRange([10000, 80000]);
            setFeatures([]);
          }}
        >
          Сбросить
        </Button>
      </div>
    </div>
  );
}
