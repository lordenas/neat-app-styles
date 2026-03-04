import { CalcField, CalcFieldType } from "@/types/custom-calc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Hash, Type, SlidersHorizontal, List, CircleDot, ToggleLeft, Calculator,
  MousePointerClick, AlignLeft, TextQuote, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<CalcFieldType, React.ReactNode> = {
  number:   <Hash className="h-3.5 w-3.5" />,
  text:     <Type className="h-3.5 w-3.5" />,
  textarea: <AlignLeft className="h-3.5 w-3.5" />,
  slider:   <SlidersHorizontal className="h-3.5 w-3.5" />,
  select:   <List className="h-3.5 w-3.5" />,
  radio:    <CircleDot className="h-3.5 w-3.5" />,
  checkbox: <ToggleLeft className="h-3.5 w-3.5" />,
  result:   <Calculator className="h-3.5 w-3.5" />,
  button:   <MousePointerClick className="h-3.5 w-3.5" />,
  label:    <TextQuote className="h-3.5 w-3.5" />,
  image:    <ImageIcon className="h-3.5 w-3.5" />,
  html:     <Code2 className="h-3.5 w-3.5" />,
};

const TYPE_LABELS: Record<CalcFieldType, string> = {
  number: "Число", text: "Текст", textarea: "Многострочный", slider: "Слайдер",
  select: "Список", radio: "Радио", checkbox: "Чекбокс", result: "Результат",
  button: "Кнопка", label: "Текст", image: "Картинка", html: "HTML",
};

interface FieldCardProps {
  field: CalcField;
  isSelected?: boolean;
  onSelect: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export function FieldCard({ field, isSelected, onSelect, dragHandleProps, isDragging }: FieldCardProps) {
  const hasConditions = (field.visibility?.rules?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        "border rounded-lg bg-card transition-all duration-150 cursor-pointer select-none",
        "hover:shadow-md hover:border-primary/40",
        isSelected
          ? "border-primary shadow-md ring-2 ring-primary/20 bg-primary/5"
          : "shadow-sm",
        isDragging && "opacity-25 scale-[0.97]",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-1.5 px-2 py-2.5 min-w-0">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          <span className={cn("shrink-0 transition-colors", isSelected ? "text-primary" : "text-muted-foreground")}>
            {TYPE_ICONS[field.type]}
          </span>
          <span className="font-medium text-xs truncate min-w-0 flex-1">
            {field.label || <span className="text-muted-foreground italic">Без названия</span>}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px] px-1 hidden sm:inline-flex">
            {TYPE_LABELS[field.type]}
          </Badge>
          {hasConditions && (
            <Badge variant="outline" className="text-[10px] px-1 hidden md:inline-flex">усл.</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
