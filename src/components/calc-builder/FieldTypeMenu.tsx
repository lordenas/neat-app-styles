import { CalcFieldType } from "@/types/custom-calc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Hash, Type, ChevronDown, ToggleLeft, SlidersHorizontal,
  List, CircleDot, Calculator, PlusCircle, AlignLeft,
  MousePointerClick, TextQuote,
} from "lucide-react";

const FIELD_TYPES_GROUPS: {
  group: string;
  items: { type: CalcFieldType; label: string; icon: React.ReactNode; description: string }[];
}[] = [
  {
    group: "Ввод данных",
    items: [
      { type: "number",   label: "Число",        icon: <Hash className="h-4 w-4" />,              description: "Числовой ввод с min/max" },
      { type: "text",     label: "Текст",         icon: <Type className="h-4 w-4" />,              description: "Однострочное текстовое поле" },
      { type: "textarea", label: "Многострочный", icon: <AlignLeft className="h-4 w-4" />,         description: "Textarea для длинного текста" },
      { type: "slider",   label: "Слайдер",       icon: <SlidersHorizontal className="h-4 w-4" />, description: "Ползунок с диапазоном" },
      { type: "select",   label: "Список",        icon: <List className="h-4 w-4" />,              description: "Выпадающий список" },
      { type: "radio",    label: "Радио",         icon: <CircleDot className="h-4 w-4" />,         description: "Выбор одного варианта" },
      { type: "checkbox", label: "Чекбокс",       icon: <ToggleLeft className="h-4 w-4" />,        description: "Да / нет" },
    ],
  },
  {
    group: "Вывод и действия",
    items: [
      { type: "result",   label: "Результат",    icon: <Calculator className="h-4 w-4" />,        description: "Вычисляемое поле (формула)" },
      { type: "button",   label: "Кнопка",       icon: <MousePointerClick className="h-4 w-4" />, description: "Кнопка с действием" },
      { type: "label",    label: "Текст / заголовок", icon: <TextQuote className="h-4 w-4" />,    description: "Статический текст, разделитель" },
    ],
  },
];

// Flat list for backward compatibility
const FIELD_TYPES = FIELD_TYPES_GROUPS.flatMap((g) => g.items);

interface FieldTypeMenuProps {
  onAdd: (type: CalcFieldType) => void;
}

export function FieldTypeMenu({ onAdd }: FieldTypeMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 w-full border-dashed">
          <PlusCircle className="h-4 w-4" />
          Добавить поле
          <ChevronDown className="h-3 w-3 ml-auto opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" avoidCollisions collisionPadding={12} className="w-64 max-h-[min(360px,60vh)] overflow-y-auto">
        {FIELD_TYPES.map(({ type, label, icon, description }) => (
          <DropdownMenuItem
            key={type}
            className="gap-3 cursor-pointer py-2.5"
            onClick={() => onAdd(type)}
          >
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <div>
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { FIELD_TYPES };
