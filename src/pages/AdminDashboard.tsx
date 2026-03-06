import { AdminLayout } from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";
import {
  Megaphone,
  BarChart3,
  Users,
  Banknote,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  ArrowRight,
  Activity,
  CircleDollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Fake stats ───────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Показы CPA-блоков",
    value: "48 320",
    delta: "+12.4%",
    up: true,
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Клики по офферам",
    value: "3 194",
    delta: "+8.1%",
    up: true,
    icon: MousePointerClick,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Конверсия",
    value: "6.61%",
    delta: "-0.3%",
    up: false,
    icon: Activity,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Доход (прогноз)",
    value: "₽ 24 750",
    delta: "+19.2%",
    up: true,
    icon: CircleDollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

// ─── Top offers fake data ─────────────────────────────────────────────────────

const TOP_OFFERS = [
  { bank: "Т-Банк", logo: "Т", logoColor: "bg-yellow-400/20 text-yellow-600", clicks: 892, ctr: "8.3%", trend: true },
  { bank: "Сбербанк", logo: "С", logoColor: "bg-green-500/20 text-green-700", clicks: 741, ctr: "7.1%", trend: true },
  { bank: "Альфа-Банк", logo: "А", logoColor: "bg-red-500/20 text-red-600", clicks: 610, ctr: "6.5%", trend: false },
  { bank: "ВТБ", logo: "В", logoColor: "bg-blue-500/20 text-blue-600", clicks: 498, ctr: "5.9%", trend: true },
  { bank: "Газпромбанк", logo: "Г", logoColor: "bg-violet-500/20 text-violet-600", clicks: 312, ctr: "4.2%", trend: false },
];

// ─── Recent activity ──────────────────────────────────────────────────────────

const ACTIVITY = [
  { text: "Добавлен оффер «Т-Банк Ипотека»", time: "2 мин назад", type: "add" },
  { text: "Скрыт оффер «ВТБ Рефинансирование»", time: "18 мин назад", type: "hide" },
  { text: "Обновлена ставка «Сбербанк Кредит»", time: "1 ч назад", type: "edit" },
  { text: "Добавлена группа «Вклады»", time: "3 ч назад", type: "add" },
  { text: "Изменён бейдж «Альфа-Банк»", time: "вчера", type: "edit" },
];

const activityDot: Record<string, string> = {
  add: "bg-green-500",
  hide: "bg-amber-500",
  edit: "bg-blue-500",
};

// ─── Quick links ──────────────────────────────────────────────────────────────

const QUICK = [
  { label: "CPA-офферы", desc: "Управление карточками банков", url: "/admin/cpa", icon: Megaphone, badge: "12 офферов" },
  { label: "Аналитика", desc: "Статистика кликов и конверсий", url: "/admin/analytics/clicks", icon: BarChart3, badge: null },
  { label: "Пользователи", desc: "Список аккаунтов и подписок", url: "/admin/users", icon: Users, badge: "1 248" },
  { label: "Доходы", desc: "Прогноз и история выплат", url: "/admin/subscriptions", icon: Banknote, badge: null },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <AdminLayout title="Дашборд" description="Обзор ключевых метрик и быстрый доступ к разделам">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border bg-card px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                    <Icon className={cn("h-4 w-4", s.color)} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                  <p className={cn("text-xs mt-0.5 flex items-center gap-0.5", s.up ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                    {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {s.delta} за 7 дней
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top offers */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="font-semibold text-sm">Топ офферов по кликам</p>
              <Button variant="ghost" size="sm" asChild className="text-xs h-7 gap-1 text-muted-foreground">
                <Link to="/admin/cpa"><span className="flex items-center gap-1">Все офферы <ArrowRight className="h-3 w-3" /></span></Link>
              </Button>
            </div>
            <div className="divide-y">
              {TOP_OFFERS.map((o, i) => (
                <div key={o.bank} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                  <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0", o.logoColor)}>
                    {o.logo}
                  </div>
                  <span className="flex-1 text-sm font-medium">{o.bank}</span>
                  <span className="text-xs text-muted-foreground">{o.clicks} кликов</span>
                  <Badge variant={o.trend ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                    CTR {o.ctr}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="font-semibold text-sm">Последние действия</p>
            </div>
            <div className="divide-y">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activityDot[a.type])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick access */}
        <div>
          <p className="text-sm font-semibold mb-3">Быстрый доступ</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.url}
                  to={q.url}
                  className="rounded-xl border bg-card px-4 py-4 hover:bg-muted/50 transition-colors group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{q.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{q.desc}</p>
                  </div>
                  {q.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{q.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
