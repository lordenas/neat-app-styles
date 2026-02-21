import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Users } from "lucide-react";

export function CardShowcase() {
  return (
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

      <Card>
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
          <Button variant="outline" size="sm">Управление</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
