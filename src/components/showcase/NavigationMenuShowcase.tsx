import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, Layout, Settings, Users, Zap } from "lucide-react";

const products = [
  { icon: Layout, title: "Дашборд", desc: "Обзор ключевых метрик и KPI" },
  { icon: BarChart3, title: "Аналитика", desc: "Отчёты и визуализация данных" },
  { icon: Users, title: "Команда", desc: "Управление участниками проекта" },
  { icon: FileText, title: "Документы", desc: "Совместная работа с файлами" },
];

const resources = [
  { icon: Zap, title: "Быстрый старт", desc: "Начните за 5 минут" },
  { icon: Settings, title: "API", desc: "Полная документация API" },
  { icon: FileText, title: "Гайды", desc: "Пошаговые руководства" },
];

function ListItem({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className={cn(
            "flex items-start gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          )}
        >
          <Icon className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">{desc}</p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

export function NavigationMenuShowcase() {
  return (
    <div className="space-y-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Продукт</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1 p-4 w-[350px] md:w-[500px] md:grid-cols-2">
                {products.map((item) => (
                  <ListItem key={item.title} {...item} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Ресурсы</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1 p-4 w-[300px]">
                {resources.map((item) => (
                  <ListItem key={item.title} {...item} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#" onClick={(e) => e.preventDefault()}>
              Цены
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <p className="text-xs text-muted-foreground">
        Mega-меню с иконками, описаниями и grid-раскладкой. Идеально для лендингов и корпоративных сайтов.
      </p>
    </div>
  );
}
