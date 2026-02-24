import { StatsCard } from "@/components/ui/stats-card";
import { Users, DollarSign, ShoppingCart, Target } from "lucide-react";

export function StatsCardShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatsCard
        title="Выручка"
        value="₽1.2M"
        trend={12.5}
        trendLabel="vs прошлый месяц"
        icon={<DollarSign />}
        sparklineData={[30, 40, 35, 50, 49, 60, 70, 91]}
      />
      <StatsCard
        title="Пользователи"
        value="8,421"
        trend={-3.2}
        icon={<Users />}
        sparklineData={[50, 45, 48, 42, 40, 38, 35, 33]}
      />
      <StatsCard
        title="Заказы"
        value="1,024"
        trend={0}
        icon={<ShoppingCart />}
      />
      <StatsCard
        title="Конверсия"
        value="4.3%"
        trend={1.8}
        icon={<Target />}
        sparklineData={[3, 3.5, 3.2, 4, 3.8, 4.1, 4.3]}
      />
    </div>
  );
}
