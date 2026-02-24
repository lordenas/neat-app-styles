import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit, Copy, Trash2, Share2, Settings, MoreHorizontal } from "lucide-react";

export function DropdownEnhancedShowcase() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>DropdownMenuItem с icon, shortcut, destructive</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Edit />} shortcut="⌘E">Редактировать</DropdownMenuItem>
            <DropdownMenuItem icon={<Copy />} shortcut="⌘C">Дублировать</DropdownMenuItem>
            <DropdownMenuItem icon={<Share2 />}>Поделиться</DropdownMenuItem>
            <DropdownMenuItem icon={<Settings />} shortcut="⌘,">Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Trash2 />} shortcut="⌘⌫" destructive>Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
