import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Calculator,
  CreditCard,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Ban,
  ChevronDown,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type Plan = "free" | "pro" | "business";

interface MockUser {
  id: string;
  email: string;
  display_name: string;
  plan: Plan;
  status: "active" | "inactive";
  created_at: string;
}

interface MockCalculator {
  id: string;
  name: string;
  created_at: string;
  views: number;
  fields: number;
  published: boolean;
}

interface MockApiRequest {
  id: string;
  endpoint: string;
  status: number;
  duration_ms: number;
  created_at: string;
}

interface MockPayment {
  id: string;
  amount: number;
  currency: string;
  plan: Plan;
  status: "paid" | "failed" | "refunded";
  period: string;
  created_at: string;
}

interface MockActivity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: MockUser[] = [
  { id: "1", email: "ivan.petrov@example.com", display_name: "Иван Петров", plan: "pro", status: "active", created_at: "2024-11-03T10:22:00Z" },
  { id: "2", email: "maria.sidorova@example.com", display_name: "Мария Сидорова", plan: "free", status: "active", created_at: "2024-12-14T08:05:00Z" },
  { id: "3", email: "alex.k@example.com", display_name: "Алексей Козлов", plan: "business", status: "active", created_at: "2024-10-01T15:30:00Z" },
  { id: "4", email: "olga.n@example.com", display_name: "Ольга Новикова", plan: "free", status: "inactive", created_at: "2025-01-20T09:11:00Z" },
  { id: "5", email: "dmitri.v@example.com", display_name: "Дмитрий Волков", plan: "pro", status: "active", created_at: "2025-02-08T13:44:00Z" },
  { id: "6", email: "anna.m@example.com", display_name: "Анна Морозова", plan: "free", status: "active", created_at: "2025-02-15T11:20:00Z" },
  { id: "7", email: "sergei.b@example.com", display_name: "Сергей Белов", plan: "pro", status: "active", created_at: "2024-09-22T07:55:00Z" },
  { id: "8", email: "elena.k@example.com", display_name: "Елена Крылова", plan: "business", status: "active", created_at: "2024-08-17T16:30:00Z" },
  { id: "9", email: "nikita.f@example.com", display_name: "Никита Фролов", plan: "free", status: "inactive", created_at: "2025-03-01T12:00:00Z" },
  { id: "10", email: "tatiana.g@example.com", display_name: "Татьяна Громова", plan: "pro", status: "active", created_at: "2024-07-05T09:00:00Z" },
  { id: "11", email: "pavel.z@example.com", display_name: "Павел Зайцев", plan: "free", status: "active", created_at: "2025-01-10T14:25:00Z" },
  { id: "12", email: "irina.s@example.com", display_name: "Ирина Соколова", plan: "business", status: "active", created_at: "2024-06-18T10:40:00Z" },
];

function genCalcs(userId: string): MockCalculator[] {
  const seed = parseInt(userId, 10) || 1;
  const count = (seed * 3) % 7 + 1;
  const names = ["Ипотечный", "НДС", "НДФЛ", "Пени", "Транспортный", "Осаго", "Кредитный"];
  return Array.from({ length: count }, (_, i) => ({
    id: `${userId}-c${i}`,
    name: `${names[(seed + i) % names.length]} калькулятор v${i + 1}`,
    created_at: new Date(Date.now() - (i + 1) * 1000 * 60 * 60 * 24 * 12).toISOString(),
    views: (seed * 17 + i * 43) % 800 + 10,
    fields: (seed + i * 2) % 12 + 2,
    published: i % 3 !== 0,
  }));
}

function genApiRequests(userId: string): MockApiRequest[] {
  const seed = parseInt(userId, 10) || 1;
  const endpoints = ["/api/calculate/vat", "/api/calculate/ndfl", "/api/calculate/mortgage", "/api/calculate/osago"];
  const statuses = [200, 200, 200, 429, 400, 200, 200];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `${userId}-r${i}`,
    endpoint: endpoints[(seed + i) % endpoints.length],
    status: statuses[(seed + i) % statuses.length],
    duration_ms: ((seed * 7 + i * 13) % 280) + 40,
    created_at: new Date(Date.now() - i * 1000 * 60 * 97).toISOString(),
  }));
}

function genPayments(userId: string): MockPayment[] {
  const seed = parseInt(userId, 10) || 1;
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user || user.plan === "free") return [];
  const planAmount: Record<Plan, number> = { free: 0, pro: 10, business: 20 };
  const statuses: ("paid" | "failed" | "refunded")[] = ["paid", "paid", "paid", "failed", "paid"];
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(2025, 2 - i, 1);
    return {
      id: `${userId}-p${i}`,
      amount: planAmount[user.plan],
      currency: "USD",
      plan: user.plan,
      status: statuses[(seed + i) % statuses.length],
      period: format(d, "LLLL yyyy", { locale: ru }),
      created_at: d.toISOString(),
    };
  });
}

function genActivity(userId: string): MockActivity[] {
  const seed = parseInt(userId, 10) || 1;
  const actions = [
    { action: "Вход в аккаунт", details: "IP: 185.22.110.{x}" },
    { action: "Создан калькулятор", details: "«Ипотечный v{x}»" },
    { action: "Опубликован калькулятор", details: "slug: calc-{x}" },
    { action: "API-ключ создан", details: "chk_abc{x}..." },
    { action: "Смена тарифа", details: "Free → Pro" },
    { action: "Виджет встроен", details: "{x} просмотров за сутки" },
    { action: "Экспорт PDF", details: "Расчёт #calc-{x}" },
  ];
  return Array.from({ length: 10 }, (_, i) => {
    const tpl = actions[(seed + i) % actions.length];
    return {
      id: `${userId}-a${i}`,
      action: tpl.action,
      details: tpl.details.replace("{x}", String((seed * 3 + i) % 99 + 1)),
      created_at: new Date(Date.now() - i * 1000 * 60 * 60 * 11).toISOString(),
    };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const PLAN_LABELS: Record<Plan, string> = { free: "Free", pro: "Pro", business: "Business" };
const PLAN_CLS: Record<Plan, string> = {
  free: "bg-muted text-muted-foreground border border-border-strong",
  pro: "bg-primary/15 text-primary border border-primary/30",
  business: "bg-accent text-accent-foreground border border-border-strong",
};

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PLAN_CLS[plan]}`}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
      <div className="h-8 w-8 rounded-md bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "active" | "inactive" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${status === "active" ? "text-success" : "text-muted-foreground"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
      {status === "active" ? "Активен" : "Неактивен"}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// ─── Dialog types ─────────────────────────────────────────────────────────────

type DialogType = "block" | "unblock" | "plan" | null;

const PLAN_OPTIONS: { value: Plan; label: string }[] = [
  { value: "free", label: "Free — бесплатный" },
  { value: "pro", label: "Pro — $10/мес" },
  { value: "business", label: "Business — $20/мес" },
];

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // local mutable state for actions demo
  const [userStatus, setUserStatus] = useState<"active" | "inactive" | null>(null);
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  const baseUser = MOCK_USERS.find((u) => u.id === id);
  const user = baseUser
    ? {
        ...baseUser,
        status: (userStatus ?? baseUser.status) as "active" | "inactive",
        plan: (userPlan ?? baseUser.plan) as Plan,
      }
    : null;

  const calcs = useMemo(() => (id ? genCalcs(id) : []), [id]);
  const apiReqs = useMemo(() => (id ? genApiRequests(id) : []), [id]);
  const payments = useMemo(() => (id ? genPayments(id) : []), [id]);
  const activity = useMemo(() => (id ? genActivity(id) : []), [id]);

  const totalApiRequests = apiReqs.length;
  const successReqs = apiReqs.filter((r) => r.status < 400).length;

  const handleBlock = () => {
    setUserStatus("inactive");
    setDialog(null);
    toast({ title: "Пользователь заблокирован", description: user?.display_name });
  };

  const handleUnblock = () => {
    setUserStatus("active");
    setDialog(null);
    toast({ title: "Доступ восстановлен", description: user?.display_name });
  };

  const handlePlanChange = () => {
    if (!pendingPlan) return;
    setUserPlan(pendingPlan);
    setDialog(null);
    toast({
      title: "Тариф изменён",
      description: `${user?.display_name} → ${PLAN_LABELS[pendingPlan]}`,
    });
  };

  if (!user) {
    return (
      <AdminLayout title="Пользователь не найден">
        <div className="p-6 flex flex-col items-center gap-4 text-muted-foreground">
          <p className="text-sm">Пользователь с ID «{id}» не найден</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> К списку
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const isBlocked = user.status === "inactive";

  return (
    <>
      {/* Block / Unblock dialog */}
      <AlertDialog open={dialog === "block" || dialog === "unblock"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog === "block" ? "Заблокировать пользователя?" : "Разблокировать пользователя?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog === "block"
                ? `Пользователь «${user.display_name}» потеряет доступ ко всем функциям. Действие можно отменить.`
                : `Пользователю «${user.display_name}» будет восстановлен полный доступ.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className={dialog === "block" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={dialog === "block" ? handleBlock : handleUnblock}
            >
              {dialog === "block" ? "Заблокировать" : "Разблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change plan dialog */}
      <AlertDialog open={dialog === "plan"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сменить тариф</AlertDialogTitle>
            <AlertDialogDescription>
              Выберите новый тариф для «{user.display_name}». Изменение вступит в силу немедленно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-2">
            {PLAN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPendingPlan(opt.value)}
                className={`flex items-center gap-3 w-full rounded-md border px-3 py-2.5 text-sm transition-colors text-left ${
                  pendingPlan === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted/60"
                }`}
              >
                <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  pendingPlan === opt.value ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {pendingPlan === opt.value && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
                {opt.label}
                {opt.value === user.plan && (
                  <span className="ml-auto text-xs text-muted-foreground">текущий</span>
                )}
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlanChange} disabled={!pendingPlan || pendingPlan === user.plan}>
              Применить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <AdminLayout
      title={user.display_name}
      description={user.email}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> К списку
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                Действия <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                icon={<ShieldCheck />}
                onClick={() => { setPendingPlan(user.plan); setDialog("plan"); }}
              >
                Сменить тариф
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isBlocked ? (
                <DropdownMenuItem
                  icon={<UserCheck />}
                  onClick={() => setDialog("unblock")}
                >
                  Разблокировать
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  icon={<Ban />}
                  destructive
                  onClick={() => setDialog("block")}
                >
                  Заблокировать
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Profile card */}
        <div className="rounded-lg border bg-card p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">
                {user.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-semibold">{user.display_name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <PlanBadge plan={user.plan} />
            <StatusDot status={user.status} />
            <span className="text-xs text-muted-foreground">
              с {format(new Date(user.created_at), "d MMMM yyyy", { locale: ru })}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Calculator} label="Калькуляторов" value={calcs.length} sub={`${calcs.filter(c => c.published).length} опубликовано`} />
          <StatCard icon={Zap} label="API-запросов" value={totalApiRequests} sub={`${successReqs} успешных`} />
          <StatCard icon={CreditCard} label="Платежей" value={payments.length} sub={payments.filter(p => p.status === "paid").length + " оплачено"} />
          <StatCard icon={TrendingUp} label="Просмотров" value={calcs.reduce((s, c) => s + c.views, 0)} sub="всего по калькуляторам" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calcs">
          <TabsList className="mb-4">
            <TabsTrigger value="calcs" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" /> Калькуляторы
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-1.5">
              <Zap className="h-3.5 w-3.5" /> API
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Платежи
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Активность
            </TabsTrigger>
          </TabsList>

          {/* ── Calculators ── */}
          <TabsContent value="calcs">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead className="text-xs font-medium">Название</TableHead>
                    <TableHead className="text-xs font-medium hidden sm:table-cell">Полей</TableHead>
                    <TableHead className="text-xs font-medium hidden md:table-cell">Просмотров</TableHead>
                    <TableHead className="text-xs font-medium">Статус</TableHead>
                    <TableHead className="text-xs font-medium hidden lg:table-cell">Создан</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calcs.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm font-medium">{c.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.fields}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.views.toLocaleString("ru")}</TableCell>
                      <TableCell>
                        {c.published ? (
                          <span className="inline-flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Опубликован
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" /> Черновик
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {format(new Date(c.created_at), "d MMM yyyy", { locale: ru })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 py-2.5 border-t bg-muted/50 text-xs text-muted-foreground">
                {calcs.length} калькуляторов · {calcs.reduce((s, c) => s + c.views, 0).toLocaleString("ru")} просмотров
              </div>
            </div>
          </TabsContent>

          {/* ── API Requests ── */}
          <TabsContent value="api">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead className="text-xs font-medium">Эндпоинт</TableHead>
                    <TableHead className="text-xs font-medium">Статус</TableHead>
                    <TableHead className="text-xs font-medium hidden sm:table-cell">Время</TableHead>
                    <TableHead className="text-xs font-medium hidden md:table-cell">Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiReqs.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-mono text-foreground">{r.endpoint}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          r.status < 400 ? "text-success" : r.status < 500 ? "text-warning" : "text-destructive"
                        }`}>
                          {r.status < 400
                            ? <CheckCircle2 className="h-3.5 w-3.5" />
                            : <XCircle className="h-3.5 w-3.5" />}
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{r.duration_ms} мс</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {format(new Date(r.created_at), "d MMM, HH:mm", { locale: ru })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4 py-2.5 border-t bg-muted/50 text-xs text-muted-foreground">
                {totalApiRequests} запросов · {successReqs} успешных ({Math.round((successReqs / totalApiRequests) * 100)}%)
              </div>
            </div>
          </TabsContent>

          {/* ── Payments ── */}
          <TabsContent value="payments">
            {payments.length === 0 ? (
              <div className="rounded-lg border bg-card py-12 text-center text-sm text-muted-foreground">
                Платёжная история пуста — пользователь на Free-тарифе
              </div>
            ) : (
              <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60 hover:bg-muted/60">
                      <TableHead className="text-xs font-medium">Период</TableHead>
                      <TableHead className="text-xs font-medium">Тариф</TableHead>
                      <TableHead className="text-xs font-medium">Сумма</TableHead>
                      <TableHead className="text-xs font-medium">Статус</TableHead>
                      <TableHead className="text-xs font-medium hidden md:table-cell">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm capitalize">{p.period}</TableCell>
                        <TableCell><PlanBadge plan={p.plan} /></TableCell>
                        <TableCell className="text-sm font-medium">
                          ${p.amount}
                        </TableCell>
                        <TableCell>
                          {p.status === "paid" && (
                            <span className="inline-flex items-center gap-1 text-xs text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Оплачен
                            </span>
                          )}
                          {p.status === "failed" && (
                            <span className="inline-flex items-center gap-1 text-xs text-destructive">
                              <XCircle className="h-3.5 w-3.5" /> Ошибка
                            </span>
                          )}
                          {p.status === "refunded" && (
                            <span className="inline-flex items-center gap-1 text-xs text-warning">
                              <Clock className="h-3.5 w-3.5" /> Возврат
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {format(new Date(p.created_at), "d MMM yyyy", { locale: ru })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-4 py-2.5 border-t bg-muted/50 text-xs text-muted-foreground">
                  Итого: ${payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0)}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Activity ── */}
          <TabsContent value="activity">
            <div className="rounded-lg border bg-card divide-y">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="h-7 w-7 rounded-full bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {format(new Date(a.created_at), "d MMM, HH:mm", { locale: ru })}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
    </>
  );
}
