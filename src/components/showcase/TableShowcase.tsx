import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const data = [
  { id: 1, name: "Иванов Иван", position: "Разработчик", experience: "5 лет", salary: "180 000 ₽" },
  { id: 2, name: "Петрова Мария", position: "Дизайнер", experience: "3 года", salary: "140 000 ₽" },
  { id: 3, name: "Сидоров Алексей", position: "Менеджер", experience: "7 лет", salary: "200 000 ₽" },
  { id: 4, name: "Козлова Анна", position: "Аналитик", experience: "2 года", salary: "120 000 ₽" },
  { id: 5, name: "Морозов Дмитрий", position: "Тестировщик", experience: "4 года", salary: "150 000 ₽" },
];

function TableContent({ size, bordered, striped }: { size?: "default" | "sm"; bordered?: boolean; striped?: boolean }) {
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
          {data.map((row) => (
            <TableRow key={row.id}>
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

export function TableShowcase() {
  return (
    <Tabs defaultValue="default" className="space-y-3">
      <TabsList>
        <TabsTrigger value="default">Default</TabsTrigger>
        <TabsTrigger value="striped">Striped</TabsTrigger>
        <TabsTrigger value="bordered">Bordered</TabsTrigger>
        <TabsTrigger value="small">Small</TabsTrigger>
        <TabsTrigger value="all">All options</TabsTrigger>
      </TabsList>
      <TabsContent value="default">
        <TableContent />
      </TabsContent>
      <TabsContent value="striped">
        <TableContent striped />
      </TabsContent>
      <TabsContent value="bordered">
        <TableContent bordered />
      </TabsContent>
      <TabsContent value="small">
        <TableContent size="sm" />
      </TabsContent>
      <TabsContent value="all">
        <TableContent size="sm" bordered striped />
      </TabsContent>
    </Tabs>
  );
}
