import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  experience: string;
  salary: number;
}

const data: Employee[] = [
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
];

const columns: DataTableColumn<Employee>[] = [
  { key: "id", label: "#", className: "font-mono text-muted-foreground w-12" },
  { key: "name", label: "ФИО", sortable: true, className: "font-medium" },
  {
    key: "department",
    label: "Отдел",
    sortable: true,
    render: (v) => <Badge variant="outline" className="text-xs font-normal">{String(v)}</Badge>,
  },
  { key: "position", label: "Должность" },
  { key: "experience", label: "Стаж" },
  {
    key: "salary",
    label: "Оклад",
    sortable: true,
    align: "right",
    className: "font-mono",
    render: (v) => `${Number(v).toLocaleString("ru-RU")} ₽`,
  },
];

export function DataTableShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">DataTable с поиском, сортировкой и пагинацией</p>
        <DataTable
          data={data}
          columns={columns}
          pageSize={5}
          searchable
          searchPlaceholder="Поиск по ФИО, отделу, должности..."
          searchKeys={["name", "department", "position"]}
          striped
        />
      </div>

      <p className="helper-text">
        Составной компонент <code className="text-xs bg-muted px-1 py-0.5 rounded">DataTable</code> — обёртка над Table + Pagination + Input с встроенной клиентской сортировкой и фильтрацией.
      </p>
    </div>
  );
}
