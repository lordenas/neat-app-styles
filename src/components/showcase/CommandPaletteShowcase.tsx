import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Home, Settings, User, FileText, Search, Calculator, Palette, Bell } from "lucide-react";
import { toast } from "sonner";

const commands = [
  {
    group: "Навигация",
    items: [
      { label: "Главная", icon: <Home />, onSelect: () => toast.info("→ Главная"), shortcut: "⌘H" },
      { label: "Настройки", icon: <Settings />, onSelect: () => toast.info("→ Настройки"), shortcut: "⌘," },
      { label: "Профиль", icon: <User />, onSelect: () => toast.info("→ Профиль") },
    ],
  },
  {
    group: "Инструменты",
    items: [
      { label: "Калькулятор", icon: <Calculator />, onSelect: () => toast.info("Калькулятор открыт") },
      { label: "Тема оформления", icon: <Palette />, onSelect: () => toast.info("Тема") },
      { label: "Уведомления", icon: <Bell />, onSelect: () => toast.info("Уведомления") },
    ],
  },
  {
    group: "Документы",
    items: [
      { label: "Последние документы", icon: <FileText />, onSelect: () => toast.info("Документы") },
      { label: "Поиск по проекту", icon: <Search />, onSelect: () => toast.info("Поиск"), shortcut: "⌘⇧F" },
    ],
  },
];

export function CommandPaletteShowcase() {
  const [open, setOpen] = useCommandPalette();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4 mr-2" />
          Открыть палитру команд
        </Button>
        <p className="text-sm text-muted-foreground">
          или нажмите <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
        </p>
      </div>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        placeholder="Поиск команды..."
      />

      <p className="helper-text">
        Командная палитра с группами, иконками и шорткатами. Используется <code className="text-xs bg-muted px-1 py-0.5 rounded">cmdk</code>.
      </p>
    </div>
  );
}
