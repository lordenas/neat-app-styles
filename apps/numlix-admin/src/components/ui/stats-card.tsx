import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

/**
 * StatsCard — карточка метрики для дашбордов.
 *
 * @example
 * ```tsx
 * <StatsCard title="Выручка" value="₽1.2M" trend={12.5} />
 * <StatsCard title="Пользователи" value="8,421" trend={-3.2} trendLabel="vs прошлый месяц" />
 * <StatsCard title="Конверсия" value="4.3%" icon={<Target />} sparklineData={[10,20,15,30,25,40]} />
 * ```
 *
 * @prop title - Заголовок метрики
 * @prop value - Значение (строка)
 * @prop trend - Процент изменения (положительный = рост, отрицательный = падение)
 * @prop trendLabel - Подпись к тренду
 * @prop icon - Иконка метрики
 * @prop sparklineData - Массив чисел для мини-графика
 */
export interface StatsCardProps {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  className?: string;
}

export function StatsCard({ title, value, trend, trendLabel, icon, sparklineData, className }: StatsCardProps) {
  const trendDirection = trend === undefined ? undefined : trend > 0 ? "up" : trend < 0 ? "down" : "flat";

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="rounded-md bg-muted p-2 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        )}
      </div>

      {(trend !== undefined || sparklineData) && (
        <div className="flex items-end justify-between mt-3 gap-3">
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {trendDirection === "up" && <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" />}
              {trendDirection === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
              {trendDirection === "flat" && <Minus className="h-4 w-4 text-muted-foreground" />}
              <span
                className={cn(
                  "font-medium",
                  trendDirection === "up" && "text-[hsl(var(--success))]",
                  trendDirection === "down" && "text-destructive",
                  trendDirection === "flat" && "text-muted-foreground",
                )}
              >
                {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
          {sparklineData && sparklineData.length > 1 && <Sparkline data={sparklineData} trend={trendDirection} />}
        </div>
      )}
    </Card>
  );
}

function Sparkline({ data, trend }: { data: number[]; trend?: "up" | "down" | "flat" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  const stroke =
    trend === "up" ? "hsl(var(--success))" : trend === "down" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
