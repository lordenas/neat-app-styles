import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Таблица с поддержкой вариантов отображения.
 *
 * @example
 * ```tsx
 * <Table size="sm" bordered striped>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Имя</TableHead>
 *       <TableHead>Роль</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Иван</TableCell>
 *       <TableCell>Админ</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 *
 * @prop size - Размер текста: `"default"` | `"sm"`
 * @prop bordered - Обводка ячеек
 * @prop striped - Чередование фона строк
 * @prop hoverable - Подсветка строки при наведении (по умолчанию `true`)
 */
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  size?: "default" | "sm";
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, size, bordered, striped, hoverable = true, ...props }, ref) => (
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom",
        size === "sm" ? "text-xs" : "text-sm",
        bordered && "[&_th]:border [&_td]:border",
        striped && "[&_tbody_tr:nth-child(even)]:bg-[hsl(var(--stripe-bg))]",
        hoverable && "[&_tbody_tr:hover]:bg-muted/50",
        className
      )}
      {...props}
    />
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b transition-colors data-[state=selected]:bg-muted", className)}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Включает кнопку сортировки в заголовке */
  sortable?: boolean;
  /** Текущее направление сортировки */
  sortDirection?: "asc" | "desc" | false;
  /** Колбэк при клике на сортировку */
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => {
    const content = sortable ? (
      <button
        type="button"
        onClick={onSort}
        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        {children}
        {sortDirection === "asc" && (
          <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5m-7 7 7-7 7 7" /></svg>
        )}
        {sortDirection === "desc" && (
          <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m7-7-7 7-7-7" /></svg>
        )}
        {sortDirection === false && (
          <svg className="h-3.5 w-3.5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /><path d="m7 8 5-5 5 5M7 16l5 5 5-5" /></svg>
        )}
      </button>
    ) : (
      children
    );

    return (
      <th
        ref={ref}
        className={cn(
          "h-10 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {content}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("px-3 py-2.5 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
