import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Check, X, Pencil } from "lucide-react";

/**
 * Редактирование текста «на месте» — клик превращает текст в поле ввода.
 *
 * @example
 * ```tsx
 * <InlineEdit value={name} onSave={setName} />
 * <InlineEdit value={title} onSave={setTitle} placeholder="Без названия" />
 * ```
 *
 * @prop value - Текущее значение
 * @prop onSave - Колбэк при сохранении (Enter или кнопка ✓)
 * @prop placeholder - Плейсхолдер при пустом значении
 * @prop inputSize - Размер поля ввода
 * @prop className - Класс для обёртки
 */

export interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  inputSize?: "sm" | "default" | "lg";
  className?: string;
  /** Запретить редактирование */
  disabled?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  placeholder = "Нажмите для редактирования",
  inputSize = "default",
  className,
  disabled = false,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    onSave(trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  if (editing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Input
          ref={inputRef}
          inputSize={inputSize}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          className="flex-1"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={save}
          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Сохранить"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
          aria-label="Отменить"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 text-left transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className={cn("text-sm", !value && "text-muted-foreground italic")}>
        {value || placeholder}
      </span>
      {!disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
