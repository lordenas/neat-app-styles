import { Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmbedPlan } from "@/types/embed";

interface Props {
  plan: EmbedPlan;
  onUpgrade: () => void;
}

const FREE_FEATURES = [
  "Все калькуляторы",
  "100 встраиваний / месяц",
  "Базовая настройка цветов",
  "Логотип CalcHub (обязательно)",
];

const PRO_FEATURES = [
  "Все калькуляторы",
  "Без ограничений по запросам",
  "Полная White Label (без логотипа)",
  "Кастомный логотип",
  "Все шрифты и оформление",
  "React-компонент",
  "Приоритетная поддержка",
];

export function EmbedPlanBanner({ plan, onUpgrade }: Props) {
  if (plan === "pro") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/[0.04] px-4 py-3">
        <Crown className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">Pro план активен</p>
          <p className="text-xs text-muted-foreground">White Label · Без ограничений</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Free */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Free</span>
            <span className="ml-auto text-lg font-bold">0 ₽</span>
          </div>
          <ul className="space-y-1.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium">
            Текущий план
          </div>
        </div>

        {/* Pro */}
        <div className="p-5 space-y-3 bg-primary/[0.03] dark:bg-primary/[0.04]">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Pro</span>
            <span className="ml-auto text-lg font-bold">
              990 ₽
              <span className="text-xs font-normal text-muted-foreground"> / мес</span>
            </span>
          </div>
          <ul className="space-y-1.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button size="sm" className="w-full" onClick={onUpgrade}>
            <Crown className="h-3.5 w-3.5" />
            Подключить Pro (демо)
          </Button>
        </div>
      </div>
    </div>
  );
}
