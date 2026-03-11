import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Minus, Plus } from "lucide-react";
import { useState } from "react";

export function DrawerShowcase() {
  const [goal, setGoal] = useState(350);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Простой Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Настройки профиля</DrawerTitle>
              <DrawerDescription>Измените данные вашего аккаунта</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="dr-name">Имя</Label>
                <Input id="dr-name" placeholder="Иван Петров" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dr-email">Email</Label>
                <Input id="dr-email" type="email" placeholder="ivan@example.com" />
              </div>
            </div>
            <DrawerFooter>
              <Button>Сохранить</Button>
              <DrawerClose asChild>
                <Button variant="outline">Отмена</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Интерактивный контент</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Цель на день</DrawerTitle>
              <DrawerDescription>Установите количество калорий</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGoal(Math.max(100, goal - 50))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <p className="text-4xl font-bold tracking-tight">{goal}</p>
                  <p className="text-xs text-muted-foreground">ккал / день</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setGoal(Math.min(1000, goal + 50))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DrawerFooter>
              <Button>Применить</Button>
              <DrawerClose asChild>
                <Button variant="outline">Отмена</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Список</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Избранные места</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2 space-y-2">
              {[
                { name: "Москва", rating: 4.8 },
                { name: "Санкт-Петербург", rating: 4.9 },
                { name: "Казань", rating: 4.7 },
              ].map((place) => (
                <div key={place.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{place.name}</span>
                  </div>
                  <Badge variant="secondary" size="sm">
                    <Star className="h-3 w-3 mr-1 fill-current" /> {place.rating}
                  </Badge>
                </div>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Закрыть</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <p className="helper-text">
        Bottom-sheet на мобильных с жестом свайпа вниз. Библиотека <code className="text-xs bg-muted px-1 py-0.5 rounded">vaul</code>.
      </p>
    </div>
  );
}
