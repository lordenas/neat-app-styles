import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Settings, Users, Shield, Bell, Palette } from "lucide-react";

export function TabsShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Default (pill)</p>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Общие</TabsTrigger>
            <TabsTrigger value="tab2">Настройки</TabsTrigger>
            <TabsTrigger value="tab3">Пользователи</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div className="form-section mt-3">
              <p className="text-sm">Содержимое вкладки «Общие». Здесь отображается основная информация.</p>
            </div>
          </TabsContent>
          <TabsContent value="tab2">
            <div className="form-section mt-3">
              <p className="text-sm">Содержимое вкладки «Настройки». Параметры конфигурации системы.</p>
            </div>
          </TabsContent>
          <TabsContent value="tab3">
            <div className="form-section mt-3">
              <p className="text-sm">Содержимое вкладки «Пользователи». Список зарегистрированных пользователей.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Underline</p>
        <Tabs defaultValue="docs">
          <TabsList variant="underline">
            <TabsTrigger value="docs" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Документы
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Настройки
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Команда
            </TabsTrigger>
          </TabsList>
          <TabsContent value="docs">
            <div className="form-section mt-3">
              <p className="text-sm">Документы и файлы проекта.</p>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="form-section mt-3">
              <p className="text-sm">Настройки проекта.</p>
            </div>
          </TabsContent>
          <TabsContent value="users">
            <div className="form-section mt-3">
              <p className="text-sm">Участники команды.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Outline</p>
        <Tabs defaultValue="ot1">
          <TabsList variant="outline">
            <TabsTrigger value="ot1">Обзор</TabsTrigger>
            <TabsTrigger value="ot2">Детали</TabsTrigger>
            <TabsTrigger value="ot3">История</TabsTrigger>
          </TabsList>
          <TabsContent value="ot1">
            <div className="form-section mt-0 border-t-0 rounded-tl-none">
              <p className="text-sm">Вкладка «Обзор» в outline-стиле.</p>
            </div>
          </TabsContent>
          <TabsContent value="ot2">
            <div className="form-section mt-0 border-t-0 rounded-tl-none">
              <p className="text-sm">Вкладка «Детали».</p>
            </div>
          </TabsContent>
          <TabsContent value="ot3">
            <div className="form-section mt-0 border-t-0 rounded-tl-none">
              <p className="text-sm">Вкладка «История».</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Vertical</p>
        <Tabs defaultValue="v-general" className="flex gap-4">
          <TabsList variant="vertical">
            <TabsTrigger value="v-general" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Общие
            </TabsTrigger>
            <TabsTrigger value="v-security" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Безопасность
            </TabsTrigger>
            <TabsTrigger value="v-notifications" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Уведомления
            </TabsTrigger>
            <TabsTrigger value="v-appearance" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Внешний вид
            </TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="v-general" className="mt-0">
              <div className="form-section">
                <p className="text-sm">Основные настройки аккаунта: имя, email, язык.</p>
              </div>
            </TabsContent>
            <TabsContent value="v-security" className="mt-0">
              <div className="form-section">
                <p className="text-sm">Двухфакторная аутентификация, смена пароля.</p>
              </div>
            </TabsContent>
            <TabsContent value="v-notifications" className="mt-0">
              <div className="form-section">
                <p className="text-sm">Email-уведомления, push, SMS.</p>
              </div>
            </TabsContent>
            <TabsContent value="v-appearance" className="mt-0">
              <div className="form-section">
                <p className="text-sm">Тёмная тема, размер шрифта, акцентный цвет.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
