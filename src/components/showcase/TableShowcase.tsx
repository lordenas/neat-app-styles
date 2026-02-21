import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data = [
  { id: 1, name: "Иванов Иван", position: "Разработчик", experience: "5 лет", salary: "180 000 ₽" },
  { id: 2, name: "Петрова Мария", position: "Дизайнер", experience: "3 года", salary: "140 000 ₽" },
  { id: 3, name: "Сидоров Алексей", position: "Менеджер", experience: "7 лет", salary: "200 000 ₽" },
  { id: 4, name: "Козлова Анна", position: "Аналитик", experience: "2 года", salary: "120 000 ₽" },
  { id: 5, name: "Морозов Дмитрий", position: "Тестировщик", experience: "4 года", salary: "150 000 ₽" },
];

export function TableShowcase() {
  return (
    <div className="rounded-md border">
      <Table>
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
          {data.map((row, i) => (
            <TableRow key={row.id} className={i % 2 === 1 ? "table-stripe" : ""}>
              <TableCell className="font-mono text-muted-foreground">{row.id}</TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.position}</TableCell>
              <TableCell>{row.experience}</TableCell>
              <TableCell className="text-right font-mono">{row.salary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
