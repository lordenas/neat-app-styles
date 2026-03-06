import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";

/**
 * Поле ввода тегов — свободный текст → Enter → чип.
 *
 * @example
 * ```tsx
 * <TagInput value={tags} onChange={setTags} placeholder="Добавить тег..." />
 * <TagInput value={tags} onChange={setTags} max={5} />
 * ```
 *
 * @prop value - Массив тегов
 * @prop onChange - Колбэк при изменении массива
 * @prop placeholder - Подсказка в поле
 * @prop max - Максимальное количество тегов
 * @prop disabled - Запретить ввод
 * @prop error - Сообщение об ошибке
 */
export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Введите и нажмите Enter...",
  max,
  disabled = false,
  error,
  className,
  id,
}: TagInputProps) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (max && value.length >= max) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const errorId = error !== undefined && id ? `${id}-err` : undefined;

  return (
    <div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-3 py-2 min-h-[2.5rem] cursor-text transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                aria-label={`Удалить ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || (max !== undefined && value.length >= max)}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          aria-invalid={!!error}
          aria-describedby={errorId}
        />
      </div>
      {error !== undefined && (
        <p id={errorId} className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
          {error || "\u00A0"}
        </p>
      )}
    </div>
  );
}
