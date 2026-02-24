import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Users, ArrowRight } from "lucide-react";

export function CardShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Варианты (variant)</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Default</CardTitle>
              <CardDescription>Стандартная карточка</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Рамка + лёгкая тень.</p>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Outline</CardTitle>
              <CardDescription>Только рамка</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Двойная рамка, без тени.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Elevated</CardTitle>
              <CardDescription>Объёмная тень</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Выраженная тень, без рамки.</p>
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Interactive</CardTitle>
              <CardDescription>Наведите курсор ↗</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Hover-эффект с поднятием.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Примеры карточек</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" /> Документы
              </CardTitle>
              <CardDescription>Управление документами проекта</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                12 документов загружено. Последнее обновление — сегодня.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Открыть</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" /> Аналитика
              </CardTitle>
              <CardDescription>Статистика и отчёты</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Посещений за месяц: 4,521. Конверсия: 3.2%.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Подробнее</Button>
            </CardFooter>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" /> Команда
              </CardTitle>
              <CardDescription>Участники проекта</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                8 активных участников. 2 приглашения ожидают подтверждения.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">Управление <ArrowRight className="h-3.5 w-3.5" /></Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
