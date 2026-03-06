import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminLayout({ children, title, description, actions }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex w-full bg-background overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b bg-card/80 backdrop-blur-sm px-4">
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1 min-w-0">
            {title && <h1 className="text-sm font-semibold leading-tight truncate">{title}</h1>}
            {description && <p className="text-xs text-muted-foreground truncate hidden sm:block">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
