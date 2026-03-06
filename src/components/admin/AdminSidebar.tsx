import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Settings,
  Users,
  Banknote,
  Home,
  Tag,
  Globe,
  FileText,
  ChevronDown,
  ChevronRight,
  Shield,
  Palette,
  Bell,
  Key,
  Plug,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: NavItem[];
};

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Главная",
    items: [{ title: "Дашборд", url: "/admin", icon: LayoutDashboard }],
  },
  {
    group: "Монетизация",
    items: [
      {
        title: "CPA-офферы",
        url: "/admin/cpa",
        icon: Megaphone,
        badge: "Live",
        badgeVariant: "default",
        children: [
          { title: "Кредиты", url: "/admin/cpa#credit" },
          { title: "Ипотека", url: "/admin/cpa#mortgage" },
          { title: "Рефинансирование", url: "/admin/cpa#refinance" },
          { title: "Вклады", url: "/admin/cpa#deposit", badge: "Скоро", badgeVariant: "secondary" },
        ],
      },
      { title: "Баннеры", url: "/admin/banners", icon: Tag },
      { title: "Партнёры", url: "/admin/partners", icon: Globe },
    ],
  },
  {
    group: "Аналитика",
    items: [
      { title: "Статистика кликов", url: "/admin/analytics/clicks", icon: BarChart3 },
      { title: "Конверсии", url: "/admin/analytics/conversions", icon: Banknote },
    ],
  },
  {
    group: "Контент",
    items: [
      { title: "Страницы", url: "/admin/pages", icon: FileText },
      { title: "SEO", url: "/admin/seo", icon: Globe },
      {
        title: "Калькуляторы",
        url: "/admin/calculators",
        icon: LayoutDashboard,
        children: [
          { title: "Список", url: "/admin/calculators/list" },
          { title: "Категории", url: "/admin/calculators/categories" },
        ],
      },
    ],
  },
  {
    group: "Пользователи",
    items: [
      { title: "Пользователи", url: "/admin/users", icon: Users },
      { title: "Подписки", url: "/admin/subscriptions", icon: Banknote },
    ],
  },
  {
    group: "Настройки",
    items: [
      { title: "Общие", url: "/admin/settings", icon: Settings },
      { title: "Внешний вид", url: "/admin/settings/appearance", icon: Palette },
      { title: "Уведомления", url: "/admin/settings/notifications", icon: Bell },
      { title: "API-ключи", url: "/admin/settings/api-keys", icon: Key },
      { title: "Интеграции", url: "/admin/settings/integrations", icon: Plug },
      { title: "Доступ & роли", url: "/admin/settings/roles", icon: Shield },
    ],
  },
];

// ─── Leaf nav item ────────────────────────────────────────────────────────────

function NavLeaf({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const { pathname } = useLocation();
  const active =
    pathname === item.url ||
    (item.url !== "/admin" && pathname.startsWith(item.url.split("#")[0]));
  const Icon = item.icon;

  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
          <Link to={item.url}>
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge
                variant={item.badgeVariant ?? "default"}
                className="text-[10px] px-1.5 py-0 h-4 shrink-0"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={active}>
        <Link to={item.url}>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge
              variant={item.badgeVariant ?? "default"}
              className="text-[10px] px-1.5 py-0 h-4 shrink-0"
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

// ─── Parent item with inline toggle (avoids nested <button>) ─────────────────

function NavParent({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const isChildActive = item.children?.some(
    (c) => pathname === c.url || pathname.startsWith(c.url.split("#")[0])
  );
  const [open, setOpen] = useState(isChildActive ?? false);
  const Icon = item.icon;
  const active = pathname === item.url || !!isChildActive;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={item.title}
        onClick={() => setOpen((v) => !v)}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 truncate">{item.title}</span>
        {item.badge && (
          <Badge
            variant={item.badgeVariant ?? "default"}
            className="text-[10px] px-1.5 py-0 h-4 shrink-0"
          >
            {item.badge}
          </Badge>
        )}
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
      </SidebarMenuButton>

      {open && (
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <NavLeaf key={child.url} item={child} depth={1} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3 border-b">
        <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">Numlix Admin</p>
              <p className="text-[10px] text-muted-foreground">Панель управления</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((section, si) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  item.children ? (
                    <NavParent key={item.url} item={item} />
                  ) : (
                    <NavLeaf key={item.url} item={item} depth={0} />
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
            {si < NAV.length - 1 && <SidebarSeparator className="mt-2" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="На сайт">
              <Link to="/">
                <Home className="h-4 w-4 shrink-0" />
                <span className="text-xs">На сайт</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
