import { useState } from "react";
import { toast } from "sonner";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarLabel,
} from "@/components/ui/menubar";

export function MenubarShowcase() {
  const [showToolbar, setShowToolbar] = useState(true);
  const [showStatusbar, setShowStatusbar] = useState(false);
  const [theme, setTheme] = useState("system");

  return (
    <div className="space-y-4">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Файл</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => toast.info("Новый файл")}>
              Новый <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => toast.info("Открыть")}>
              Открыть <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Последние</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>project-alpha.tsx</MenubarItem>
                <MenubarItem>dashboard.tsx</MenubarItem>
                <MenubarItem>settings.json</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={() => toast.info("Сохранено")}>
              Сохранить <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>Сохранить как...</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Выход</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Правка</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Отменить <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
            <MenubarItem>Повторить <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Вырезать <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
            <MenubarItem>Копировать <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
            <MenubarItem>Вставить <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Вид</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
              Панель инструментов
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showStatusbar} onCheckedChange={setShowStatusbar}>
              Строка состояния
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>Тема</MenubarLabel>
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Светлая</MenubarRadioItem>
              <MenubarRadioItem value="dark">Тёмная</MenubarRadioItem>
              <MenubarRadioItem value="system">Системная</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <p className="text-xs text-muted-foreground">
        Toolbar: {showToolbar ? "вкл" : "выкл"} · Statusbar: {showStatusbar ? "вкл" : "выкл"} · Тема: {theme}
      </p>
    </div>
  );
}
