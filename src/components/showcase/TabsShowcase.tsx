import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Settings, Users } from "lucide-react";

export function TabsShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Базовые табы</p>
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
        <p className="text-xs text-muted-foreground mb-3">Табы с иконками</p>
        <Tabs defaultValue="docs">
          <TabsList>
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
    </div>
  );
}
