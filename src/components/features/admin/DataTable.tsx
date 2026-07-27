"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const siblings = 1;
  const leftSiblingIndex = Math.max(currentPage - siblings, 1);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 3;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 5;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 5;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [1, "...", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, "...", ...middleRange, "...", totalPages];
}

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  emptyMessage = "No records found",
  keyExtractor,
}: Props<T>) {
  const totalPages = Math.ceil(total / limit);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead key={String(col.key)} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={keyExtractor(row)} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between text-sm">
          <span className="text-muted-foreground text-center sm:text-left">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground text-xs"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = page === p;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(p as number)}
                  disabled={isCurrent}
                  className={cn(
                    "h-8 w-8 p-0 text-xs font-semibold transition-all",
                    isCurrent
                      ? "bg-dark text-white hover:bg-dark cursor-default disabled:opacity-100"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
