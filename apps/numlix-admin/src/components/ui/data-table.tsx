import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * Составная таблица с встроенной сортировкой, пагинацией и поиском.
 *
 * @example
 * ```tsx
 * const columns: DataTableColumn<User>[] = [
 *   { key: "name", label: "Имя", sortable: true },
 *   { key: "email", label: "Email" },
 *   { key: "salary", label: "Оклад", sortable: true, align: "right",
 *     render: (v) => `${v.toLocaleString("ru-RU")} ₽` },
 * ];
 * <DataTable data={users} columns={columns} pageSize={5} searchable />
 * ```
 */

export interface DataTableColumn<T> {
  /** Ключ поля данных */
  key: keyof T & string;
  /** Заголовок колонки */
  label: string;
  /** Включить сортировку */
  sortable?: boolean;
  /** Выравнивание текста */
  align?: "left" | "center" | "right";
  /** Кастомный рендер ячейки */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** CSS-класс для ячеек */
  className?: string;
}

export interface DataTableProps<T> {
  /** Массив данных */
  data: T[];
  /** Определения колонок */
  columns: DataTableColumn<T>[];
  /** Количество строк на страницу (0 = без пагинации) */
  pageSize?: number;
  /** Включить строку поиска */
  searchable?: boolean;
  /** Плейсхолдер поиска */
  searchPlaceholder?: string;
  /** Поля для поиска (по умолчанию — все строковые) */
  searchKeys?: (keyof T & string)[];
  /** Варианты отображения таблицы */
  striped?: boolean;
  bordered?: boolean;
  size?: "default" | "sm";
  /** Текст при пустом результате */
  emptyText?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 0,
  searchable = false,
  searchPlaceholder = "Поиск...",
  searchKeys,
  striped = false,
  bordered = false,
  size = "default",
  emptyText = "Нет данных",
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(1);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // Determine search keys
  const effectiveSearchKeys = React.useMemo(() => {
    if (searchKeys) return searchKeys;
    if (data.length === 0) return [] as string[];
    return Object.keys(data[0]).filter(
      (k) => typeof data[0][k] === "string"
    ) as (keyof T & string)[];
  }, [data, searchKeys]);

  // Filter
  const filtered = React.useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      effectiveSearchKeys.some((key) =>
        String(row[key]).toLowerCase().includes(q)
      )
    );
  }, [data, query, effectiveSearchKeys]);

  // Sort
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "ru");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1;
  const paged = pageSize > 0 ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  // Reset page on filter change
  React.useEffect(() => { setPage(1); }, [query]);

  return (
    <div className="space-y-3">
      {searchable && (
        <Input
          inputStart={<Search />}
          inputSize="sm"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          clearable
          className="max-w-sm"
        />
      )}

      <div className="rounded-md border">
        <Table size={size} striped={striped} bordered={bordered}>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}
                  sortable={col.sortable}
                  sortDirection={
                    col.sortable
                      ? sortKey === col.key
                        ? sortDir
                        : false
                      : undefined
                  }
                  onSort={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, ri) => (
                <TableRow key={ri}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={[
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "",
                        col.className,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} из{" "}
            {sorted.length}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
