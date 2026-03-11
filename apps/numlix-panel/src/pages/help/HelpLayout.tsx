import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, BookOpen, Hash, Layers, FileCode, ChevronRight, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const helpNav = [
  {
    group: "Начало работы",
    items: [
      { path: "/help", label: "Обзор", icon: BookOpen },
      { path: "/help/getting-started", label: "Быстрый старт", icon: ChevronRight },

    ],
  },
  {
    group: "Конструктор",
    items: [
      { path: "/help/fields", label: "Типы полей", icon: Layers },
      { path: "/help/formula", label: "Формулы", icon: Hash },
      { path: "/help/pages", label: "Многостраничность", icon: FileCode },
      { path: "/help/logic", label: "Условная логика", icon: ChevronRight },
    ],
  },
  {
    group: "Примеры",
    items: [
      { path: "/help/examples", label: "Готовые примеры", icon: FileCode },
    ],
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const [search, setSearch] = useState("");

  const filtered = helpNav.map((g) => ({
    ...g,
    items: g.items.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="flex flex-col gap-4 w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <nav className="flex flex-col gap-1">
        {filtered.map((group) => (
          <div key={group.group} className="mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
              {group.group}
            </p>
            {group.items.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function HelpLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 container max-w-6xl py-8 flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-52 shrink-0">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative w-72 bg-card border-r shadow-xl p-4 overflow-y-auto">
              <Sidebar onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
