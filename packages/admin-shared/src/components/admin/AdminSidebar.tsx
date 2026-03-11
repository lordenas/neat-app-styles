import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Megaphone, BarChart3, Settings, Users, Banknote,
  Home, Tag, Globe, FileText, ChevronDown, ChevronRight,
  Shield, Palette, Bell, Key, Plug, PanelLeftClose, PanelLeftOpen, LogOut,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@numlix/ui-kit";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: NavItem[];
};

const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Главная", items: [{ title: "Дашборд", url: "/admin", icon: LayoutDashboard }] },
  {
    group: "Монетизация",
    items: [
      {
        title: "CPA-офферы", url: "/admin/cpa", icon: Megaphone,
        badge: "Live", badgeVariant: "default",
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
        title: "Калькуляторы", url: "/admin/calculators", icon: LayoutDashboard,
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

function NavLeaf({ item, depth = 0, collapsed }: { item: NavItem; depth?: number; collapsed: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url.split("#")[0]));
  const Icon = item.icon;

  if (depth === 0) {
    return (
      <button
        onClick={() => navigate(item.url)}
        title={collapsed ? item.title : undefined}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge variant={item.badgeVariant ?? "default"} className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(item.url)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md pl-6 pr-2 py-1 text-xs transition-colors text-left",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      )}
    >
      <span className="flex-1 truncate">{item.title}</span>
      {item.badge && (
        <Badge variant={item.badgeVariant ?? "default"} className="text-[10px] px-1.5 py-0 h-4 shrink-0">
          {item.badge}
        </Badge>
      )}
    </button>
  );
}

function NavParent({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isChildActive = item.children?.some((c) => pathname === c.url || pathname.startsWith(c.url.split("#")[0]));
  const [open, setOpen] = useState(isChildActive ?? false);
  const Icon = item.icon;
  const active = pathname === item.url || !!isChildActive;

  return (
    <div>
      <button
        onClick={() => { setOpen((v) => !v); navigate(item.url); }}
        title={collapsed ? item.title : undefined}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge variant={item.badgeVariant ?? "default"} className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                {item.badge}
              </Badge>
            )}
            {open
              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            }
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="mt-0.5 space-y-0.5 border-l border-sidebar-border ml-5">
          {item.children!.map((child) => (
            <NavLeaf key={child.url} item={child} depth={1} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r shrink-0 transition-[width] duration-200",
        collapsed ? "w-12" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-3 border-b">
        <button
          onClick={() => navigate("/admin")}
          className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0"
          title="Дашборд"
        >
          <Shield className="h-4 w-4 text-primary-foreground" />
        </button>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">Numlix Admin</p>
            <p className="text-[10px] text-muted-foreground">Панель управления</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {NAV.map((section) => (
          <div key={section.group} className="px-2">
            {!collapsed && (
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.children
                  ? <NavParent key={item.url} item={item} collapsed={collapsed} />
                  : <NavLeaf key={item.url} item={item} depth={0} collapsed={collapsed} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t px-2 py-2 space-y-1">
        <button
          onClick={() => navigate("/")}
          title="На сайт"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Home className="h-4 w-4 shrink-0" />
          {!collapsed && <span>На сайт</span>}
        </button>
        <button
          onClick={handleSignOut}
          title="Выйти"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </button>
        <button
          onClick={onToggle}
          title={collapsed ? "Развернуть" : "Свернуть"}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed
            ? <PanelLeftOpen className="h-4 w-4 shrink-0" />
            : <PanelLeftClose className="h-4 w-4 shrink-0" />
          }
          {!collapsed && <span>Свернуть</span>}
        </button>
      </div>
    </aside>
  );
}
