import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { Copy, Scissors, ClipboardPaste, Trash2, Share, Download, FolderOpen, FileText, Image, Code } from "lucide-react";

export function ContextMenuShowcase() {
  const [bookmarked, setBookmarked] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [view, setView] = useState("list");

  return (
    <div className="space-y-4">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-36 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground select-none">
          Правый клик здесь →
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => toast.info("Копировать")}>
            <Copy className="mr-2 h-4 w-4" />
            Копировать
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => toast.info("Вырезать")}>
            <Scissors className="mr-2 h-4 w-4" />
            Вырезать
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => toast.info("Вставить")}>
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Вставить
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Share className="mr-2 h-4 w-4" />
              Поделиться
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => toast.info("Ссылка скопирована")}>Скопировать ссылку</ContextMenuItem>
              <ContextMenuItem>Email</ContextMenuItem>
              <ContextMenuItem>Telegram</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderOpen className="mr-2 h-4 w-4" />
              Открыть как...
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem><FileText className="mr-2 h-4 w-4" />Документ</ContextMenuItem>
              <ContextMenuItem><Image className="mr-2 h-4 w-4" />Изображение</ContextMenuItem>
              <ContextMenuItem><Code className="mr-2 h-4 w-4" />Код</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={bookmarked} onCheckedChange={setBookmarked}>
            В закладках
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Показать сетку
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />
          <ContextMenuLabel>Вид</ContextMenuLabel>
          <ContextMenuRadioGroup value={view} onValueChange={setView}>
            <ContextMenuRadioItem value="list">Список</ContextMenuRadioItem>
            <ContextMenuRadioItem value="grid">Сетка</ContextMenuRadioItem>
            <ContextMenuRadioItem value="compact">Компактный</ContextMenuRadioItem>
          </ContextMenuRadioGroup>

          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => toast.info("Скачать")}>
            <Download className="mr-2 h-4 w-4" />
            Скачать
          </ContextMenuItem>
          <ContextMenuItem className="text-destructive" onClick={() => toast.error("Удалено")}>
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <p className="helper-text">
        Контекстное меню с иконками, шорткатами, подменю, checkbox и radio-группой.
      </p>
    </div>
  );
}
