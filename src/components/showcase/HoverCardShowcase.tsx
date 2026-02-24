import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";

const users = [
  { name: "Иванов Иван", handle: "@ivanov", role: "Senior Developer", joined: "Январь 2020", location: "Москва", avatar: "ИИ", repos: 42 },
  { name: "Петрова Мария", handle: "@petrova", role: "UX Designer", joined: "Март 2021", location: "Санкт-Петербург", avatar: "ПМ", repos: 15 },
  { name: "Сидоров Алексей", handle: "@sidorov", role: "Product Manager", joined: "Июнь 2019", location: "Казань", avatar: "СА", repos: 8 },
];

export function HoverCardShowcase() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-3">Наведите на имя для превью профиля</p>

      <div className="flex flex-wrap gap-4">
        {users.map((user) => (
          <HoverCard key={user.handle}>
            <HoverCardTrigger asChild>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-primary underline decoration-dotted underline-offset-4 cursor-pointer hover:text-primary/80 transition-colors"
              >
                {user.handle}
              </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-72">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{user.name}</h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{user.handle}</p>
                  <Badge variant="secondary" size="sm">{user.role}</Badge>
                  <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {user.joined}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-0.5">
                    {user.repos} репозиториев
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>

      <div className="text-sm">
        Связанная задача:{" "}
        <HoverCard>
          <HoverCardTrigger asChild>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-primary underline decoration-dotted underline-offset-4">
              TASK-1234
            </a>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm">In Progress</Badge>
                <span className="text-xs text-muted-foreground font-mono">TASK-1234</span>
              </div>
              <p className="text-sm font-medium">Рефакторинг API авторизации</p>
              <p className="text-xs text-muted-foreground">
                Переход на JWT-токены с refresh-механизмом и revoke-списком.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar size="xs"><AvatarFallback>ИИ</AvatarFallback></Avatar>
                <span>Иванов Иван</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <p className="helper-text">
        Карточка при наведении — для профилей, ссылок и превью задач.
      </p>
    </div>
  );
}
