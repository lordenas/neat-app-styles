import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, Settings, Users, BarChart3, FileText, Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { title: "Главная", icon: Home },
  { title: "Аналитика", icon: BarChart3 },
  { title: "Пользователи", icon: Users },
  { title: "Документы", icon: FileText },
  { title: "Уведомления", icon: Bell, badge: 3 },
  { title: "Настройки", icon: Settings },
];

export function AppShellShowcase() {
  const [active, setActive] = useState("Главная");

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground mb-3">
        Sidebar + AppShell layout — готовый каркас для dashboard-приложений
      </p>

      <div className="rounded-lg border overflow-hidden" style={{ height: 420 }}>
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-full w-full">
            <Sidebar collapsible="icon" className="border-r relative" style={{ position: "relative" }}>
              <SidebarHeader className="p-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    UI
                  </div>
                  <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">Dashboard</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Меню</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            isActive={active === item.title}
                            onClick={() => setActive(item.title)}
                            tooltip={item.title}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="destructive" size="sm" className="ml-auto group-data-[collapsible=icon]:hidden">
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Выход">
                      <Avatar size="xs">
                        <AvatarFallback>ИП</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">Иван Петров</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>

            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-11 border-b flex items-center gap-2 px-3 bg-background shrink-0">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm font-medium">{active}</span>
              </header>
              <main className="flex-1 p-4 overflow-auto bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg bg-background border p-4">
                      <div className="h-3 w-24 bg-muted rounded mb-2" />
                      <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>

      <p className="helper-text">
        Используйте <code className="text-xs bg-muted px-1 py-0.5 rounded">SidebarProvider</code> +{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">Sidebar</code> +{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">SidebarInset</code> для создания layout-каркаса.
      </p>
    </div>
  );
}
