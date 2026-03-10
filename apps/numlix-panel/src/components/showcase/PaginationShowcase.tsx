import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaginationShowcase() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  const visible = getVisiblePages();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Страница <span className="font-medium text-foreground">{page}</span> из {totalPages}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {visible[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>1</PaginationLink>
              </PaginationItem>
              {visible[0] > 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            </>
          )}

          {visible.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={(e) => { e.preventDefault(); setPage(p); }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {visible[visible.length - 1] < totalPages && (
            <>
              {visible[visible.length - 1] < totalPages - 1 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
