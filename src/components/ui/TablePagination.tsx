import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalCount = 0,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  if (totalPages <= 0) return null;

  const handleRowsPerPageChange = (value: number) => {
    onRowsPerPageChange?.(value);
  };

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between py-3 text-sm text-muted-foreground">
      <div className="pl-2 font-medium text-black">
        Tổng <span className="font-semibold">{totalCount}</span> kết quả
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(v) => handleRowsPerPageChange(Number(v))}
          >
            <SelectTrigger className="w-[70px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm font-medium">dòng</span>
        </div>

        <div className="flex w-[120px] items-center text-sm font-medium">
          <span className="line-clamp-1 overflow-hidden text-ellipsis break-all">
            Trang {currentPage} / {totalPages}
          </span>
        </div>

        {/* Page navigation */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                className={`cursor-pointer ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
                onClick={() => onPageChange(1)}
              >
                <ChevronsLeft />
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationPrevious
                className={`${
                  currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              />
            </PaginationItem>

            {startPage > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                className={`${
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                className={`cursor-pointer ${
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
                onClick={() => onPageChange(totalPages)}
              >
                <ChevronsRight />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
