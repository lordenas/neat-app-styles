import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Users } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type Plan = "free" | "pro" | "business";
type SortKey = "display_name" | "email" | "plan" | "created_at";
type SortDir = "asc" | "desc";

interface MockUser {
  id: string;
  email: string;
  display_name: string;
  plan: Plan;
  status: "active" | "inactive";
  created_at: string;
}

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

const PLAN_LABELS: Record<Plan, string> = { free: "Free", pro: "Pro", business: "Business" };

function PlanBadge({ plan }: { plan: Plan }) {
  const cls: Record<Plan, string> = {
    free: "bg-muted text-muted-foreground border border-border",
    pro: "bg-primary text-primary-foreground",
    business: "bg-accent text-accent-foreground border border-border-strong",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls[plan]}`}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
  return sortDir === "asc"
    ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
    : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let data = MOCK_USERS;

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) => u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q)
      );
    }
    if (planFilter !== "all") data = data.filter((u) => u.plan === planFilter);
    if (statusFilter !== "all") data = data.filter((u) => u.status === statusFilter);

    data = [...data].sort((a, b) => {
      let va = a[sortKey] as string;
      let vb = b[sortKey] as string;
      const cmp = va.localeCompare(vb, "ru");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [search, planFilter, statusFilter, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total: MOCK_USERS.length,
    pro: MOCK_USERS.filter((u) => u.plan === "pro").length,
    business: MOCK_USERS.filter((u) => u.plan === "business").length,
    active: MOCK_USERS.filter((u) => u.status === "active").length,
  }), []);

  return (
    <AdminLayout
      title="Пользователи"
      description="Управление пользователями платформы"
    >
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Всего", value: stats.total, icon: Users },
            { label: "Активных", value: stats.active, sub: "из " + stats.total },
            { label: "Pro", value: stats.pro },
            { label: "Business", value: stats.business },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
              {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Поиск по имени или email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as Plan | "all")}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Все планы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все планы</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "active" | "inactive" | "all")}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
          {(search || planFilter !== "all" || statusFilter !== "all") && (
            <Button variant="ghost" size="default" onClick={() => { setSearch(""); setPlanFilter("all"); setStatusFilter("all"); }}>
              Сбросить
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>
                  <button
                    onClick={() => handleSort("display_name")}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors"
                  >
                    Пользователь <SortIcon col="display_name" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors"
                  >
                    Email <SortIcon col="email" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("plan")}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors"
                  >
                    План <SortIcon col="plan" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">Статус</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors"
                  >
                    Регистрация <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {user.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <PlanBadge plan={user.plan} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${user.status === "active" ? "text-success" : "text-muted-foreground"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                        {user.status === "active" ? "Активен" : "Неактивен"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {format(new Date(user.created_at), "d MMM yyyy", { locale: ru })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t bg-muted/20 text-xs text-muted-foreground">
              Показано {filtered.length} из {MOCK_USERS.length} пользователей
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
