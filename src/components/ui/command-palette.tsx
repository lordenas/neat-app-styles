import * as React from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";

/**
 * Глобальная командная палитра (Spotlight) с поддержкой ⌘K / Ctrl+K.
 *
 * @example
 * ```tsx
 * const commands = [
 *   { group: "Навигация", items: [
 *     { label: "Главная", icon: <Home />, onSelect: () => navigate("/"), shortcut: "⌘H" },
 *   ]},
 * ];
 * <CommandPalette open={open} onOpenChange={setOpen} commands={commands} />
 * ```
 *
 * @prop open - Управляемое состояние открытия
 * @prop onOpenChange - Колбэк при изменении состояния
 * @prop commands - Массив групп команд
 * @prop placeholder - Плейсхолдер поиска
 */

export interface CommandPaletteItem {
  /** Текст команды */
  label: string;
  /** Иконка (опционально) */
  icon?: React.ReactNode;
  /** Колбэк при выборе */
  onSelect?: () => void;
  /** Клавиатурное сочетание для отображения */
  shortcut?: string;
  /** Отключена */
  disabled?: boolean;
}

export interface CommandPaletteGroup {
  /** Заголовок группы */
  group: string;
  /** Команды в группе */
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandPaletteGroup[];
  placeholder?: string;
}

/**
 * Хук для привязки ⌘K / Ctrl+K к открытию палитры.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useCommandPalette();
 * ```
 */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return [open, setOpen] as const;
}

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  placeholder = "Введите команду или поиск...",
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        {commands.map((group, gi) => (
          <React.Fragment key={group.group}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => {
                    item.onSelect?.();
                    onOpenChange(false);
                  }}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <span className="mr-2 flex items-center [&>svg]:h-4 [&>svg]:w-4">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
