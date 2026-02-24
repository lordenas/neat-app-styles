import { useState } from "react";
import { Multiselect } from "@/components/ui/multiselect";
import type { MultiselectOption } from "@/components/ui/multiselect";

const flatOptions: MultiselectOption[] = [
  { value: "dev", label: "Разработка" },
  { value: "design", label: "Дизайн" },
  { value: "mgmt", label: "Управление" },
  { value: "analytics", label: "Аналитика" },
  { value: "qa", label: "Тестирование" },
  { value: "devops", label: "DevOps" },
  { value: "marketing", label: "Маркетинг" },
  { value: "support", label: "Поддержка" },
];

const groupedOptions: MultiselectOption[] = [
  { value: "react", label: "React", group: "Frontend" },
  { value: "vue", label: "Vue", group: "Frontend" },
  { value: "angular", label: "Angular", group: "Frontend", disabled: true },
  { value: "node", label: "Node.js", group: "Backend" },
  { value: "python", label: "Python", group: "Backend" },
  { value: "go", label: "Go", group: "Backend", disabled: true },
  { value: "postgres", label: "PostgreSQL", group: "Database" },
  { value: "mongo", label: "MongoDB", group: "Database" },
  { value: "redis", label: "Redis", group: "Database" },
];

const disabledOptions: MultiselectOption[] = [
  { value: "free", label: "Бесплатный" },
  { value: "starter", label: "Стартер" },
  { value: "pro", label: "Pro", disabled: true },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

export function MultiselectShowcase() {
  const [selected1, setSelected1] = useState<string[]>(["dev", "design"]);
  const [selected2, setSelected2] = useState<string[]>(["react", "node", "angular", "postgres"]);
  const [selected3, setSelected3] = useState<string[]>(["free", "pro"]);

  return (
    <div className="space-y-6">
      <Multiselect
        label="Multiselect (базовый)"
        options={flatOptions}
        selected={selected1}
        onSelectedChange={setSelected1}
      />
      <Multiselect
        label="С группами и disabled (maxDisplayed=3)"
        options={groupedOptions}
        selected={selected2}
        onSelectedChange={setSelected2}
        maxDisplayed={3}
      />
      <Multiselect
        label="С заблокированными опциями"
        options={disabledOptions}
        selected={selected3}
        onSelectedChange={setSelected3}
      />
    </div>
  );
}
