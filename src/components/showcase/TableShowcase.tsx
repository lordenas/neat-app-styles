import { useState, useMemo, useRef, useCallback, useEffect, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronDown, Loader2, Search, X } from "lucide-react";

/* ─── Data ─── */
const employees = [
  { id: 1, name: "Иванов Иван", department: "Разработка", position: "Разработчик", experience: "5 лет", salary: 180000 },
  { id: 2, name: "Петрова Мария", department: "Дизайн", position: "Дизайнер", experience: "3 года", salary: 140000 },
  { id: 3, name: "Сидоров Алексей", department: "Управление", position: "Менеджер", experience: "7 лет", salary: 200000 },
  { id: 4, name: "Козлова Анна", department: "Разработка", position: "Аналитик", experience: "2 года", salary: 120000 },
  { id: 5, name: "Морозов Дмитрий", department: "Разработка", position: "Тестировщик", experience: "4 года", salary: 150000 },
  { id: 6, name: "Волкова Елена", department: "Дизайн", position: "UX-дизайнер", experience: "6 лет", salary: 170000 },
  { id: 7, name: "Новиков Сергей", department: "Управление", position: "Директор", experience: "10 лет", salary: 300000 },
  { id: 8, name: "Фёдорова Ольга", department: "Разработка", position: "Фронтенд", experience: "3 года", salary: 160000 },
  { id: 9, name: "Егоров Павел", department: "Разработка", position: "Бэкенд", experience: "5 лет", salary: 190000 },
  { id: 10, name: "Лебедева Ирина", department: "Дизайн", position: "Арт-директор", experience: "8 лет", salary: 220000 },
  { id: 11, name: "Смирнов Андрей", department: "Управление", position: "PM", experience: "4 года", salary: 180000 },
  { id: 12, name: "Кузнецова Дарья", department: "Разработка", position: "DevOps", experience: "3 года", salary: 175000 },
];

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";

/* ─── 1. Default / Variants ─── */
function BasicTable({ size, bordered, striped }: { size?: "default" | "sm"; bordered?: boolean; striped?: boolean }) {
  return (
    <div className="rounded-md border">
      <Table size={size} bordered={bordered} striped={striped}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>ФИО</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Стаж</TableHead>
            <TableHead className="text-right">Оклад</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.slice(0, 5).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-muted-foreground">{row.id}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.position}</TableCell>
              <TableCell>{row.experience}</TableCell>
              <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─── 2. Merged Cells ─── */
function MergedCellsTable() {
  const scheduleData = [
    { time: "09:00", mon: "Standup", tue: "Standup", wed: "Standup", thu: "Standup", fri: "Standup" },
    { time: "10:00", mon: "Разработка", tue: "Разработка", wed: "Code Review", thu: "Разработка", fri: "Разработка" },
    { time: "14:00", mon: "Планирование", tue: "Разработка", wed: "Ретро", thu: "Разработка", fri: "Демо" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Расписание недели с объединёнными ячейками (<code className="text-xs bg-muted px-1 rounded">colSpan</code>, <code className="text-xs bg-muted px-1 rounded">rowSpan</code>)</p>
      <div className="rounded-md border">
        <Table bordered>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Время</TableHead>
              <TableHead>Пн</TableHead>
              <TableHead>Вт</TableHead>
              <TableHead>Ср</TableHead>
              <TableHead>Чт</TableHead>
              <TableHead>Пт</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Row 1: standup spans all 5 days */}
            <TableRow>
              <TableCell className="font-mono text-muted-foreground">09:00</TableCell>
              <TableCell colSpan={5} className="text-center bg-primary/5 font-medium">
                Daily Standup
              </TableCell>
            </TableRow>
            {/* Row 2-3: development spans 2 rows */}
            <TableRow>
              <TableCell className="font-mono text-muted-foreground">10:00</TableCell>
              <TableCell rowSpan={2} className="align-middle bg-primary/5 font-medium">
                Разработка
              </TableCell>
              <TableCell>Разработка</TableCell>
              <TableCell className="bg-warning/10">Code Review</TableCell>
              <TableCell>Разработка</TableCell>
              <TableCell rowSpan={2} className="align-middle bg-primary/5 font-medium">
                Разработка
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-muted-foreground">14:00</TableCell>
              <TableCell className="bg-info/10">Планирование</TableCell>
              <TableCell className="bg-warning/10">Ретро</TableCell>
              <TableCell>Разработка</TableCell>
            </TableRow>
            {/* Row 4: footer-like summary */}
            <TableRow>
              <TableCell className="font-mono text-muted-foreground">17:00</TableCell>
              <TableCell colSpan={3} className="text-center bg-success/5 font-medium">
                Свободное время / Обучение
              </TableCell>
              <TableCell colSpan={2} className="text-center bg-info/5 font-medium">
                Демо + Ретро
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ─── 3. Sorting (client) ─── */
type SortKey = "name" | "salary" | "experience";
type SortDir = "asc" | "desc";

function SortableTable() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    const expYears = (s: string) => parseInt(s);
    return [...employees].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "ru");
      if (sortKey === "salary") cmp = a.salary - b.salary;
      if (sortKey === "experience") cmp = expYears(a.experience) - expYears(b.experience);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Клик по заголовку — клиентская сортировка</p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>
                <button onClick={() => toggle("name")} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                  ФИО <SortIcon col="name" />
                </button>
              </TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>
                <button onClick={() => toggle("experience")} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                  Стаж <SortIcon col="experience" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggle("salary")} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors float-right">
                  Оклад <SortIcon col="salary" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.experience}</TableCell>
                <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ─── 3b. Server-side sorting simulation ─── */
function ServerSortTable() {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(employees.slice(0, 5));

  const fetchSorted = (key: SortKey, dir: SortDir) => {
    setLoading(true);
    setTimeout(() => {
      const expYears = (s: string) => parseInt(s);
      const sorted = [...employees].sort((a, b) => {
        let cmp = 0;
        if (key === "name") cmp = a.name.localeCompare(b.name, "ru");
        if (key === "salary") cmp = a.salary - b.salary;
        if (key === "experience") cmp = expYears(a.experience) - expYears(b.experience);
        return dir === "asc" ? cmp : -cmp;
      });
      setData(sorted.slice(0, 5));
      setLoading(false);
    }, 800);
  };

  const toggle = (key: SortKey) => {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    fetchSorted(key, newDir);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">Имитация серверной сортировки (задержка 800ms)</p>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>
                <button onClick={() => toggle("name")} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                  ФИО <SortIcon col="name" />
                </button>
              </TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>
                <button onClick={() => toggle("experience")} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                  Стаж <SortIcon col="experience" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button onClick={() => toggle("salary")} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors float-right">
                  Оклад <SortIcon col="salary" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={row.id} className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
                <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.experience}</TableCell>
                <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ─── 4. Pagination ─── */
function PaginatedTable() {
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(employees.length / pageSize);
  const paged = employees.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Пагинация — {employees.length} записей, по {pageSize} на страницу</p>
      <div className="rounded-md border">
        <Table striped>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Отдел</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead className="text-right">Оклад</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-muted-foreground">{row.id}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Показано {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, employees.length)} из {employees.length}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

/* ─── 5. Grouped ─── */
function GroupedTable() {
  const groups = useMemo(() => {
    const map = new Map<string, typeof employees>();
    employees.forEach(e => {
      const arr = map.get(e.department) || [];
      arr.push(e);
      map.set(e.department, arr);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Строки группируются по отделу, с итогами по каждой группе</p>
      <div className="rounded-md border">
        <Table bordered>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Стаж</TableHead>
              <TableHead className="text-right">Оклад</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(([dept, members]) => (
              <Fragment key={dept}>
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted/70 font-semibold text-sm">
                    {dept}
                    <Badge variant="secondary" className="ml-2 text-xs">{members.length}</Badge>
                  </TableCell>
                </TableRow>
                {members.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-muted-foreground pl-6">{row.id}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.experience}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right text-xs text-muted-foreground bg-muted/30">
                    Итого по «{dept}»:
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold bg-muted/30">
                    {fmt(members.reduce((s, m) => s + m.salary, 0))}
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right font-semibold">Всего:</TableCell>
              <TableCell className="text-right font-mono font-bold">
                {fmt(employees.reduce((s, e) => s + e.salary, 0))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

/* ─── 6. Master-Detail ─── */
const detailData: Record<number, { tasks: string[]; email: string; phone: string }> = {
  1: { tasks: ["Рефакторинг API", "Code review", "Документация"], email: "ivanov@co.ru", phone: "+7 900 111-22-33" },
  2: { tasks: ["Макет главной", "UI Kit обновление"], email: "petrova@co.ru", phone: "+7 900 222-33-44" },
  3: { tasks: ["Квартальный отчёт", "Найм", "OKR"], email: "sidorov@co.ru", phone: "+7 900 333-44-55" },
  4: { tasks: ["Анализ метрик", "A/B тест"], email: "kozlova@co.ru", phone: "+7 900 444-55-66" },
  5: { tasks: ["Автотесты", "Регрессия", "CI/CD"], email: "morozov@co.ru", phone: "+7 900 555-66-77" },
};

function MasterDetailTable() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Клик по строке раскрывает детальную информацию</p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Стаж</TableHead>
              <TableHead className="text-right">Оклад</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.slice(0, 5).map((row) => {
              const isOpen = expanded.has(row.id);
              const detail = detailData[row.id];
              return (
                <Fragment key={row.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => toggleRow(row.id)}
                  >
                    <TableCell className="px-2">
                      {isOpen
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.experience}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
                  </TableRow>
                  {isOpen && detail && (
                    <TableRow>
                      <TableCell />
                      <TableCell colSpan={4} className="bg-muted/30 py-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Контакты</p>
                            <p>{detail.email}</p>
                            <p>{detail.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Текущие задачи</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {detail.tasks.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ─── 7. Lookup Filter ─── */
function LookupFilterTable() {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  const departments = useMemo(() => [...new Set(employees.map(e => e.department))], []);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchesQuery = !query ||
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.position.toLowerCase().includes(query.toLowerCase());
      const matchesDept = !deptFilter || e.department === deptFilter;
      return matchesQuery && matchesDept;
    });
  }, [query, deptFilter]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Поиск по ФИО/должности + фильтр по отделу</p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Поиск по ФИО или должности…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8 pr-8"
            inputSize="sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Очистить поиск"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant={deptFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setDeptFilter(null)}
          >
            Все
          </Button>
          {departments.map(dept => (
            <Button
              key={dept}
              variant={deptFilter === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setDeptFilter(deptFilter === dept ? null : dept)}
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>
      <div className="rounded-md border">
        <Table striped>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Отдел</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead className="text-right">Оклад</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Ничего не найдено
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">{row.department}</Badge>
                  </TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell className="text-right font-mono">{fmt(row.salary)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Найдено: {filtered.length} из {employees.length}
      </p>
    </div>
  );
}

/* ─── 8. Keyboard Navigation ─── */
const GRID_ROWS = 5;
const GRID_COLS = 5;

function KeyboardNavTable() {
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(0);
  const [copied, setCopied] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const data = employees.slice(0, GRID_ROWS);
  const columns = ["id", "name", "position", "experience", "salary"] as const;
  const colHeaders = ["#", "ФИО", "Должность", "Стаж", "Оклад"];

  const getCellValue = useCallback((row: typeof data[0], col: typeof columns[number]) => {
    if (col === "salary") return fmt(row.salary);
    return String(row[col]);
  }, [data]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newRow = activeRow;
    let newCol = activeCol;

    if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const value = getCellValue(data[activeRow], columns[activeCol]);
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
      return;
    }

    switch (e.key) {
      case "ArrowUp":    newRow = Math.max(0, activeRow - 1); break;
      case "ArrowDown":  newRow = Math.min(GRID_ROWS - 1, activeRow + 1); break;
      case "ArrowLeft":  newCol = Math.max(0, activeCol - 1); break;
      case "ArrowRight": newCol = Math.min(GRID_COLS - 1, activeCol + 1); break;
      case "Home":
        if (e.ctrlKey) { newRow = 0; newCol = 0; }
        else { newCol = 0; }
        break;
      case "End":
        if (e.ctrlKey) { newRow = GRID_ROWS - 1; newCol = GRID_COLS - 1; }
        else { newCol = GRID_COLS - 1; }
        break;
      default: return;
    }
    e.preventDefault();
    setActiveRow(newRow);
    setActiveCol(newCol);
  }, [activeRow, activeCol, getCellValue, data, columns]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Кликните по таблице и используйте <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">←</kbd>{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">→</kbd>{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">↑</kbd>{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">↓</kbd> для навигации.{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">Home</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">End</kbd> — начало/конец строки.{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">Ctrl+Home</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">Ctrl+End</kbd> — начало/конец таблицы.{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs font-mono">Ctrl+C</kbd> — копировать содержимое ячейки.
      </p>
      <div className="rounded-md border">
        <Table bordered>
          <TableHeader>
            <TableRow>
              {colHeaders.map((h, ci) => (
                <TableHead key={ci} className={ci === 0 ? "w-12" : ci === GRID_COLS - 1 ? "text-right" : ""}>
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, ri) => (
              <TableRow key={row.id}>
                {columns.map((col, ci) => {
                  const isActive = ri === activeRow && ci === activeCol;
                  return (
                    <TableCell
                      key={col}
                      ref={el => {
                        if (isActive && el) el.focus();
                      }}
                      tabIndex={isActive ? 0 : -1}
                      role="gridcell"
                      aria-rowindex={ri + 1}
                      aria-colindex={ci + 1}
                      onClick={() => { setActiveRow(ri); setActiveCol(ci); }}
                      onKeyDown={handleKeyDown}
                      className={[
                        "cursor-pointer transition-all outline-none select-none",
                        col === "id" ? "font-mono text-muted-foreground" : "",
                        col === "name" ? "font-medium" : "",
                        col === "salary" ? "text-right font-mono" : "",
                        isActive
                          ? "ring-2 ring-primary ring-inset bg-primary/5"
                          : "hover:bg-muted/50",
                      ].filter(Boolean).join(" ")}
                    >
                      {getCellValue(row, col)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Активная ячейка:</span>
        <Badge variant="secondary" className="font-mono text-xs">
          строка {activeRow + 1}, столбец {activeCol + 1}
        </Badge>
        <span className="text-muted-foreground/50">|</span>
        <span className="font-medium text-foreground">
          {getCellValue(data[activeRow], columns[activeCol])}
        </span>
        {copied && (
          <>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-success font-medium animate-in fade-in">✓ Скопировано</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── 9. Kitchen Sink — все фичи в одной таблице ─── */
type KSSortKey = "name" | "department" | "position" | "salary";

const detailDataFull: Record<number, { tasks: string[]; email: string; phone: string }> = {
  1: { tasks: ["Рефакторинг API", "Code review", "Документация"], email: "ivanov@co.ru", phone: "+7 900 111-22-33" },
  2: { tasks: ["Макет главной", "UI Kit обновление"], email: "petrova@co.ru", phone: "+7 900 222-33-44" },
  3: { tasks: ["Квартальный отчёт", "Найм", "OKR"], email: "sidorov@co.ru", phone: "+7 900 333-44-55" },
  4: { tasks: ["Анализ метрик", "A/B тест"], email: "kozlova@co.ru", phone: "+7 900 444-55-66" },
  5: { tasks: ["Автотесты", "Регрессия", "CI/CD"], email: "morozov@co.ru", phone: "+7 900 555-66-77" },
  6: { tasks: ["Мудборды", "Прототипы"], email: "volkova@co.ru", phone: "+7 900 666-77-88" },
  7: { tasks: ["Стратегия", "Бюджет Q2"], email: "novikov@co.ru", phone: "+7 900 777-88-99" },
  8: { tasks: ["React 19 миграция", "SSR"], email: "fedorova@co.ru", phone: "+7 900 888-99-00" },
  9: { tasks: ["Микросервисы", "gRPC"], email: "egorov@co.ru", phone: "+7 900 999-00-11" },
  10: { tasks: ["Бренд-бук", "Ребрендинг"], email: "lebedeva@co.ru", phone: "+7 900 000-11-22" },
  11: { tasks: ["Roadmap", "Спринт-планирование"], email: "smirnov@co.ru", phone: "+7 900 111-33-44" },
  12: { tasks: ["Kubernetes", "Terraform"], email: "kuznecova@co.ru", phone: "+7 900 222-44-55" },
};

function KitchenSinkTable() {
  // Search
  const [query, setQuery] = useState("");
  // Dept filter
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const departments = useMemo(() => [...new Set(employees.map(e => e.department))], []);
  // Sort
  const [sortKey, setSortKey] = useState<KSSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  // Pagination
  const pageSize = 5;
  const [page, setPage] = useState(1);
  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // Master-detail
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  // Keyboard
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [activeCol, setActiveCol] = useState(0);
  // Copy
  const [copied, setCopied] = useState(false);

  const toggleSort = (key: KSSortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  // Filter → Sort → Paginate
  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchQ = !query ||
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.position.toLowerCase().includes(query.toLowerCase());
      const matchD = !deptFilter || e.department === deptFilter;
      return matchQ && matchD;
    });
  }, [query, deptFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "ru");
      if (sortKey === "department") cmp = a.department.localeCompare(b.department, "ru");
      if (sortKey === "position") cmp = a.position.localeCompare(b.position, "ru");
      if (sortKey === "salary") cmp = a.salary - b.salary;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Selection
  const allOnPageSelected = paged.length > 0 && paged.every(r => selected.has(r.id));
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) paged.forEach(r => next.delete(r.id));
      else paged.forEach(r => next.add(r.id));
      return next;
    });
  };
  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Expand
  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Sort icon
  const SortIcon = ({ col }: { col: KSSortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  const SortBtn = ({ col, children }: { col: KSSortKey; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children} <SortIcon col={col} />
    </button>
  );

  // Columns for keyboard nav
  const cols = ["expand", "select", "name", "department", "position", "salary"] as const;
  const colCount = cols.length;

  const getCellText = (row: typeof employees[0], ci: number) => {
    switch (cols[ci]) {
      case "name": return row.name;
      case "department": return row.department;
      case "position": return row.position;
      case "salary": return fmt(row.salary);
      default: return "";
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent, ri: number) => {
    // Copy
    if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const text = getCellText(paged[ri], activeCol);
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }
      return;
    }

    let newRow = ri;
    let newCol = activeCol;
    switch (e.key) {
      case "ArrowUp":    newRow = Math.max(0, ri - 1); break;
      case "ArrowDown":  newRow = Math.min(paged.length - 1, ri + 1); break;
      case "ArrowLeft":  newCol = Math.max(0, activeCol - 1); break;
      case "ArrowRight": newCol = Math.min(colCount - 1, activeCol + 1); break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (cols[activeCol] === "expand") toggleExpand(paged[ri].id);
        if (cols[activeCol] === "select") toggleOne(paged[ri].id);
        return;
      default: return;
    }
    e.preventDefault();
    setActiveRow(newRow);
    setActiveCol(newCol);
  }, [activeCol, paged]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [query, deptFilter]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Поиск + фильтр по отделу + сортировка + пагинация + выделение строк + master-detail + навигация клавишами + <kbd className="px-1 py-0.5 bg-muted rounded border text-xs font-mono">Ctrl+C</kbd>
      </p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Поиск…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8 pr-8"
            inputSize="sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Очистить">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant={deptFilter === null ? "default" : "outline"} size="sm" onClick={() => setDeptFilter(null)}>Все</Button>
          {departments.map(d => (
            <Button key={d} variant={deptFilter === d ? "default" : "outline"} size="sm" onClick={() => setDeptFilter(deptFilter === d ? null : d)}>{d}</Button>
          ))}
        </div>
        {selected.size > 0 && (
          <Badge variant="secondary" className="text-xs">
            Выбрано: {selected.size}
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table bordered striped>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAll}
                  className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                  aria-label="Выбрать все на странице"
                />
              </TableHead>
              <TableHead><SortBtn col="name">ФИО</SortBtn></TableHead>
              <TableHead><SortBtn col="department">Отдел</SortBtn></TableHead>
              <TableHead><SortBtn col="position">Должность</SortBtn></TableHead>
              <TableHead className="text-right">
                <span className="float-right"><SortBtn col="salary">Оклад</SortBtn></span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Ничего не найдено</TableCell>
              </TableRow>
            ) : (
              paged.map((row, ri) => {
                const isExp = expanded.has(row.id);
                const isSel = selected.has(row.id);
                const detail = detailDataFull[row.id];
                return (
                  <Fragment key={row.id}>
                    <TableRow className={isSel ? "bg-primary/5" : ""}>
                      {cols.map((col, ci) => {
                        const isActive = activeRow === ri && activeCol === ci;
                        const common = [
                          "outline-none transition-all",
                          isActive ? "ring-2 ring-primary ring-inset bg-primary/5" : "",
                        ].filter(Boolean).join(" ");

                        if (col === "expand") {
                          return (
                            <TableCell
                              key={col}
                              tabIndex={isActive ? 0 : -1}
                              ref={el => { if (isActive && el) el.focus(); }}
                              onClick={() => { toggleExpand(row.id); setActiveRow(ri); setActiveCol(ci); }}
                              onKeyDown={e => handleKeyDown(e, ri)}
                              className={`px-2 cursor-pointer ${common}`}
                            >
                              {isExp
                                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </TableCell>
                          );
                        }
                        if (col === "select") {
                          return (
                            <TableCell
                              key={col}
                              tabIndex={isActive ? 0 : -1}
                              ref={el => { if (isActive && el) el.focus(); }}
                              onClick={() => { setActiveRow(ri); setActiveCol(ci); }}
                              onKeyDown={e => handleKeyDown(e, ri)}
                              className={common}
                            >
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => toggleOne(row.id)}
                                className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                                aria-label={`Выбрать ${row.name}`}
                              />
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell
                            key={col}
                            tabIndex={isActive ? 0 : -1}
                            ref={el => { if (isActive && el) el.focus(); }}
                            onClick={() => { setActiveRow(ri); setActiveCol(ci); }}
                            onKeyDown={e => handleKeyDown(e, ri)}
                            className={[
                              common,
                              col === "name" ? "font-medium" : "",
                              col === "department" ? "" : "",
                              col === "salary" ? "text-right font-mono" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            {col === "department" ? (
                              <Badge variant="outline" className="text-xs font-normal">{row.department}</Badge>
                            ) : (
                              getCellText(row, ci)
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {isExp && detail && (
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell colSpan={4} className="bg-muted/30 py-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Контакты</p>
                              <p>{detail.email}</p>
                              <p>{detail.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Текущие задачи</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {detail.tasks.map((t, i) => <li key={i}>{t}</li>)}
                              </ul>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-right font-semibold">Итого (страница):</TableCell>
              <TableCell className="text-right font-mono font-bold">
                {fmt(paged.reduce((s, e) => s + e.salary, 0))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Footer: pagination + status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} из {sorted.length}
          </span>
          {activeRow !== null && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>Ячейка: [{activeRow + 1}, {activeCol + 1}]</span>
            </>
          )}
          {copied && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-success font-medium animate-in fade-in">✓ Скопировано</span>
            </>
          )}
        </div>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

/* ─── Export ─── */
export function TableShowcase() {
  return (
    <Tabs defaultValue="default" className="space-y-3">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="default">Default</TabsTrigger>
        <TabsTrigger value="striped">Striped</TabsTrigger>
        <TabsTrigger value="bordered">Bordered</TabsTrigger>
        <TabsTrigger value="small">Small</TabsTrigger>
        <TabsTrigger value="merged">Объединение</TabsTrigger>
        <TabsTrigger value="sort">Сортировка</TabsTrigger>
        <TabsTrigger value="server-sort">Сервер</TabsTrigger>
        <TabsTrigger value="pagination">Пагинация</TabsTrigger>
        <TabsTrigger value="grouped">Группировка</TabsTrigger>
        <TabsTrigger value="master">Master-Detail</TabsTrigger>
        <TabsTrigger value="lookup">Lookup-фильтр</TabsTrigger>
        <TabsTrigger value="keyboard">Клавиатура</TabsTrigger>
        <TabsTrigger value="kitchen-sink">⚡ Всё вместе</TabsTrigger>
      </TabsList>
      <TabsContent value="default"><BasicTable /></TabsContent>
      <TabsContent value="striped"><BasicTable striped /></TabsContent>
      <TabsContent value="bordered"><BasicTable bordered /></TabsContent>
      <TabsContent value="small"><BasicTable size="sm" /></TabsContent>
      <TabsContent value="merged"><MergedCellsTable /></TabsContent>
      <TabsContent value="sort"><SortableTable /></TabsContent>
      <TabsContent value="server-sort"><ServerSortTable /></TabsContent>
      <TabsContent value="pagination"><PaginatedTable /></TabsContent>
      <TabsContent value="grouped"><GroupedTable /></TabsContent>
      <TabsContent value="master"><MasterDetailTable /></TabsContent>
      <TabsContent value="lookup"><LookupFilterTable /></TabsContent>
      <TabsContent value="keyboard"><KeyboardNavTable /></TabsContent>
      <TabsContent value="kitchen-sink"><KitchenSinkTable /></TabsContent>
    </Tabs>
  );
}
